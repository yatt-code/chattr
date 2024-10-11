require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAIApi, Configuration } = require('openai');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const https = require('https');
const fs = require('fs');
const natural = require('natural');
const classifier = new natural.BayesClassifier();
const logger = require('./logger');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { createServer } = require('http');
const { connectToDatabase } = require('./db');
const axios = require('axios');

// Train the classifier (you'd do this with more examples)
classifier.addDocument('Can you create an image of a cat?', 'image');
classifier.addDocument('Generate a picture of a sunset', 'image');
classifier.addDocument('What\'s the weather like today?', 'text');
classifier.train();

const app = express();
let db;

// Add this near the top of your file
const axiosInstance = axios.create({
  timeout: 55000 // 55 seconds timeout for OpenAI API calls
});

// Near the top of your file, after the imports
console.log('OpenAI API Key (first 5 chars):', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : 'Not set');

// Replace the existing openai configuration with this
const openai = new OpenAIApi(new Configuration({ 
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Add this line if you have an org ID
}));

async function startServer() {
  try {
    db = await connectToDatabase();
    const server = createServer(app);
    
    const PORT = process.env.PORT || 5050;
    server.listen(PORT);

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is in use, trying another port...`);
        server.listen(0); // This will choose a random available port
      } else {
        console.error('Server error:', e);
        process.exit(1);
      }
    });

    server.on('listening', () => {
      const address = server.address();
      console.log(`Server running on port ${address.port}`);
      
      // If you want to save the port to a file that the frontend can read:
      const fs = require('fs');
      fs.writeFileSync('server-port.txt', address.port.toString());
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

  // Implement HSTS
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }));

  // Redirect HTTP to HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Security middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://ai.yatt.codes'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Update the isImageGenerationRequest function
function isImageGenerationRequest(message, context = []) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Check for explicit commands
  if (message.toLowerCase().startsWith('/image') || message.toLowerCase().startsWith('/generate image')) {
    return true;
  }

  // Use NLP classification
  const classification = classifier.classify(message);
  if (classification === 'image') {
    return true;
  }

  // Fallback to keyword matching
  const imageKeywords = ['generate image', 'create image', 'make image', 'draw', 'picture of'];
  return imageKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Use the middleware
app.use(ClerkExpressWithAuth());

// Update the authentication check in your routes
app.use((req, res, next) => {
  if (!req.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Update the rate limiter to only apply to POST requests
const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // limit each user to 10 image generations per hour
  message: "Too many image generation requests, please try again later.",
  keyGenerator: (req) => req.auth.userId, // Use the user's ID as the key
  skip: (req) => {
    if (req.method !== 'POST') return true; // Skip for non-POST requests
    return !isImageGenerationRequest(req.body.message); // Only apply to image generation requests
  }
});

// Apply this limiter only to the chat POST route
app.post('/api/chat', imageGenerationLimiter, async (req, res) => {
  console.log('Received chat request');
  const startTime = Date.now();
  try {
    const { message } = req.body;
    const userId = req.auth.userId;

    console.log('Processing chat request for user:', userId);
    console.log('Message:', message);

    console.log('Storing user message...');
    await storeMessage(userId, message, 'user');
    console.log('User message stored');

    if (typeof message !== 'string' || message.length > 1000) {
      console.log('Invalid message format or length');
      return res.status(400).json({ error: 'Invalid message format or length' });
    }

    let response;
    let tokenUsage = 0;

    console.log('Checking if image generation request...');
    const isImageRequest = isImageGenerationRequest(message);
    console.log('Is image request:', isImageRequest);

    if (isImageRequest) {
      console.log('Image generation request detected');
      try {
        console.log('Calling OpenAI API for image generation');
        const imagePromise = openai.createImage({
          prompt: message,
          n: 1,
          size: "1024x1024",
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout')), 55000)
        );
        response = await Promise.race([imagePromise, timeoutPromise]);
        console.log('Image generated successfully');
        tokenUsage = 50; // Placeholder value, adjust as needed
        response = { type: 'image', url: response.data.data[0].url };
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        if (imageError.response && imageError.response.status === 401) {
          return res.status(500).json({ error: 'API authentication failed. Please contact support.' });
        }
        return res.status(500).json({ error: 'Failed to generate image. Please try again or rephrase your request.' });
      }
    } else {
      console.log('Text generation request detected');
      try {
        console.log('Calling OpenAI API for text generation');
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [{ role: "user", content: message }],
        });
        console.log('Text generated successfully');
        tokenUsage = completion.data.usage.total_tokens;
        response = { type: 'text', content: completion.data.choices[0].message.content };
      } catch (textError) {
        console.error('Error generating text response:', textError);
        if (textError.response && textError.response.status === 401) {
          return res.status(500).json({ error: 'API authentication failed. Please contact support.' });
        }
        return res.status(500).json({ error: 'Failed to generate response. Please try again.' });
      }
    }

    console.log('Storing AI response...');
    await storeMessage(userId, response.type === 'text' ? response.content : response.url, 'assistant');
    console.log('AI response stored');

    console.log('Storing token usage...');
    await storeTokenUsage(userId, tokenUsage);
    console.log('Token usage stored');

    logger.info('Chat request processed', { 
      userId, 
      messageType: response.type, 
      tokenUsage,
      processingTime: Date.now() - startTime
    });

    console.log('Sending response');
    res.json(response);
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    logger.error('Error in chat API', { 
      error: error.message, 
      stack: error.stack,
      processingTime: Date.now() - startTime
    });
    res.status(500).json({ error: 'An unexpected error occurred while processing your request.' });
  }
});

// Update the chat history route
app.get('/api/chat/history', async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log('Fetching chat history for user:', userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const conversation = await db.collection('conversations')
      .findOne(
        { userId },
        { projection: { messages: { $slice: [skip, limit] } } }
      );

    if (!conversation) {
      // If no conversation found, return an empty array
      return res.json({
        messages: [],
        currentPage: 1,
        totalPages: 0,
        totalMessages: 0
      });
    }

    const totalMessages = await db.collection('conversations')
      .aggregate([
        { $match: { userId } },
        { $project: { count: { $size: "$messages" } } }
      ]).toArray();

    const total = totalMessages[0] ? totalMessages[0].count : 0;

    res.json({
      messages: conversation.messages || [],
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    logger.error('Error fetching chat history', { error: error.message, stack: error.stack, userId: req.auth.userId });
    res.status(500).json({ error: 'An error occurred while fetching chat history.' });
  }
});

// Ensure cookies are secure in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.cookie('secure', true, { httpOnly: true, secure: true });
  }
  next();
});

async function storeTokenUsage(userId, tokenUsage) {
  try {
    const result = await db.collection('tokenUsage').updateOne(
      { userId },
      { 
        $inc: { totalTokens: tokenUsage },
        $push: { 
          usageHistory: {
            timestamp: new Date(),
            tokens: tokenUsage
          }
        }
      },
      { upsert: true }
    );
    logger.info('Token usage stored', { userId, tokenUsage });
  } catch (error) {
    logger.error('Error storing token usage', { error: error.message, userId, tokenUsage });
  }
}

// Update the multer configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

app.post('/api/chat/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const { file, body } = req;
    const userId = req.auth.userId;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);

    // Extract text from PDF
    const pdfText = pdfData.text;

    // Analyze PDF content using GPT-4
    const analysis = await analyzePdfContent(pdfText, body.message);
    
    // Estimate token usage (adjust this based on your needs)
    const tokenUsage = Math.ceil(pdfText.length / 4) + analysis.length;
    
    // Store token usage for the user
    await storeTokenUsage(userId, tokenUsage);

    logger.info('PDF analysis request processed', { 
      userId, 
      fileName: file.originalname,
      tokenUsage
    });

    res.json({ type: 'pdf-analysis', analysis });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 25MB limit.' });
      }
    }
    logger.error('Error in PDF upload and analysis', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'An error occurred while processing the PDF.' });
  } finally {
    // Clean up: delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

async function analyzePdfContent(pdfText, userMessage) {
  try {
    const prompt = `Analyze the following PDF content and ${userMessage || 'provide a summary'}:\n\n${pdfText}`;
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing PDF content:', error);
    throw new Error('Failed to analyze PDF content');
  }
}

// Add this function to store a new message
async function storeMessage(userId, message, role) {
  try {
    await db.collection('conversations').updateOne(
      { userId },
      { 
        $push: { 
          messages: {
            role,
            content: message,
            timestamp: new Date()
          }
        }
      },
      { upsert: true }
    );
    logger.info('Message stored', { userId, role });
  } catch (error) {
    logger.error('Error storing message', { error: error.message, userId, role });
  }
}

app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is working' });
});

// Add this near your other route definitions
app.get('/api/conversations', async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log('Fetching conversations for user:', userId);

    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await db.collection('conversations')
      .find({ userId })
      .project({ _id: 1, title: 1, lastMessage: { $arrayElemAt: ["$messages", -1] } })
      .sort({ 'lastMessage.timestamp': -1 })
      .toArray();

    console.log('Conversations fetched:', conversations.length);

    const formattedConversations = conversations.map(conv => ({
      id: conv._id.toString(),
      title: conv.title || 'Untitled Conversation',
      lastMessage: conv.lastMessage ? conv.lastMessage.content : ''
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    logger.error('Error fetching conversations', { error: error.message, stack: error.stack, userId: req.auth.userId });
    res.status(500).json({ error: 'An error occurred while fetching conversations.' });
  }
});
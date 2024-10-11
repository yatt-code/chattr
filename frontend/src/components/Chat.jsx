import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import MenuIcon from '@mui/icons-material/Menu';
import { format } from 'date-fns';
import StyledMarkdown from './StyledMarkdown';
import Sidebar from './Sidebar';
import TypingIndicator from './TypingIndicator';
import BackgroundLogo from './BackgroundLogo';

const MessageGroup = ({ messages, role }) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: role === 'user' ? 'flex-end' : 'flex-start' }}>
      {messages.map((message, index) => (
        <Fade in={true} key={index}>
          <Box 
            sx={{ 
              mb: 1, 
              p: 2, 
              maxWidth: '70%', 
              backgroundColor: role === 'user' ? theme.palette.primary.light : theme.palette.grey[100],
              borderRadius: 2,
              alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <StyledMarkdown>{message.content}</StyledMarkdown>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: theme.palette.text.secondary }}>
              {format(new Date(message.timestamp), 'HH:mm')}
            </Typography>
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

const Chat = ({ isDarkMode, toggleTheme, openSettings }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    setIsLoading(true);
    setError(null);

    const newMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    try {
      setIsTyping(true);
      const formData = new FormData();
      formData.append('message', input);
      if (file) {
        formData.append('file', file);
      }

      const response = await api.post('/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsTyping(false);
      const botResponse = { 
        role: 'assistant', 
        content: response.data.content, 
        timestamp: new Date().toISOString() 
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setFile(null);
      setIsTyping(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = [];

    messages.forEach((message, index) => {
      if (index === 0 || message.role !== messages[index - 1].role) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = groupMessages(messages);

  const handleConversationSelect = async (conversationId) => {
    if (conversationId === null) {
      // New chat selected
      setMessages([]);
      setSelectedConversation(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      setMessages(response.data.messages);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onConversationSelect={handleConversationSelect}
        openSettings={openSettings}
      />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
        {!isSidebarOpen && (
          <IconButton
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: 2, 
          backgroundColor: theme.palette.background.default,
          position: 'relative',
        }}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.1,
              pointerEvents: 'none',
            }}
          >
            <BackgroundLogo sx={{ fontSize: 400 }} />
          </Box>
          {messageGroups.map((group, index) => (
            <MessageGroup key={index} messages={group} role={group[0].role} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </Box>
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ p: 2, backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
          <form onSubmit={sendMessage}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                variant="outlined"
                size="small"
                disabled={isLoading}
                multiline
                maxRows={4}
                sx={{ mr: 1 }}
              />
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button component="span" sx={{ minWidth: 'auto', mr: 1 }}>
                  <AttachFileIcon />
                </Button>
              </label>
              <Button component="span" sx={{ minWidth: 'auto', mr: 1 }}>
                <MicIcon />
              </Button>
              <Button type="submit" variant="contained" endIcon={<SendIcon />} disabled={isLoading}>
                Send
              </Button>
            </Box>
          </form>
          {file && <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>{file.name}</Typography>}
          {isLoading && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
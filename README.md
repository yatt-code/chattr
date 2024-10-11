# Chattr

Chattr is an AI-powered chat application that provides an intuitive interface for users to interact with a sophisticated language model. It's designed to offer a seamless experience similar to popular AI chat platforms, with added features for customization and enhanced functionality.

## Features

- AI-powered conversations with a GPT-based language model
- User authentication and personalized chat history
- Dark mode support for comfortable viewing in different lighting conditions
- File upload capability for document analysis
- Responsive design for both desktop and mobile use
- Settings panel for user preferences

## Use Case

Chattr is ideal for users who want to:

- Get quick answers to questions on a wide range of topics
- Brainstorm ideas and receive creative input
- Analyze documents and extract key information
- Improve their writing with AI-assisted editing and suggestions
- Learn about complex subjects through interactive conversations

Whether you're a student, professional, or curious individual, Chattr provides a powerful tool for enhancing your knowledge and productivity.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chattr.git
   cd chattr
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add the following variables:
     ```
     OPENAI_API_KEY=your_openai_api_key
     MONGODB_URI=your_mongodb_connection_string
     CLERK_SECRET_KEY=your_clerk_secret_key
     ```

4. Start the development servers:
   - For the backend:
     ```
     cd backend
     npm run dev
     ```
   - For the frontend (in a new terminal):
     ```
     cd frontend
     npm run dev
     ```

5. Open your browser and navigate to `http://localhost:5173` to use the app.

## Usage

1. Sign up or log in using the authentication system.

2. Once logged in, you'll see the main chat interface.

3. To start a new conversation, click the "+" icon in the sidebar.

4. Type your message in the input field at the bottom of the screen and press Enter or click the Send button.

5. The AI will respond to your message. You can continue the conversation by sending more messages.

6. To upload a file for analysis, click the attachment icon next to the input field and select a file.

7. Use the sidebar to switch between different conversations or search for specific chats.

8. Access settings by clicking on your profile picture in the sidebar and selecting "Settings" from the dropdown menu.

9. Toggle between light and dark mode using the switch in the settings menu.

## Todo: Future Improvements

1. **Voice Input and Text-to-Speech Output**: Implement voice recognition for input and text-to-speech for AI responses, making the app more accessible and hands-free.

2. **Multi-language Support**: Add support for multiple languages in both the user interface and AI conversations, expanding the app's global reach.

3. **Collaborative Chats**: Implement a feature allowing multiple users to participate in the same AI conversation, enabling team brainstorming and collaborative problem-solving.

4. **Custom AI Model Fine-tuning**: Allow users to fine-tune the AI model on their own data, creating more specialized and personalized chat experiences.

5. **Integration with External Tools**: Develop plugins or integrations with popular productivity tools (e.g., note-taking apps, project management software) to seamlessly incorporate AI assistance into existing workflows.

## Contributing

(Include guidelines for contributing to the project)

## License

This project is licensed under the [Your chosen license] License - see the [LICENSE](LICENSE) file for details.

## Copyright

Copyright (c) 2024 yatt.codes. All rights reserved.
/**
 * Copyright (c) 2024 yatt.codes
 * All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, TextField, CircularProgress, Divider, SvgIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import UserMenu from './UserMenu';
import api from '../utils/api';

// Add this new component for the logo
const Logo = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512">
    <defs>
      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="darkviolet" />
        <stop offset="100%" stopColor="purple" />
      </linearGradient>
      <linearGradient id="thunderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="crimson" />
        <stop offset="100%" stopColor="yellow" />
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="220" fill="url(#circleGradient)" />
    <path d="M290 50 L230 220 L340 220 L180 420 L250 250 L160 250 Z"
          fill="url(#thunderGradient)" stroke="black" strokeWidth="10" />
  </SvgIcon>
);

const Sidebar = ({ isOpen, toggleSidebar, isDarkMode, toggleTheme, onConversationSelect, openSettings }) => {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Mock Conversation 1' },
    { id: 2, title: 'Mock Conversation 2' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching conversations...');
      const response = await api.get('/conversations');
      console.log('Conversations fetched:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error.response ? error.response.data : error.message);
      setConversations([]); // Set to empty array on error
      // Optionally, you can set an error state here to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = () => {
    // Clear the current conversation
    onConversationSelect(null);
    // You might want to add more logic here, such as creating a new conversation on the server
  };

  return (
    <Box
      sx={{
        width: isOpen ? 260 : 0,
        height: '100vh',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'width 0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={handleNewChat}>
          <AddIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo sx={{ width: 40, height: 40, mr: 1 }} />
          <Typography variant="subtitle1">New chat</Typography>
        </Box>
        <IconButton onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          value={searchTerm}
          onChange={handleSearch}
        />
      </Box>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          filteredConversations.map((conversation) => (
            <ListItem 
              key={conversation.id} 
              onClick={() => onConversationSelect(conversation.id)}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary={conversation.title} />
            </ListItem>
          ))
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <UserMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} openSettings={openSettings} />
      </Box>
    </Box>
  );
};

export default Sidebar;
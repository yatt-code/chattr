import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const TypingIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
    <CircularProgress size={20} sx={{ mr: 2 }} />
    AI is typing...
  </Box>
);

export default TypingIndicator;
/**
 * Copyright (c) 2024 yatt.codes
 * All rights reserved.
 */

import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useUser, SignIn, SignUp } from "@clerk/clerk-react"
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Chat from './components/Chat.jsx'
import Settings from './components/Settings.jsx'

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            <Route 
              path="/" 
              element={
                <SignedIn>
                  <Chat 
                    isDarkMode={isDarkMode} 
                    toggleTheme={toggleTheme}
                    openSettings={handleOpenSettings}
                  />
                </SignedIn>
              } 
            />
            <Route 
              path="*" 
              element={
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              } 
            />
          </Routes>
          <Settings 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            open={isSettingsOpen} 
            onClose={handleCloseSettings}
          />
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App;
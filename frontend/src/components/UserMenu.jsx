import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Typography } from '@mui/material';
import { UserButton, useUser } from "@clerk/clerk-react";
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const UserMenu = ({ isDarkMode, toggleTheme, openSettings }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useUser();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    handleClose();
    openSettings();
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        fullWidth
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          px: 2,
          py: 1,
        }}
      >
        <Avatar src={user?.profileImageUrl} sx={{ width: 32, height: 32, mr: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="subtitle2">{user?.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.primaryEmailAddress?.emailAddress}</Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary={isDarkMode ? "Light Mode" : "Dark Mode"} />
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;
import React from 'react';
import { SvgIcon } from '@mui/material';

const BackgroundLogo = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512">
    <defs>
      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="darkviolet" stopOpacity="0.1" />
        <stop offset="100%" stopColor="purple" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="thunderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="crimson" stopOpacity="0.1" />
        <stop offset="100%" stopColor="yellow" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="220" fill="url(#circleGradient)" />
    <path d="M290 50 L230 220 L340 220 L180 420 L250 250 L160 250 Z"
          fill="url(#thunderGradient)" stroke="black" strokeWidth="10" strokeOpacity="0.1" />
  </SvgIcon>
);

export default BackgroundLogo;
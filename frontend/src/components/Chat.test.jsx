import React from 'react';
import { render, screen } from '@testing-library/react';
import Chat from './Chat';

test('renders chat input', () => {
  render(<Chat />);
  const inputElement = screen.getByPlaceholderText(/Type your message/i);
  expect(inputElement).toBeInTheDocument();
});

// Add more tests...
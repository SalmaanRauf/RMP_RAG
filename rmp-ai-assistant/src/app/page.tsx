'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography, Paper, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Rate My Professor support assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');

    // Simulating API call
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "This is a simulated response. The actual AI integration is not implemented yet." }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0E1117',
      color: '#ECECF1',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    }}>
      <Typography variant="h5" sx={{ p: 3, borderBottom: '1px solid #2A2B32', fontWeight: 500, fontSize: '1.875rem' }}>
        Rate My Professor AI Assistant
      </Typography>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '1000px' }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              bgcolor: msg.role === 'assistant' ? '#1A1C23' : 'transparent',
              py: 4,
              borderRadius: '8px',
            }}>
              <Box sx={{ width: '100%', maxWidth: '936px', px: 4 }}>
                <Typography variant="body1" sx={{ 
                  color: msg.role === 'assistant' ? '#ECECF1' : '#10A37F',
                  fontSize: '1.5625rem',
                  lineHeight: 1.6,
                  fontWeight: msg.role === 'user' ? 500 : 400,
                }}>
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 3, borderTop: '1px solid #2A2B32' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Send a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={5}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ECECF1',
                bgcolor: '#1A1C23',
                fontSize: '1.40625rem',
                '& fieldset': {
                  borderColor: '#2A2B32',
                  borderRadius: '8px',
                },
                '&:hover fieldset': {
                  borderColor: '#3A3B42',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#10A37F',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#8E8EA0',
                opacity: 1,
              },
            }}
          />
          <IconButton 
            onClick={sendMessage} 
            disabled={isLoading}
            sx={{ 
              ml: 2, 
              color: '#10A37F',
              '&:hover': {
                bgcolor: 'rgba(16, 163, 127, 0.1)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2.5rem',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#8E8EA0', textAlign: 'center', fontSize: '1.25rem' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
}

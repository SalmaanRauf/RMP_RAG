'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography, Paper, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function Home() {
  // state stuff for the chat app
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Course Selection assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // auto scroll to bottom when new msgs come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // send msg to the api and handle the streaming response
  const sendMessage = async () => {
    if (message.trim() === '') return; // don't send empty msgs lol

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // hit our backend api
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // handle streaming response - way cooler than waiting for everything at once
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantMessage = { role: 'assistant', content: '' };
        
        setMessages(prev => [...prev, assistantMessage]);

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            // decode the chunk and add it to the message
            const chunkText = decoder.decode(value);
            assistantMessage.content += chunkText;
            
            // update the ui with each chunk - makes it look like typing
            setMessages(prev => [
              ...prev.slice(0, prev.length - 1),
              { ...assistantMessage }
            ]);
          }
        }
      }
    } catch (error) {
      // oops something broke
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // send msg when enter is pressed (but not with shift+enter)
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // the actual ui stuff
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0E1117', // dark mode ftw
      color: '#ECECF1',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    }}>
      <Typography variant="h5" sx={{ p: 3, borderBottom: '1px solid #2A2B32', fontWeight: 500, fontSize: '1.875rem' }}>
        Course Selection Assistant
      </Typography>
      {/* messages container - scrollable */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '1000px' }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              bgcolor: msg.role === 'assistant' ? '#1A1C23' : 'transparent', // diff bg for bot vs user
              py: 4,
              borderRadius: '8px',
            }}>
              <Box sx={{ width: '100%', maxWidth: '936px', px: 4 }}>
                <Typography variant="body1" sx={{ 
                  color: msg.role === 'assistant' ? '#ECECF1' : '#10A37F', // green for user msgs
                  fontSize: '1.5625rem',
                  lineHeight: 1.6,
                  fontWeight: msg.role === 'user' ? 500 : 400,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <div ref={messagesEndRef} /> {/* empty div for scrolling to bottom */}
      </Box>
      {/* input area at bottom */}
      <Box sx={{ p: 3, borderTop: '1px solid #2A2B32' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about courses, requirements, or get recommendations..."
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
                  borderColor: '#10A37F', // green focus outline
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
              color: '#10A37F', // green send button
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
import React from 'react';
import { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CssBaseline />
        {children}
      </body>
    </html>
  );
}

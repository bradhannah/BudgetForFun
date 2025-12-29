// Bun HTTP Server for BudgetForFun
// Handles backend API for IPC communication with Tauri frontend
// Runs on localhost:3000

import { serve } from 'bun';

const PORT = 3000;

// Health check endpoint
const healthHandler = () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
};

// 404 handler for unknown routes
const notFoundHandler = () => {
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 404
  });
};

// Error handler for server errors
const errorHandler = () => {
  return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 500
  });
};

// Start server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === '/health') {
      return healthHandler();
    }

    // Unknown route
    return notFoundHandler();
  },
  error(request) {
    console.error('Server error:', request.error);
    return errorHandler();
  }
});

console.log(`Bun backend server running on http://localhost:${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);

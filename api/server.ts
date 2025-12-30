// Bun HTTP Server for BudgetForFun
// Handles backend API for IPC communication with Tauri frontend
// Runs on localhost:3000
// Uses tsoa controllers with Bun bridge for routing

import { serve } from 'bun';
import { routes } from './src/routes';

const PORT = 3000;

// Register routes (with /api/ prefix)
for (const [path, route] of routes.entries()) {
  if (path === '/api/health' || path === '/health') {
    console.log(`Registered route: ${path} -> HealthController.getHealth()`);
  }
}

// Start server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Request: ${req.method} ${path}`);
    
    // Find matching route (support both /health and /api/health)
    for (const [routePath, route] of routes.entries()) {
      if ((path === routePath || path === `/api/${routePath.replace('/api/', '')}`) && req.method === route.method) {
        try {
          console.log(`  -> Matched route: ${routePath}`);
          return await route.handler(req);
        } catch (error) {
          console.error('Server error:', error);
          return new Response(
            JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }),
            { 
              headers: { 'Content-Type': 'application/json' },
              status: error instanceof Error && 'status' in error 
                ? (error as any).status 
                : 500
            }
          );
        }
      }
    }
    
    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }
});

console.log(`Bun backend server running on http://localhost:${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);
console.log(`Test endpoint: http://localhost:${PORT}/api/test`);

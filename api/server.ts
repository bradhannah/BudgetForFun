// Bun HTTP Server for BudgetForFun
// Handles backend API for IPC communication with Tauri frontend
// Runs on localhost:3000
// Uses simple routing with Bun serve

import { serve } from 'bun';
import { routes } from './src/routes';

const PORT = 3000;

// Start server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Request: ${req.method} ${path}`);
    
    // Find matching route
    for (const route of routes) {
      const { path: routePath, definition } = route;
      
      // Check if path matches (exact match or starts with for path params)
      const pathMatches = definition.hasPathParam 
        ? path.startsWith(routePath + '/') || path === routePath
        : path === routePath;
      
      if (pathMatches && req.method === definition.method) {
        try {
          console.log(` -> Matched route: ${routePath} [${definition.method}]`);
          return await definition.handler(req);
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
console.log(`API endpoints:`, routes.map(r => `${r.definition.method} ${r.path}`));

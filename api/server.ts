// Bun HTTP Server for BudgetForFun
// Handles backend API for IPC communication with Tauri frontend
// Runs on localhost:3000
// Uses simple routing with Bun serve

import { serve } from 'bun';
import { routes } from './src/routes';

const PORT = 3000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const corsResponse = (body: string | object, status = 200) => {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
};

// Start server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`Request: ${req.method} ${path}`);

    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

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
          const response = await definition.handler(req);

          // Add CORS headers to existing Response
          const headers = new Headers(response.headers);
          Object.entries(CORS_HEADERS).forEach(([key, value]) => {
            headers.set(key, value);
          });

          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch (error) {
          console.error('Server error:', error);
          return corsResponse(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            error instanceof Error && 'status' in error
              ? (error as any).status
              : 500
          );
        }
      }
    }
    
    // 404 for unknown routes
    return corsResponse({ error: 'Not Found' }, 404);
  }
});

console.log(`Bun backend server running on http://localhost:${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);
console.log(`API endpoints:`, routes.map(r => `${r.definition.method} ${r.path}`));

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

// Route matching function - handles patterns like /api/months/:month/summary
function matchRoute(requestPath: string, routePath: string, hasPathParam: boolean): boolean {
  if (!hasPathParam) {
    return requestPath === routePath;
  }
  
  // Split paths into segments
  const requestSegments = requestPath.split('/').filter(Boolean);
  const routeSegments = routePath.split('/').filter(Boolean);
  
  // Must have exactly one more segment in request than in route (the path param)
  if (requestSegments.length !== routeSegments.length + 1) {
    return false;
  }
  
  // Case 1: Simple path param at end
  // Route: /api/months -> matches /api/months/2025-01
  // All route segments must match request segments in order
  let allPrefixMatch = true;
  for (let i = 0; i < routeSegments.length; i++) {
    if (routeSegments[i] !== requestSegments[i]) {
      allPrefixMatch = false;
      break;
    }
  }
  if (allPrefixMatch) {
    return true;
  }
  
  // Case 2: Path param in middle
  // Route: /api/months/summary -> matches /api/months/2025-01/summary
  // First N-1 route segments match first N-1 request segments, then param, then last matches
  // Route segments: [api, months, summary] -> first 2 match, param, last matches
  // Request segments: [api, months, 2025-01, summary]
  
  const lastRouteSegment = routeSegments[routeSegments.length - 1];
  const lastRequestSegment = requestSegments[requestSegments.length - 1];
  
  // Last segments must match
  if (lastRouteSegment !== lastRequestSegment) {
    return false;
  }
  
  // All segments before the last route segment must match corresponding request segments
  for (let i = 0; i < routeSegments.length - 1; i++) {
    if (routeSegments[i] !== requestSegments[i]) {
      return false;
    }
  }
  
  return true;
}

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

    // Find matching route - sort by specificity (longer paths first)
    const sortedRoutes = [...routes].sort((a, b) => b.path.length - a.path.length);
    
    for (const route of sortedRoutes) {
      const { path: routePath, definition } = route;
      
      const pathMatches = matchRoute(path, routePath, definition.hasPathParam || false);
      
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

// Main routes file - Minimal working version

import { 
  createHealthHandler
} from './handlers/common.handlers';

// Combined route map
export const routes = new Map([
  ['/api/health', { method: 'GET', handler: createHealthHandler() }],
  ['/health', { method: 'GET', handler: createHealthHandler() }],
]);

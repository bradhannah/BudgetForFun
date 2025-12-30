// Main routes file - Combined routes from all modules

import { 
  createHealthHandler,
  createTestHandler
} from './handlers/common.handlers';

import {
  createPaymentSourcesHandlerGET,
  createPaymentSourcesHandlerPOST,
  createPaymentSourcesHandlerPUT,
  createPaymentSourcesHandlerDELETE
} from './handlers/payment-sources.handlers';

import {
  createBillsHandlerGET,
  createBillsHandlerPOST,
  createBillsHandlerPUT,
  createBillsHandlerDELETE
} from './handlers/bills.handlers';

import {
  createIncomesHandlerGET,
  createIncomesHandlerPOST,
  createIncomesHandlerPUT,
  createIncomesHandlerDELETE
} from './handlers/incomes.handlers';

// Route definition type
interface RouteDefinition {
  method: string;
  handler: (req: Request) => Promise<Response>;
  hasPathParam?: boolean;
}

// Routes array - allows multiple methods per path
export const routes: Array<{ path: string; definition: RouteDefinition }> = [
  // Health
  { path: '/api/health', definition: { method: 'GET', handler: createHealthHandler() } },
  { path: '/health', definition: { method: 'GET', handler: createHealthHandler() } },
  { path: '/api/test', definition: { method: 'GET', handler: createTestHandler() } },
  
  // Payment Sources
  { path: '/api/payment-sources', definition: { method: 'GET', handler: createPaymentSourcesHandlerGET() } },
  { path: '/api/payment-sources', definition: { method: 'POST', handler: createPaymentSourcesHandlerPOST() } },
  { path: '/api/payment-sources', definition: { method: 'PUT', handler: createPaymentSourcesHandlerPUT(), hasPathParam: true } },
  { path: '/api/payment-sources', definition: { method: 'DELETE', handler: createPaymentSourcesHandlerDELETE(), hasPathParam: true } },
  
  // Bills
  { path: '/api/bills', definition: { method: 'GET', handler: createBillsHandlerGET() } },
  { path: '/api/bills', definition: { method: 'POST', handler: createBillsHandlerPOST() } },
  { path: '/api/bills', definition: { method: 'PUT', handler: createBillsHandlerPUT(), hasPathParam: true } },
  { path: '/api/bills', definition: { method: 'DELETE', handler: createBillsHandlerDELETE(), hasPathParam: true } },
  
  // Incomes
  { path: '/api/incomes', definition: { method: 'GET', handler: createIncomesHandlerGET() } },
  { path: '/api/incomes', definition: { method: 'POST', handler: createIncomesHandlerPOST() } },
  { path: '/api/incomes', definition: { method: 'PUT', handler: createIncomesHandlerPUT(), hasPathParam: true } },
  { path: '/api/incomes', definition: { method: 'DELETE', handler: createIncomesHandlerDELETE(), hasPathParam: true } },
];

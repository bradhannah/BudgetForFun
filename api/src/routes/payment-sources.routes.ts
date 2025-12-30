// Payment Sources routes - Route registration

import {
  createHealthHandler,
  createTestHandler,
  createPaymentSourcesHandlerGET,
  createPaymentSourcesHandlerPOST,
  createPaymentSourcesHandlerPUT,
  createPaymentSourcesHandlerDELETE
} from './handlers/common.handlers';
import { registerPaymentSourcesRoutes } from './payment-sources.routes';

/**
 * Route registration map (with /api/ prefix)
 */
export const routes = new Map([
  ['/api/health', { method: 'GET', handler: createHealthHandler() }],
  ['/health', { method: 'GET', handler: createHealthHandler() }],
  ['/api/test', { method: 'GET', handler: createTestHandler() }],
  ['/api/payment-sources', { method: 'GET', handler: createPaymentSourcesHandlerGET() }],
  ['/api/payment-sources', { method: 'POST', handler: createPaymentSourcesHandlerPOST() }],
  ['/api/payment-sources', { method: 'PUT', handler: createPaymentSourcesHandlerPUT(), path: true }],
  ['/api/payment-sources', { method: 'DELETE', handler: createPaymentSourcesHandlerDELETE(), path: true }],
]);

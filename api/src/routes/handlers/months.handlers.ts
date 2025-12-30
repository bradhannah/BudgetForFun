// Months API Handlers

import { MonthsServiceImpl } from '../../services/months-service';
import { LeftoverServiceImpl } from '../../services/leftover-service';
import { formatErrorForUser } from '../../utils/errors';

const monthsService = new MonthsServiceImpl();
const leftoverService = new LeftoverServiceImpl();

// Helper to extract month from URL path: /api/months/2025-01 -> 2025-01
function extractMonth(url: string): string | null {
  const match = url.match(/\/api\/months\/(\d{4}-\d{2})/);
  return match ? match[1] : null;
}

// GET /api/months/:month - Get monthly data with leftover calculation
export function createMonthsHandlerGET() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const month = extractMonth(url.pathname);
      
      if (!month) {
        return new Response(JSON.stringify({
          error: 'Invalid month format. Expected YYYY-MM (e.g., 2025-01)'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const monthlyData = await monthsService.getMonthlyData(month);
      
      if (!monthlyData) {
        return new Response(JSON.stringify({
          error: `Monthly data for ${month} not found. Generate it first with POST /api/months/${month}/generate`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Calculate leftover and include it in the response
      const leftoverResult = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        ...monthlyData,
        summary: leftoverResult
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[MonthsHandler] GET failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to load monthly data'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/generate - Generate monthly data from defaults
export function createMonthsHandlerGenerate() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract month from /api/months/2025-01/generate
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/generate/);
      const month = match ? match[1] : null;
      
      if (!month) {
        return new Response(JSON.stringify({
          error: 'Invalid month format. Expected YYYY-MM (e.g., 2025-01)'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month already exists
      const existingData = await monthsService.getMonthlyData(month);
      if (existingData) {
        return new Response(JSON.stringify({
          error: `Monthly data for ${month} already exists`,
          data: existingData
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 409
        });
      }
      
      const monthlyData = await monthsService.generateMonthlyData(month);
      const leftoverResult = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        ...monthlyData,
        summary: leftoverResult
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201
      });
    } catch (error) {
      console.error('[MonthsHandler] Generate failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to generate monthly data'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// PUT /api/months/:month/bank-balances - Update bank balances for a month
export function createMonthsHandlerUpdateBalances() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract month from /api/months/2025-01/bank-balances
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bank-balances/);
      const month = match ? match[1] : null;
      
      if (!month) {
        return new Response(JSON.stringify({
          error: 'Invalid month format. Expected YYYY-MM (e.g., 2025-01)'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const body = await request.json();
      
      if (typeof body !== 'object' || body === null) {
        return new Response(JSON.stringify({
          error: 'Request body must be an object with payment source IDs as keys and balances as values'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const monthlyData = await monthsService.updateBankBalances(month, body);
      const leftoverResult = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        ...monthlyData,
        summary: leftoverResult
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[MonthsHandler] UpdateBalances failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update bank balances'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// GET /api/months/:month/summary - Get just the leftover calculation
export function createMonthsHandlerSummary() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract month from /api/months/2025-01/summary
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/summary/);
      const month = match ? match[1] : null;
      
      if (!month) {
        return new Response(JSON.stringify({
          error: 'Invalid month format. Expected YYYY-MM (e.g., 2025-01)'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const leftoverResult = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify(leftoverResult), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[MonthsHandler] Summary failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to calculate summary'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// Bill and Income Instance Handlers

import { MonthsServiceImpl } from '../../services/months-service';
import { LeftoverServiceImpl } from '../../services/leftover-service';
import { BillsServiceImpl } from '../../services/bills-service';
import { IncomesServiceImpl } from '../../services/incomes-service';
import { formatErrorForUser, ReadOnlyError } from '../../utils/errors';

const monthsService = new MonthsServiceImpl();
const leftoverService = new LeftoverServiceImpl();
const billsService = new BillsServiceImpl();
const incomesService = new IncomesServiceImpl();

// Helper to check if month is read-only and return 403 response if so
async function checkReadOnly(month: string): Promise<Response | null> {
  const isReadOnly = await monthsService.isReadOnly(month);
  if (isReadOnly) {
    return new Response(JSON.stringify({
      error: `Month ${month} is read-only. Unlock it to make changes.`
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403
    });
  }
  return null;
}

// Extract month and instance ID from URL: /api/months/2025-01/bills/uuid
function extractMonthAndId(url: string, type: 'bills' | 'incomes'): { month: string | null; id: string | null } {
  const regex = new RegExp(`/api/months/(\\d{4}-\\d{2})/${type}/([^/]+)`);
  const match = url.match(regex);
  return {
    month: match ? match[1] : null,
    id: match ? match[2] : null
  };
}

// PUT /api/months/:month/bills/:id - Update bill instance amount
export function createBillInstanceHandlerPUT() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const { month, id } = extractMonthAndId(url.pathname, 'bills');
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const body = await request.json();
      const { amount } = body;
      
      if (typeof amount !== 'number' || amount < 0) {
        return new Response(JSON.stringify({
          error: 'Amount must be a non-negative number in cents'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const instance = await monthsService.updateBillInstance(month, id, amount);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with bill name
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill PUT failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update bill instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/bills/:id/reset - Reset bill instance to default amount
export function createBillInstanceHandlerReset() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract from /api/months/2025-01/bills/uuid/reset
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bills\/([^/]+)\/reset/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id/reset'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.resetBillInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with bill name
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill Reset failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to reset bill instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// PUT /api/months/:month/incomes/:id - Update income instance amount
export function createIncomeInstanceHandlerPUT() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const { month, id } = extractMonthAndId(url.pathname, 'incomes');
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const body = await request.json();
      const { amount } = body;
      
      if (typeof amount !== 'number' || amount < 0) {
        return new Response(JSON.stringify({
          error: 'Amount must be a non-negative number in cents'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const instance = await monthsService.updateIncomeInstance(month, id, amount);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with income name
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income PUT failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update income instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/incomes/:id/reset - Reset income instance to default amount
export function createIncomeInstanceHandlerReset() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract from /api/months/2025-01/incomes/uuid/reset
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/incomes\/([^/]+)\/reset/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id/reset'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.resetIncomeInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with income name
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income Reset failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to reset income instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/bills/:id/paid - Toggle bill instance paid status
export function createBillInstanceHandlerTogglePaid() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract from /api/months/2025-01/bills/uuid/paid
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bills\/([^/]+)\/paid/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id/paid'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.toggleBillInstancePaid(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with bill name
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill Toggle Paid failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to toggle bill paid status'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/incomes/:id/paid - Toggle income instance paid status
// Optionally accepts { actualAmount: number } in body to set the received amount
export function createIncomeInstanceHandlerTogglePaid() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      // Extract from /api/months/2025-01/incomes/uuid/paid
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/incomes\/([^/]+)\/paid/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id/paid'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      // Parse optional actualAmount from body
      let actualAmount: number | undefined;
      try {
        const body = await request.json();
        if (body && typeof body.actualAmount === 'number' && body.actualAmount >= 0) {
          actualAmount = body.actualAmount;
        }
      } catch {
        // No body or invalid JSON - that's fine, actualAmount stays undefined
      }
      
      const instance = await monthsService.toggleIncomeInstancePaid(month, id, actualAmount);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Get enriched instance with income name
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      // Calculate updated summary
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income Toggle Paid failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to toggle income paid status'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// ============================================================================
// Close/Reopen Handlers (New Transaction-Based Flow)
// ============================================================================

// POST /api/months/:month/bills/:id/close - Close bill instance (no more payments expected)
export function createBillInstanceHandlerClose() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bills\/([^/]+)\/close/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id/close'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.closeBillInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill Close failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to close bill instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/bills/:id/reopen - Reopen closed bill instance
export function createBillInstanceHandlerReopen() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bills\/([^/]+)\/reopen/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id/reopen'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.reopenBillInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill Reopen failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to reopen bill instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/incomes/:id/close - Close income instance (no more receipts expected)
export function createIncomeInstanceHandlerClose() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/incomes\/([^/]+)\/close/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id/close'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.closeIncomeInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income Close failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to close income instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// POST /api/months/:month/incomes/:id/reopen - Reopen closed income instance
export function createIncomeInstanceHandlerReopen() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/incomes\/([^/]+)\/reopen/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id/reopen'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const instance = await monthsService.reopenIncomeInstance(month, id);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income Reopen failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to reopen income instance'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// ============================================================================
// Expected Amount Update Handlers (Inline Edit)
// ============================================================================

// PUT /api/months/:month/bills/:id/expected - Update bill expected amount
export function createBillInstanceHandlerUpdateExpected() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/bills\/([^/]+)\/expected/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/bills/:id/expected'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const body = await request.json();
      const { amount } = body;
      
      if (typeof amount !== 'number' || amount < 0) {
        return new Response(JSON.stringify({
          error: 'Amount must be a non-negative number in cents'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const instance = await monthsService.updateBillExpectedAmount(month, id, amount);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Bill instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const bill = instance.bill_id ? await billsService.getById(instance.bill_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || bill?.name || 'Unknown Bill',
        billing_period: bill?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Bill Update Expected failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update bill expected amount'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

// PUT /api/months/:month/incomes/:id/expected - Update income expected amount
export function createIncomeInstanceHandlerUpdateExpected() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const match = url.pathname.match(/\/api\/months\/(\d{4}-\d{2})\/incomes\/([^/]+)\/expected/);
      const month = match ? match[1] : null;
      const id = match ? match[2] : null;
      
      if (!month || !id) {
        return new Response(JSON.stringify({
          error: 'Invalid URL. Expected /api/months/YYYY-MM/incomes/:id/expected'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if month is read-only
      const readOnlyResponse = await checkReadOnly(month);
      if (readOnlyResponse) return readOnlyResponse;
      
      const body = await request.json();
      const { amount } = body;
      
      if (typeof amount !== 'number' || amount < 0) {
        return new Response(JSON.stringify({
          error: 'Amount must be a non-negative number in cents'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const instance = await monthsService.updateIncomeExpectedAmount(month, id, amount);
      
      if (!instance) {
        return new Response(JSON.stringify({
          error: `Income instance ${id} not found in month ${month}`
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      const income = instance.income_id ? await incomesService.getById(instance.income_id) : null;
      const enrichedInstance = {
        ...instance,
        name: instance.name || income?.name || 'Unknown Income',
        billing_period: income?.billing_period || 'monthly'
      };
      
      const summary = await leftoverService.calculateLeftover(month);
      
      return new Response(JSON.stringify({
        instance: enrichedInstance,
        summary
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[InstancesHandler] Income Update Expected failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update income expected amount'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

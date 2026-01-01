// Variable Expense Templates API Handlers

import { 
  VariableExpenseTemplatesService, 
  VariableExpenseTemplatesServiceImpl 
} from '../../services/variable-expense-templates-service';
import { formatErrorForUser } from '../../utils/errors';

const templatesService: VariableExpenseTemplatesService = new VariableExpenseTemplatesServiceImpl();

export function createVariableExpenseTemplatesHandlerGET() {
  return async () => {
    try {
      const templates = await templatesService.getAll();
      
      return new Response(JSON.stringify(templates), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[VariableExpenseTemplatesHandler] GET failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to load variable expense templates'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createVariableExpenseTemplatesHandlerPOST() {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validation = templatesService.validate(body);
      
      if (!validation.isValid) {
        return new Response(JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const newTemplate = await templatesService.create(body);
      
      return new Response(JSON.stringify(newTemplate), {
        headers: { 'Content-Type': 'application/json' },
        status: 201
      });
    } catch (error) {
      console.error('[VariableExpenseTemplatesHandler] POST failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to create variable expense template'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createVariableExpenseTemplatesHandlerPUT() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing template ID'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const body = await request.json();
      const updatedTemplate = await templatesService.update(id, body);
      
      if (!updatedTemplate) {
        return new Response(JSON.stringify({
          error: 'Template not found'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      return new Response(JSON.stringify(updatedTemplate), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[VariableExpenseTemplatesHandler] PUT failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update variable expense template'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createVariableExpenseTemplatesHandlerDELETE() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing template ID'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      await templatesService.delete(id);
      
      return new Response(null, {
        status: 204
      });
    } catch (error) {
      console.error('[VariableExpenseTemplatesHandler] DELETE failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to delete variable expense template'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

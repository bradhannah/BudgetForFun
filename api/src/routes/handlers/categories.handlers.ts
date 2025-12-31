// Categories API Handlers

import { CategoriesService, CategoriesServiceImpl } from '../../services/categories-service';
import { formatErrorForUser } from '../../utils/errors';
import type { Category } from '../../types';

const categoriesService: CategoriesService = new CategoriesServiceImpl();

export function createCategoriesHandlerGET() {
  return async () => {
    try {
      const categories = await categoriesService.getAll();
      
      return new Response(JSON.stringify(categories), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[CategoriesHandler] GET failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to load categories'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createCategoriesHandlerPOST() {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validation = categoriesService.validate(body);
      
      if (!validation.isValid) {
        return new Response(JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const newCategory = await categoriesService.create(body);
      
      return new Response(JSON.stringify(newCategory), {
        headers: { 'Content-Type': 'application/json' },
        status: 201
      });
    } catch (error) {
      console.error('[CategoriesHandler] POST failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to create category'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createCategoriesHandlerPUT() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing category ID'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      const body = await request.json();
      const updatedCategory = await categoriesService.update(id, body);
      
      if (!updatedCategory) {
        return new Response(JSON.stringify({
          error: 'Category not found'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      return new Response(JSON.stringify(updatedCategory), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('[CategoriesHandler] PUT failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to update category'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

export function createCategoriesHandlerDELETE() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();
      
      if (!id) {
        return new Response(JSON.stringify({
          error: 'Missing category ID'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if category is predefined - don't allow deletion of predefined categories
      const category = await categoriesService.getById(id);
      if (category?.is_predefined) {
        return new Response(JSON.stringify({
          error: 'Cannot delete predefined category'
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      await categoriesService.delete(id);
      
      return new Response(null, {
        status: 204
      });
    } catch (error) {
      console.error('[CategoriesHandler] DELETE failed:', error);
      
      return new Response(JSON.stringify({
        error: formatErrorForUser(error),
        message: 'Failed to delete category'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  };
}

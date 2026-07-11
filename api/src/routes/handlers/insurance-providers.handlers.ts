// Insurance Providers API Handlers

import {
  InsuranceProvidersService,
  InsuranceProvidersServiceImpl,
} from '../../services/insurance-providers-service';
import { InsuranceClaimsServiceImpl } from '../../services/insurance-claims-service';
import { formatErrorForUser, ValidationError } from '../../utils/errors';

const providersService: InsuranceProvidersService = new InsuranceProvidersServiceImpl();

export function createInsuranceProvidersHandlerGET() {
  return async () => {
    try {
      const providers = await providersService.getAll();

      return new Response(JSON.stringify(providers), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('[InsuranceProvidersHandler] GET failed:', error);

      return new Response(
        JSON.stringify({
          error: formatErrorForUser(error),
          message: 'Failed to load insurance providers',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  };
}

export function createInsuranceProvidersHandlerPOST() {
  return async (request: Request) => {
    try {
      const body = await request.json();

      // Ensure category_ids is always an array on the body before validation
      if (!body.category_ids) {
        body.category_ids = [];
      }

      const validation = providersService.validate(body);

      if (!validation.isValid) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: validation.errors,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const newProvider = await providersService.create(body);

      return new Response(JSON.stringify(newProvider), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      });
    } catch (error) {
      console.error('[InsuranceProvidersHandler] POST failed:', error);

      return new Response(
        JSON.stringify({
          error: formatErrorForUser(error),
          message: 'Failed to create insurance provider',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: error instanceof ValidationError ? 400 : 500,
        }
      );
    }
  };
}

export function createInsuranceProvidersHandlerPUT() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return new Response(
          JSON.stringify({
            error: 'Missing provider ID',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const body = await request.json();

      // Ensure category_ids, when present, is an array
      if (body.category_ids !== undefined && !Array.isArray(body.category_ids)) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: ['category_ids must be an array'],
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      const updatedProvider = await providersService.update(id, body);

      if (!updatedProvider) {
        return new Response(
          JSON.stringify({
            error: 'Insurance provider not found',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 404,
          }
        );
      }

      return new Response(JSON.stringify(updatedProvider), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('[InsuranceProvidersHandler] PUT failed:', error);

      return new Response(
        JSON.stringify({
          error: formatErrorForUser(error),
          message: 'Failed to update insurance provider',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: error instanceof ValidationError ? 400 : 500,
        }
      );
    }
  };
}

export function createInsuranceProvidersHandlerDELETE() {
  return async (request: Request) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return new Response(
          JSON.stringify({
            error: 'Missing provider ID',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Check if provider has existing claims
      const claimsService = new InsuranceClaimsServiceImpl();
      const claims = await claimsService.getAll();
      const providerClaims = claims.filter((c) => c.provider_id === id);

      if (providerClaims.length > 0) {
        return new Response(
          JSON.stringify({
            error: 'Cannot delete provider with existing claims',
            details: `This provider has ${providerClaims.length} claim(s) associated with it`,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 409,
          }
        );
      }

      await providersService.delete(id);

      return new Response(null, {
        status: 204,
      });
    } catch (error) {
      console.error('[InsuranceProvidersHandler] DELETE failed:', error);

      return new Response(
        JSON.stringify({
          error: formatErrorForUser(error),
          message: 'Failed to delete insurance provider',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  };
}

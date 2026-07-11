// Insurance Providers Service - CRUD operations for healthcare providers

import { StorageServiceImpl } from './storage';
import { InsuranceCategoriesServiceImpl } from './insurance-categories-service';
import type { StorageService } from './storage';
import type { InsuranceCategoriesService } from './insurance-categories-service';
import type { InsuranceProvider, ValidationResult } from '../types';
import { ValidationError } from '../utils/errors';

const STORAGE_PATH = 'data/entities/insurance-providers.json';

export interface InsuranceProvidersService {
  getAll(): Promise<InsuranceProvider[]>;
  getById(id: string): Promise<InsuranceProvider | null>;
  getActive(): Promise<InsuranceProvider[]>;
  getByCategory(categoryId: string): Promise<InsuranceProvider[]>;
  create(
    data: Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at' | 'is_active'>
  ): Promise<InsuranceProvider>;
  update(
    id: string,
    updates: Partial<Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<InsuranceProvider | null>;
  delete(id: string): Promise<void>;
  validate(data: Partial<InsuranceProvider>): ValidationResult;
}

export class InsuranceProvidersServiceImpl implements InsuranceProvidersService {
  private storage: StorageService;
  private categoriesService: InsuranceCategoriesService;

  constructor() {
    this.storage = StorageServiceImpl.getInstance();
    this.categoriesService = new InsuranceCategoriesServiceImpl();
  }

  public async getAll(): Promise<InsuranceProvider[]> {
    try {
      const providers = (await this.storage.readJSON<InsuranceProvider[]>(STORAGE_PATH)) || [];
      return providers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('[InsuranceProvidersService] Failed to load providers:', error);
      return [];
    }
  }

  public async getById(id: string): Promise<InsuranceProvider | null> {
    try {
      const providers = await this.getAll();
      return providers.find((p) => p.id === id) || null;
    } catch (error) {
      console.error('[InsuranceProvidersService] Failed to get provider:', error);
      return null;
    }
  }

  public async getActive(): Promise<InsuranceProvider[]> {
    const providers = await this.getAll();
    return providers.filter((p) => p.is_active);
  }

  public async getByCategory(categoryId: string): Promise<InsuranceProvider[]> {
    const providers = await this.getActive();
    return providers.filter((p) => p.category_ids.includes(categoryId));
  }

  public async create(
    data: Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at' | 'is_active'>
  ): Promise<InsuranceProvider> {
    try {
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '));
      }

      // Validate that all category_ids reference existing categories
      if (data.category_ids && data.category_ids.length > 0) {
        for (const catId of data.category_ids) {
          const category = await this.categoriesService.getById(catId);
          if (!category) {
            throw new ValidationError(`Category not found: ${catId}`, 'category_ids');
          }
        }
      }

      const providers = await this.getAll();

      const now = new Date().toISOString();
      const newProvider: InsuranceProvider = {
        ...data,
        id: crypto.randomUUID(),
        is_active: true,
        created_at: now,
        updated_at: now,
      };

      providers.push(newProvider);
      await this.storage.writeJSON(STORAGE_PATH, providers);

      console.log('[InsuranceProvidersService] Created provider:', newProvider.name);
      return newProvider;
    } catch (error) {
      console.error('[InsuranceProvidersService] Failed to create provider:', error);
      throw error;
    }
  }

  public async update(
    id: string,
    updates: Partial<Omit<InsuranceProvider, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<InsuranceProvider | null> {
    try {
      const providers = await this.getAll();
      const index = providers.findIndex((p) => p.id === id);

      if (index === -1) {
        console.warn(`[InsuranceProvidersService] Provider ${id} not found`);
        return null;
      }

      const now = new Date().toISOString();
      const updatedProvider: InsuranceProvider = {
        ...providers[index],
        ...updates,
        updated_at: now,
      };

      // Validate the merged data
      const validation = this.validate(updatedProvider);
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '));
      }

      // Validate that all category_ids reference existing categories
      if (updatedProvider.category_ids && updatedProvider.category_ids.length > 0) {
        for (const catId of updatedProvider.category_ids) {
          const category = await this.categoriesService.getById(catId);
          if (!category) {
            throw new ValidationError(`Category not found: ${catId}`, 'category_ids');
          }
        }
      }

      providers[index] = updatedProvider;
      await this.storage.writeJSON(STORAGE_PATH, providers);

      console.log('[InsuranceProvidersService] Updated provider:', updatedProvider.name);
      return updatedProvider;
    } catch (error) {
      console.error('[InsuranceProvidersService] Failed to update provider:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const providers = await this.getAll();
      const provider = providers.find((p) => p.id === id);

      if (!provider) {
        throw new Error('Provider not found');
      }

      // Note: Handler should check for existing claims before allowing delete
      const filtered = providers.filter((p) => p.id !== id);
      await this.storage.writeJSON(STORAGE_PATH, filtered);

      console.log('[InsuranceProvidersService] Deleted provider:', provider.name);
    } catch (error) {
      console.error('[InsuranceProvidersService] Failed to delete provider:', error);
      throw error;
    }
  }

  public validate(data: Partial<InsuranceProvider>): ValidationResult {
    const errors: string[] = [];

    // Name is required and must be non-empty
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be non-empty');
    }

    // category_ids must be a non-empty array
    if (!data.category_ids || !Array.isArray(data.category_ids) || data.category_ids.length === 0) {
      errors.push('At least one category is required');
    } else if (data.category_ids.some((id) => typeof id !== 'string' || id.trim().length === 0)) {
      errors.push('Category IDs must be non-empty strings');
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
      errors.push('Active status must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

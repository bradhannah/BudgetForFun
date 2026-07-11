import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { InsuranceProvidersServiceImpl } from './insurance-providers-service';
import { StorageServiceImpl } from './storage';

describe('InsuranceProvidersService', () => {
  let service: InsuranceProvidersServiceImpl;
  let testDir: string;

  beforeAll(async () => {
    testDir = join(tmpdir(), `insurance-providers-test-${Date.now()}`);
    await mkdir(join(testDir, 'entities'), { recursive: true });
    StorageServiceImpl.initialize(testDir);
  });

  beforeEach(async () => {
    await writeFile(join(testDir, 'entities', 'insurance-providers.json'), '[]');
    await writeFile(
      join(testDir, 'entities', 'insurance-categories.json'),
      JSON.stringify([
        {
          id: 'dental',
          name: 'Dental',
          icon: '',
          sort_order: 1,
          is_predefined: false,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'vision',
          name: 'Vision',
          icon: '',
          sort_order: 2,
          is_predefined: false,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ])
    );
    service = new InsuranceProvidersServiceImpl();
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test('creates, updates, lists, and deletes providers', async () => {
    const created = await service.create({
      name: 'Dental Clinic',
      description: 'Downtown',
      category_ids: ['dental'],
    });
    expect(created.is_active).toBe(true);
    expect(await service.getByCategory('dental')).toHaveLength(1);
    expect(await service.getByCategory('vision')).toHaveLength(0);

    const updated = await service.update(created.id, {
      name: 'Inactive Clinic',
      category_ids: ['dental', 'vision'],
      is_active: false,
    });
    expect(updated?.name).toBe('Inactive Clinic');
    expect(await service.getActive()).toHaveLength(0);

    await service.delete(created.id);
    expect(await service.getAll()).toEqual([]);
  });

  test('rejects missing and unknown categories', async () => {
    await expect(service.create({ name: 'Clinic', category_ids: [] })).rejects.toThrow(
      'At least one category is required'
    );
    await expect(service.create({ name: 'Clinic', category_ids: ['missing'] })).rejects.toThrow(
      'Category not found: missing'
    );
  });
});

import { readFile, writeFile, unlink, access, mkdir, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';

const ENTITIES_DIR = 'data/entities';

export interface StorageService {
  readFile<T>(path: string): Promise<T | null>;
  writeFile<T>(path: string, data: T): Promise<void>;
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  ensureDirectory(path: string): Promise<void>;
  listFiles(path: string): Promise<string[]>;
  readJSON<T>(path: string): Promise<T | null>;
  writeJSON<T>(path: string, data: T): Promise<void>;
}

export class StorageServiceImpl implements StorageService {
  private static instance: StorageServiceImpl | null = null;
  
  public static getInstance(): StorageService {
    if (!StorageServiceImpl.instance) {
      StorageServiceImpl.instance = new StorageServiceImpl();
    }
    return StorageServiceImpl.instance;
  }
  
  constructor() {
    this.initialize();
  }
  
  private async initialize() {
    await this.ensureDirectory(ENTITIES_DIR);
    await this.ensureDirectory('data/months');
  }
  
  public async readFile<T>(path: string): Promise<T | null> {
    try {
      const content = await readFile(path, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[StorageService] Failed to read file ${path}:`, errorMessage);
      return null;
    }
  }
  
  public async writeFile<T>(path: string, data: T): Promise<void> {
    await this.ensureDirectory(path.split('/').slice(0, -1).join('/'));
    const content = JSON.stringify(data, null, 2);
    await writeFile(path, content, 'utf-8');
  }
  
  public async deleteFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[StorageService] Failed to delete file ${path}:`, errorMessage);
    }
  }
  
  public async fileExists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  
  public async ensureDirectory(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code !== 'EEXIST') {
        const errorMessage = error.message;
        console.error(`[StorageService] Failed to create directory ${path}:`, errorMessage);
      }
    }
  }
  
  public async listFiles(path: string): Promise<string[]> {
    try {
      const entries = await readdir(path, { withFileTypes: true });
      return entries.filter(entry => entry.isFile()).map(entry => entry.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[StorageService] Failed to list files in ${path}:`, errorMessage);
      return [];
    }
  }
  
  public async readJSON<T>(path: string): Promise<T | null> {
    const data = await this.readFile<T>(path);
    return data;
  }
  
  public async writeJSON<T>(path: string, data: T): Promise<void> {
    await this.writeFile(path, data);
  }
}

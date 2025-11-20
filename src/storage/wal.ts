/**
 * Write-Ahead Log (WAL) Storage Implementation
 * Simple file-based persistence for personas and debate sessions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { WALStorage } from '../types.js';

export class FileBasedWAL implements WALStorage {
  private storageDir: string;

  constructor(storageDir: string = './wal-storage') {
    this.storageDir = storageDir;
  }

  /**
   * Initialize storage directory
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * List all keys with optional prefix filter
   */
  async list(prefix?: string): Promise<string[]> {
    await this.init();

    try {
      const files = await fs.readdir(this.storageDir);
      const keys = files
        .filter(f => f.endsWith('.json'))
        .map(f => f.slice(0, -5)); // Remove .json extension

      if (prefix) {
        return keys.filter(k => k.startsWith(prefix));
      }

      return keys;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get value by key
   */
  async get<T>(key: string): Promise<T | null> {
    await this.init();

    const filePath = this.getFilePath(key);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Put (write/update) value by key
   */
  async put<T>(key: string, value: T): Promise<void> {
    await this.init();

    const filePath = this.getFilePath(key);
    const data = JSON.stringify(value, null, 2);

    // Write-ahead: write to temp file first, then rename (atomic operation)
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, data, 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  /**
   * Delete value by key
   */
  async delete(key: string): Promise<void> {
    await this.init();

    const filePath = this.getFilePath(key);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Clear all storage (use with caution!)
   */
  async clear(): Promise<void> {
    await this.init();

    const files = await fs.readdir(this.storageDir);
    await Promise.all(
      files.map(f => fs.unlink(path.join(this.storageDir, f)))
    );
  }

  /**
   * Get file path for a key
   */
  private getFilePath(key: string): string {
    // Sanitize key to prevent directory traversal
    const sanitizedKey = key.replace(/[^a-zA-Z0-9:_-]/g, '_');
    return path.join(this.storageDir, `${sanitizedKey}.json`);
  }

  /**
   * Get all entries with a prefix (convenience method)
   */
  async getAllWithPrefix<T>(prefix: string): Promise<Map<string, T>> {
    const keys = await this.list(prefix);
    const entries = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        entries.set(key, value);
      }
    }

    return entries;
  }
}

// Export singleton instance
export const wal = new FileBasedWAL();

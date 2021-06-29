import { RedisClient } from 'redis';
import { promisify } from 'util';

export interface RedisClientAsync extends RedisClient {
  getAsync(key: string): Promise<string | null>;
  hgetAsync(key: string, field: string): Promise<string | null>;
}

export const asyncClient = (client: RedisClient): RedisClientAsync => {
  const getAsync = promisify(client.get).bind(client);
  const hgetAsync = promisify(client.hget).bind(client);
  return Object.assign(client, {
    getAsync,
    hgetAsync,
  });
}

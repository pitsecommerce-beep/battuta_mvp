import NodeCache from 'node-cache';

export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function invalidateBotConfig(tenantId: string): void {
  cache.del(`botconfig:${tenantId}`);
}

export function invalidateProducts(tenantId: string): void {
  const keys = cache.keys().filter((k) => k.startsWith(`products:${tenantId}:`));
  keys.forEach((k) => cache.del(k));
}

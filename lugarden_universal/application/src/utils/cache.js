// 简单内存缓存（C-6 将在公开接口接入；此处先提供失效钩子供 C-4 调用）

const store = new Map();

export function setCache(key, value, ttlMs = 60000) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function invalidate(patternOrKeys) {
  if (!patternOrKeys) return;
  const keys = Array.isArray(patternOrKeys) ? patternOrKeys : [patternOrKeys];
  for (const k of keys) {
    if (k === '*') {
      store.clear();
      continue;
    }
    // 简单的前缀匹配：以 k 为前缀的键全部失效
    for (const key of store.keys()) {
      if (key === k || key.startsWith(k)) store.delete(key);
    }
  }
}

export function keys() {
  return Array.from(store.keys());
}



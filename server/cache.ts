import NodeCache from "node-cache";

// Ensure the cache instance is created only once and shared across calls
const globalCache = global as typeof global & { _nodeCache?: NodeCache };

if (!globalCache._nodeCache) {
    globalCache._nodeCache = new NodeCache({ stdTTL: 100 });
}

export default globalCache._nodeCache!;
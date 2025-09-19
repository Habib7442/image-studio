// Global image store that persists across requests
// In production, use Redis or a database
declare global {
  var imageStore: Map<string, string> | undefined;
}

// Use global variable to persist across requests
const getImageStore = () => {
  if (!global.imageStore) {
    global.imageStore = new Map<string, string>();
  }
  return global.imageStore;
};

export const imageStoreService = {
  set: (requestId: string, imageData: string) => {
    const store = getImageStore();
    store.set(requestId, imageData);
    console.log(`Stored image for requestId: ${requestId}, store size: ${store.size}`);
  },
  
  get: (requestId: string): string | undefined => {
    const store = getImageStore();
    const image = store.get(requestId);
    console.log(`Retrieved image for requestId: ${requestId}, found: ${!!image}, store size: ${store.size}`);
    return image;
  },
  
  delete: (requestId: string) => {
    const store = getImageStore();
    store.delete(requestId);
    console.log(`Deleted image for requestId: ${requestId}, store size: ${store.size}`);
  },
  
  // Clean up old images (older than 1 hour)
  cleanup: () => {
    const store = getImageStore();
    // This is a simple implementation - in production you'd use timestamps
    // For now, we'll just clear the store periodically
    if (store.size > 100) {
      store.clear();
      console.log('Cleared image store due to size limit');
    }
  }
};

// Clean up every 5 minutes
setInterval(() => {
  imageStoreService.cleanup();
}, 5 * 60 * 1000);

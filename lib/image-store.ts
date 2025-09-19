// Simple in-memory image store for development
// In production, use Redis or a database
const imageStore = new Map<string, string>();

export const imageStoreService = {
  set: (requestId: string, imageData: string) => {
    imageStore.set(requestId, imageData);
  },
  
  get: (requestId: string): string | undefined => {
    return imageStore.get(requestId);
  },
  
  delete: (requestId: string) => {
    imageStore.delete(requestId);
  },
  
  // Clean up old images (older than 1 hour)
  cleanup: () => {
    // This is a simple implementation - in production you'd use timestamps
    // For now, we'll just clear the store periodically
    if (imageStore.size > 100) {
      imageStore.clear();
    }
  }
};

// Clean up every 5 minutes
setInterval(() => {
  imageStoreService.cleanup();
}, 5 * 60 * 1000);

import { ethers } from "ethers";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
export const DEFAULT_RECONNECT_DELAY = 3000; // ms

export function createWebSocketProvider(
  url: string,
  onClose: () => void,
  onError: (error: any) => void
): ethers.WebSocketProvider {
  const provider = new ethers.WebSocketProvider(url);
  
  // Set up WebSocket error handler for reconnection
  const websocket = (provider.provider as any)._websocket;
  if (websocket) {
    websocket.onclose = onClose;
    websocket.onerror = onError;
  }
  
  return provider;
}

export interface WebSocketManager {
  initialize(): ethers.WebSocketProvider;
  getProvider(): ethers.WebSocketProvider | null;
}

/**
 * Create a WebSocket manager with automatic reconnection
 * @param url WebSocket URL
 * @param options Reconnection options
 * @param callbacks Callbacks for reconnection events
 * @returns WebSocketManager with minimal exposed API
 */
export function createWebSocketManager(
  url: string,
  options: {
    maxAttempts?: number;
    reconnectDelay?: number;
  } = {},
  callbacks: {
    onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
    onReconnectSuccess?: (provider: ethers.WebSocketProvider) => void;
    onReconnectFailure?: (error: any) => void;
    onSubscriptionSetup?: (provider: ethers.WebSocketProvider) => Promise<boolean>;
  } = {}
): WebSocketManager {
  const maxAttempts = options.maxAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
  const reconnectDelay = options.reconnectDelay || DEFAULT_RECONNECT_DELAY;
  let provider: ethers.WebSocketProvider | null = null;
  let isReconnecting = false;
  
  const attemptReconnect = async (attempt: number = 1): Promise<boolean> => {
    if (isReconnecting) return false;
    isReconnecting = true;
    
    if (attempt > maxAttempts) {
      console.error(`Failed to reconnect after ${maxAttempts} attempts.`);
      if (callbacks.onReconnectFailure) {
        callbacks.onReconnectFailure(new Error(`Max reconnection attempts (${maxAttempts}) exceeded`));
      }
      isReconnecting = false;
      return false;
    }
    
    if (callbacks.onReconnectAttempt) {
      callbacks.onReconnectAttempt(attempt, maxAttempts);
    } else {
      console.log(`Reconnection attempt ${attempt}/${maxAttempts}...`);
    }
    
    try {
      // Wait before reconnecting
      await sleep(reconnectDelay);
      
      // Create new WebSocket provider
      provider = createWebSocketProvider(
        url,
        () => {
          console.log("WebSocket connection closed. Attempting to reconnect...");
          attemptReconnect(attempt + 1);
        },
        (error) => {
          console.error("WebSocket error:", error);
          if (!isReconnecting) {
            attemptReconnect(attempt + 1);
          }
        }
      );
      
      // Set up subscriptions
      let setupSuccess = true;
      if (callbacks.onSubscriptionSetup) {
        setupSuccess = await callbacks.onSubscriptionSetup(provider);
      }
      
      if (setupSuccess) {
        isReconnecting = false;
        if (callbacks.onReconnectSuccess) {
          callbacks.onReconnectSuccess(provider);
        } else {
          console.log("Successfully reconnected and resubscribed to events");
        }
        return true;
      } else {
        throw new Error("Failed to set up subscriptions");
      }
    } catch (error) {
      console.error("Reconnection failed:", error);
      // Try again with incremented attempt count
      setTimeout(() => attemptReconnect(attempt + 1), reconnectDelay);
      return false;
    }
  };
  
  // Create initial provider (public method)
  const initialize = (): ethers.WebSocketProvider => {
    if (provider) return provider;
    
    provider = createWebSocketProvider(
      url,
      () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        attemptReconnect();
      },
      (error) => {
        console.error("WebSocket error:", error);
        if (!isReconnecting) {
          attemptReconnect();
        }
      }
    );
    
    return provider;
  };
  
  // Return only public methods
  return {
    initialize,
    getProvider: () => provider
  };
}

// Simple network utility for offline-first functionality
// This can be enhanced later with more sophisticated network detection

export class NetworkUtils {
  private static isOnline: boolean = true;
  private static listeners: ((isOnline: boolean) => void)[] = [];

  // Set online status
  static setOnlineStatus(isOnline: boolean) {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.notifyListeners();
    }
  }

  // Get current online status
  static getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Add listener for network status changes
  static addListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  // Simple network check using a lightweight request
  static async checkConnectivity(): Promise<boolean> {
    try {
      // Use a simple, fast endpoint for connectivity check
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        timeout: 3000, // 3 second timeout
      } as any);
      
      this.setOnlineStatus(true);
      return true;
    } catch (error) {
      this.setOnlineStatus(false);
      return false;
    }
  }

  // Periodic connectivity check
  static startPeriodicCheck(intervalMs: number = 30000) {
    const checkConnectivity = async () => {
      await this.checkConnectivity();
    };

    // Initial check
    checkConnectivity();

    // Set up periodic check
    const interval = setInterval(checkConnectivity, intervalMs);

    return () => clearInterval(interval);
  }

  // Manual connectivity toggle (for testing)
  static toggleConnectivity() {
    this.setOnlineStatus(!this.isOnline);
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageUtils {
  // Save data with error handling
  static async saveData(key: string, data: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  // Load data with error handling
  static async loadData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      return null;
    }
  }

  // Remove data with error handling
  static async removeData(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      return false;
    }
  }

  // Clear all app data
  static async clearAllData(): Promise<boolean> {
    try {
      const keys = ['tasks', 'logs', 'pendingOperations', 'user'];
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Get storage info
  static async getStorageInfo(): Promise<{keys: string[], size: number}> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      const size = data.reduce((total, [key, value]) => {
        return total + (value ? value.length : 0);
      }, 0);
      
      return { keys, size };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { keys: [], size: 0 };
    }
  }

  // Backup data
  static async backupData(): Promise<string | null> {
    try {
      const keys = ['tasks', 'logs', 'pendingOperations'];
      const data = await AsyncStorage.multiGet(keys);
      const backup = data.reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = JSON.parse(value);
        }
        return acc;
      }, {} as any);
      
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Restore data from backup
  static async restoreData(backupData: string): Promise<boolean> {
    try {
      const data = JSON.parse(backupData);
      const entries = Object.entries(data).map(([key, value]) => [key, JSON.stringify(value)]);
      await AsyncStorage.multiSet(entries);
      return true;
    } catch (error) {
      console.error('Error restoring data:', error);
      return false;
    }
  }
}

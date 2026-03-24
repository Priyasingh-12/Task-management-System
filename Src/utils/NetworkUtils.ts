import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';

type NetworkListener = (isOnline: boolean) => void;

/**
 * NetworkUtils — wraps @react-native-community/netinfo for reliable
 * connectivity detection on both iOS and Android.
 *

 */
export class NetworkUtils {
  static toggleConnectivity() {
    throw new Error('Method not implemented.');
  }
  private static subscription: NetInfoSubscription | null = null;

  /**
   * Start listening for real network changes.
   * Returns an unsubscribe function — call it in useEffect cleanup.
   */
  static addListener(callback: NetworkListener): () => void {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      callback(online);
    });

    return unsubscribe;
  }

  /**
   * One-shot check of current connectivity.
   * Uses NetInfo.fetch() which returns the actual native network state.
   */
  static async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return !!(state.isConnected && state.isInternetReachable);
    } catch {
      return false;
    }
  }

  /**
   * Start periodic connectivity checks.
   * Returns a cleanup function to clear the interval.
   *
   * Note: NetInfo already fires events on change, so periodic checks are
   * only needed as a safety net for edge cases (e.g. captive portals).
   * Default interval is 60s — no need to hammer the network.
   */
  static startPeriodicCheck(
    intervalMs: number = 60_000,
    onResult?: NetworkListener,
  ): () => void {
    const run = async () => {
      const online = await NetworkUtils.checkConnectivity();
      onResult?.(online);
    };

    run(); // immediate first check
    const interval = setInterval(run, intervalMs);

    return () => clearInterval(interval);
  }
}

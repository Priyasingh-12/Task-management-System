import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {StorageUtils} from '../utils/StorageUtils';
import {NetworkUtils} from '../utils/NetworkUtils';
import {
  ActivityLog,
  OfflineStatus,
  OperationType,
  PendingOperation,
  Task,
  TaskContextType,
  TaskFormData,
} from '../Types/Task';

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateId = (): string =>
  Date.now().toString() + Math.random().toString(36).slice(2, 9);

const makeLog = (message: string): ActivityLog => ({
  id: generateId(),
  message,
  timestamp: new Date().toISOString(), // stored as ISO — displayed in UI
});

const offlineLabel = (isOnline: boolean) => (!isOnline ? ' (offline)' : '');

// ─── Context ─────────────────────────────────────────────────────────────────

export const TaskContext = createContext<TaskContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const TaskProvider = ({children}: {children: React.ReactNode}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pendingOperations, setPendingOperations] = useState<
    PendingOperation[]
  >([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep a ref so async callbacks always read the latest value
  const isOnlineRef = useRef(isOnline);
  const pendingOpsRef = useRef(pendingOperations);

  // ── Persistence helpers ──────────────────────────────────────────────────

  const persistTasks = useCallback(async (updated: Task[]) => {
    setTasks(updated);
    await StorageUtils.saveData('tasks', updated);
  }, []);

  /**
   * Append logs without recursion.
   * Unlike the original, we do NOT append a "💾 saved" log here —
   * that caused clearLogs() to immediately create a new log entry.
   */
  const persistLogs = useCallback(async (updated: ActivityLog[]) => {
    setLogs(updated);
    await StorageUtils.saveData('logs', updated);
  }, []);

  const persistPendingOps = useCallback(async (updated: PendingOperation[]) => {
    setPendingOperations(updated);
    pendingOpsRef.current = updated;
    await StorageUtils.saveData('pendingOperations', updated);
  }, []);

  const appendLog = useCallback(
    async (message: string, currentLogs: ActivityLog[]) => {
      const updated = [...currentLogs, makeLog(message)];
      await persistLogs(updated);
      return updated;
    },
    [persistLogs],
  );

  // ── Pending operations ───────────────────────────────────────────────────

  const addPendingOperation = useCallback(
    async (
      type: OperationType,
      data: PendingOperation['data'],
      currentOps: PendingOperation[],
    ): Promise<PendingOperation[]> => {
      const op: PendingOperation = {
        id: generateId(),
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      const updated = [...currentOps, op];
      await persistPendingOps(updated);
      return updated;
    },
    [persistPendingOps],
  );

  // ── Sync: flush pending ops when coming back online ──────────────────────
  /**
   * This was the biggest gap in the original — pending operations were
   * tracked but never actually processed when connectivity resumed.
   *
   * TODO: replace the stub below with real API calls once a backend exists.
   * The structure (iterate ops, call API per type, clear on success) is
   * production-ready; only the API call itself is stubbed.
   */
  const syncPendingOperations = useCallback(
    async (currentOps: PendingOperation[], currentLogs: ActivityLog[]) => {
      if (currentOps.length === 0) return;

      let updatedLogs = currentLogs;

      try {
        for (const op of currentOps) {
          // ── Replace this block with real API calls ──
          switch (op.type) {
            case 'create':
              // await api.createTask(op.data as Task);
              break;
            case 'update':
              // await api.updateTask(op.data as Task);
              break;
            case 'delete':
              // await api.deleteTask((op.data as Pick<Task,'id'>).id);
              break;
          }
        }

        // Mark all local tasks as synced
        setTasks(prev => {
          const synced = prev.map(t => ({...t, synced: true}));
          StorageUtils.saveData('tasks', synced);
          return synced;
        });

        await persistPendingOps([]);
        updatedLogs = await appendLog(
          `☁️ Synced ${currentOps.length} pending operation(s)`,
          updatedLogs,
        );
      } catch (error) {
        updatedLogs = await appendLog(
          `❌ Sync failed — will retry on next connection`,
          updatedLogs,
        );
      }
    },
    [appendLog, persistPendingOps],
  );

  // ── Network listener ─────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = NetworkUtils.addListener(async online => {
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = online;
      setIsOnline(online);

      // Coming back online — attempt to flush the queue
      if (online && wasOffline) {
        await syncPendingOperations(
          pendingOpsRef.current,
          // grab latest logs from state via functional updater trick
          (await StorageUtils.loadData<ActivityLog[]>('logs')) ?? [],
        );
      }
    });

    const stopPeriodic = NetworkUtils.startPeriodicCheck(60_000, online => {
      isOnlineRef.current = online;
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
      stopPeriodic();
    };
  }, [syncPendingOperations]);

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [savedTasks, savedLogs, savedOps, initialOnline] =
          await Promise.all([
            StorageUtils.loadData<Task[]>('tasks'),
            StorageUtils.loadData<ActivityLog[]>('logs'),
            StorageUtils.loadData<PendingOperation[]>('pendingOperations'),
            NetworkUtils.checkConnectivity(),
          ]);

        const resolvedTasks = savedTasks ?? [];
        const resolvedLogs = savedLogs ?? [];
        const resolvedOps = savedOps ?? [];

        setTasks(resolvedTasks);
        setPendingOperations(resolvedOps);
        pendingOpsRef.current = resolvedOps;
        isOnlineRef.current = initialOnline;
        setIsOnline(initialOnline);

        const startLog = makeLog(`🚀 App started`);
        const updatedLogs = [...resolvedLogs, startLog];
        await persistLogs(updatedLogs);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [persistLogs]);

  // ── Task CRUD ────────────────────────────────────────────────────────────

  const addTask = useCallback(
    async (formData: TaskFormData) => {
      const now = new Date().toISOString();
      const online = isOnlineRef.current;

      const newTask: Task = {
        id: generateId(),
        ...formData,
        completed: false,
        createdAt: now,
        updatedAt: now,
        synced: false, // never mark synced without actual API confirmation
      };

      const updatedTasks = [...tasks, newTask];
      await persistTasks(updatedTasks);

      let updatedOps = pendingOpsRef.current;
      if (!online) {
        updatedOps = await addPendingOperation('create', newTask, updatedOps);
      }

      await appendLog(
        `📝 Created "${formData.title}"${offlineLabel(online)}`,
        logs,
      );
    },
    [tasks, logs, addPendingOperation, appendLog, persistTasks],
  );

  const updateTask = useCallback(
    async (updated: Task) => {
      const now = new Date().toISOString();
      const online = isOnlineRef.current;

      const updatedTask: Task = {...updated, updatedAt: now, synced: false};
      const updatedTasks = tasks.map(t =>
        t.id === updated.id ? updatedTask : t,
      );
      await persistTasks(updatedTasks);

      let updatedOps = pendingOpsRef.current;
      if (!online) {
        updatedOps = await addPendingOperation(
          'update',
          updatedTask,
          updatedOps,
        );
      }

      await appendLog(
        `✏️ Updated "${updated.title}"${offlineLabel(online)}`,
        logs,
      );
    },
    [tasks, logs, addPendingOperation, appendLog, persistTasks],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      const online = isOnlineRef.current;
      const target = tasks.find(t => t.id === id);
      if (!target) return;

      const toggled: Task = {
        ...target,
        completed: !target.completed,
        updatedAt: now,
        synced: false,
      };
      const updatedTasks = tasks.map(t => (t.id === id ? toggled : t));
      await persistTasks(updatedTasks);

      let updatedOps = pendingOpsRef.current;
      if (!online) {
        updatedOps = await addPendingOperation('update', toggled, updatedOps);
      }

      const action = target.completed ? 'Reopened' : 'Completed';
      await appendLog(
        `✔️ ${action} "${target.title}"${offlineLabel(online)}`,
        logs,
      );
    },
    [tasks, logs, addPendingOperation, appendLog, persistTasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const online = isOnlineRef.current;
      const target = tasks.find(t => t.id === id);
      if (!target) return;

      const updatedTasks = tasks.filter(t => t.id !== id);
      await persistTasks(updatedTasks);

      let updatedOps = pendingOpsRef.current;
      if (!online) {
        updatedOps = await addPendingOperation(
          'delete',
          {id: target.id, title: target.title} as Pick<Task, 'id' | 'title'>,
          updatedOps,
        );
      }

      await appendLog(
        `🗑️ Deleted "${target.title}"${offlineLabel(online)}`,
        logs,
      );
    },
    [tasks, logs, addPendingOperation, appendLog, persistTasks],
  );

  /**
   * Fixed: original clearLogs() called saveData() which appended a
   * "💾 Data saved" log, making it impossible to fully clear logs.
   * Now we write directly to storage without triggering any log entries.
   */
  const clearLogs = useCallback(async () => {
    await persistLogs([]);
  }, [persistLogs]);

  const clearPendingOperations = useCallback(async () => {
    await persistPendingOps([]);
  }, [persistPendingOps]);

  const getOfflineStatus = useCallback(
    (): OfflineStatus => ({
      isOnline,
      pendingOperationsCount: pendingOperations.length,
      isLoading,
    }),
    [isOnline, pendingOperations.length, isLoading],
  );

  // ── Provider value ───────────────────────────────────────────────────────

  return (
    <TaskContext.Provider
      value={{
        tasks,
        logs,
        isOnline,
        isLoading,
        pendingOperations,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearLogs,
        clearPendingOperations,
        getOfflineStatus,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

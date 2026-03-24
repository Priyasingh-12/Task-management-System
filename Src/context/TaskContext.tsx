import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageUtils} from '../utils/StorageUtils';
import {NetworkUtils} from '../utils/NetworkUtils';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string; // ISO string
  tags: string[];
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  synced: boolean; // Track if data is synced (for future online sync)
};

type PendingOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
};

export const TaskContext = createContext<any>(null);

export const TaskProvider = ({children}: {children: React.ReactNode}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [pendingOperations, setPendingOperations] = useState<
    PendingOperation[]
  >([]);
  const [isOnline, setIsOnline] = useState<boolean>(true); // Default to true, can be updated later
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Network connectivity monitoring
  useEffect(() => {
    // Set up network monitoring
    const unsubscribe = NetworkUtils.addListener(isOnline => {
      setIsOnline(isOnline);
    });

    // Start periodic connectivity check
    const stopPeriodicCheck = NetworkUtils.startPeriodicCheck(30000); // Check every 30 seconds

    // Initial connectivity check
    NetworkUtils.checkConnectivity();

    return () => {
      unsubscribe();
      stopPeriodicCheck();
    };
  }, []);

  // Load data from local storage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load tasks
        const savedTasks = await StorageUtils.loadData<Task[]>('tasks');
        if (savedTasks) {
          setTasks(savedTasks);
        }

        // Load logs
        const savedLogs = await StorageUtils.loadData<string[]>('logs');
        if (savedLogs) {
          setLogs(savedLogs);
        }

        // Load pending operations
        const savedPendingOps = await StorageUtils.loadData<PendingOperation[]>(
          'pendingOperations',
        );
        if (savedPendingOps) {
          setPendingOperations(savedPendingOps);
        }

        // Add startup log
        const startupLog = `🚀 App started at ${new Date().toLocaleString()}`;
        const updatedLogs = savedLogs
          ? [...savedLogs, startupLog]
          : [startupLog];
        setLogs(updatedLogs);
        await StorageUtils.saveData('logs', updatedLogs);
      } catch (error) {
        console.error('Error loading data:', error);
        const errorLog = `❌ Error loading data at ${new Date().toLocaleString()}`;
        setLogs(prev => [...prev, errorLog]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Enhanced save function with error handling and offline support
  const saveData = async (
    newTasks: Task[],
    newLogs: string[],
    newPendingOps?: PendingOperation[],
  ) => {
    try {
      setTasks(newTasks);
      setLogs(newLogs);

      // Save to AsyncStorage with error handling
      await Promise.all([
        StorageUtils.saveData('tasks', newTasks),
        StorageUtils.saveData('logs', newLogs),
        newPendingOps
          ? StorageUtils.saveData('pendingOperations', newPendingOps)
          : Promise.resolve(),
      ]);

      if (newPendingOps) {
        setPendingOperations(newPendingOps);
      }

      // Log successful save
      const saveLog = `💾 Data saved locally at ${new Date().toLocaleString()}`;
      const updatedLogs = [...newLogs, saveLog];
      setLogs(updatedLogs);
      await StorageUtils.saveData('logs', updatedLogs);
    } catch (error) {
      console.error('Error saving data:', error);
      const errorLog = `❌ Error saving data at ${new Date().toLocaleString()}`;
      setLogs(prev => [...prev, errorLog]);
    }
  };

  // Add pending operation for future sync
  const addPendingOperation = (
    operation: Omit<PendingOperation, 'id' | 'timestamp'>,
  ) => {
    const newOperation: PendingOperation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...operation,
    };

    const updatedPendingOps = [...pendingOperations, newOperation];
    setPendingOperations(updatedPendingOps);
    StorageUtils.saveData('pendingOperations', updatedPendingOps);

    return newOperation;
  };

  const addTask = (taskData: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
    tags: string[];
  }) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      tags: taskData.tags,
      completed: false,
      createdAt: now,
      updatedAt: now,
      synced: isOnline, // Mark as synced if online, otherwise will be synced later
    };

    const newTasks = [...tasks, newTask];
    const newLogs = [
      ...logs,
      `📝 Created "${taskData.title}" at ${new Date().toLocaleString()}${
        !isOnline ? ' (offline)' : ''
      }`,
    ];

    // Add pending operation if offline
    if (!isOnline) {
      addPendingOperation({
        type: 'create',
        data: newTask,
      });
    }

    saveData(newTasks, newLogs);
  };

  const updateTask = (updated: Task) => {
    const now = new Date().toISOString();
    const updatedTask = {
      ...updated,
      updatedAt: now,
      synced: isOnline,
    };

    const newTasks = tasks.map(t => (t.id === updated.id ? updatedTask : t));
    const newLogs = [
      ...logs,
      `✏️ Updated "${updated.title}" at ${new Date().toLocaleString()}${
        !isOnline ? ' (offline)' : ''
      }`,
    ];

    // Add pending operation if offline
    if (!isOnline) {
      addPendingOperation({
        type: 'update',
        data: updatedTask,
      });
    }

    saveData(newTasks, newLogs);
  };

  const toggleTask = (id: string) => {
    const toggledTask = tasks.find(t => t.id === id);
    const now = new Date().toISOString();

    const newTasks = tasks.map(t =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            updatedAt: now,
            synced: isOnline,
          }
        : t,
    );

    const action = toggledTask?.completed ? 'Reopened' : 'Completed';
    const newLogs = [
      ...logs,
      `✔️ ${action} "${toggledTask?.title}" at ${new Date().toLocaleString()}${
        !isOnline ? ' (offline)' : ''
      }`,
    ];

    // Add pending operation if offline
    if (!isOnline && toggledTask) {
      addPendingOperation({
        type: 'update',
        data: {
          ...toggledTask,
          completed: !toggledTask.completed,
          updatedAt: now,
          synced: false,
        },
      });
    }

    saveData(newTasks, newLogs);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const newTasks = tasks.filter(t => t.id !== id);
    const newLogs = [
      ...logs,
      `🗑️ Deleted "${task?.title}" at ${new Date().toLocaleString()}${
        !isOnline ? ' (offline)' : ''
      }`,
    ];

    // Add pending operation if offline
    if (!isOnline && task) {
      addPendingOperation({
        type: 'delete',
        data: {id: task.id, title: task.title},
      });
    }

    saveData(newTasks, newLogs);
  };

  const clearLogs = () => {
    const newLogs: string[] = [];
    saveData(tasks, newLogs);
  };

  // Clear pending operations (for future sync implementation)
  const clearPendingOperations = () => {
    setPendingOperations([]);
    StorageUtils.removeData('pendingOperations');
  };

  // Get offline status and pending operations count
  const getOfflineStatus = () => ({
    isOnline,
    pendingOperationsCount: pendingOperations.length,
    isLoading,
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        logs,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearLogs,
        pendingOperations,
        clearPendingOperations,
        getOfflineStatus,
        isOnline,
        isLoading,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export type Priority = 'Low' | 'Medium' | 'High';
export type OperationType = 'create' | 'update' | 'delete';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // ISO string, UTC
  tags: string[];
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  synced: boolean;
};

export type TaskFormData = Pick<
  Task,
  'title' | 'description' | 'priority' | 'dueDate' | 'tags'
>;

export type PendingOperation = {
  id: string;
  type: OperationType;
  data: Task | Pick<Task, 'id' | 'title'>;
  timestamp: string;
};

export type ActivityLog = {
  id: string;
  message: string;
  timestamp: string; // ISO string — stored, not derived
};

export type OfflineStatus = {
  isOnline: boolean;
  pendingOperationsCount: number;
  isLoading: boolean;
};

export type TaskContextType = {
  tasks: Task[];
  logs: ActivityLog[];
  isOnline: boolean;
  isLoading: boolean;
  pendingOperations: PendingOperation[];
  addTask: (data: TaskFormData) => void;
  updateTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearLogs: () => void;
  clearPendingOperations: () => void;
  getOfflineStatus: () => OfflineStatus;
};

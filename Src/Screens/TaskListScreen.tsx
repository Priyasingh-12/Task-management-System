import React, {useContext, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';

import {Task} from '../Types/Task';
import TaskItem from '../Component/TaskItem';
import OfflineIndicator from '../Component/OfflineIndicator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  navigation: StackNavigationProp<any, any>;
};

type GroupKey = 'Overdue' | 'Today' | 'Upcoming';

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskListScreen({navigation}: Props) {
  const context = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  if (!context) return null;
  const {tasks, toggleTask, deleteTask} = context;

  // Compute styles once per render (outside renderGroup)
  const styles = getStyles(darkMode, insets);

  // ── Date helpers (memoised) ────────────────────────────────────────────

  /**
   * Fixed grouping logic:
   * - "Today"    → dueDate is exactly today, task is incomplete
   * - "Upcoming" → dueDate is strictly AFTER today (not >= today)
   *                 so today's tasks don't appear in both groups
   * - "Overdue"  → dueDate is before start of today, task is incomplete
   */
  const {grouped, completedTasks} = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const incomplete = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    return {
      grouped: {
        Overdue: incomplete.filter(t => new Date(t.dueDate) < startOfToday),
        Today: incomplete.filter(t => {
          const d = new Date(t.dueDate);
          return d >= startOfToday && d <= endOfToday;
        }),
        Upcoming: incomplete.filter(t => new Date(t.dueDate) > endOfToday),
      },
      completedTasks: completed,
    };
  }, [tasks]);

  // ── Filter ─────────────────────────────────────────────────────────────

  const applyFilters = (list: Task[]): Task[] =>
    list.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'All' || t.priority === priorityFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' && t.completed) ||
        (statusFilter === 'Pending' && !t.completed);

      return matchesSearch && matchesPriority && matchesStatus;
    });

  // ── Handlers ───────────────────────────────────────────────────────────

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const confirmDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ],
    );
  };

  // ── Renderers ──────────────────────────────────────────────────────────

  const renderTaskItem = (item: Task) => (
    <TaskItem
      key={item.id}
      task={item}
      onPress={() => navigation.navigate('TaskForm', {task: item})}
      onToggle={() => toggleTask(item.id)}
      onDelete={() => confirmDelete(item)}
    />
  );

  const renderGroup = (title: GroupKey, list: Task[]) => {
    const filtered = applyFilters(list);
    if (filtered.length === 0) return null; // Don't render empty groups

    const GROUP_META: Record<GroupKey, {icon: string; color: string}> = {
      Overdue: {icon: '🔴', color: '#e74c3c'},
      Today: {icon: '📅', color: '#3498db'},
      Upcoming: {icon: '🗓️', color: '#27ae60'},
    };
    const meta = GROUP_META[title];

    return (
      <View key={title} style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupIcon}>{meta.icon}</Text>
          <Text style={[styles.groupTitle, {color: meta.color}]}>{title}</Text>
          <View style={[styles.countBadge, {backgroundColor: meta.color}]}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>
        {filtered.map(renderTaskItem)}
      </View>
    );
  };

  const renderCompleted = () => {
    const filtered = applyFilters(completedTasks);
    if (filtered.length === 0) return null;

    return (
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupIcon}>✅</Text>
          <Text style={[styles.groupTitle, {color: '#7f8c8d'}]}>Completed</Text>
          <View style={[styles.countBadge, {backgroundColor: '#7f8c8d'}]}>
            <Text style={styles.countText}>{filtered.length}</Text>
          </View>
        </View>
        {filtered.map(renderTaskItem)}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.mainEmptyState}>
      <Text style={styles.mainEmptyIcon}>📋</Text>
      <Text style={styles.mainEmptyTitle}>No tasks yet</Text>
      <Text style={styles.mainEmptySubtitle}>
        Create your first task to get started!
      </Text>
      <TouchableOpacity
        style={styles.createFirstTaskButton}
        onPress={() => navigation.navigate('TaskForm', {task: null})}>
        <Text style={styles.createFirstTaskText}>Create Your First Task</Text>
      </TouchableOpacity>
    </View>
  );

  const hasAnyVisible =
    applyFilters([
      ...grouped.Overdue,
      ...grouped.Today,
      ...grouped.Upcoming,
      ...completedTasks,
    ]).length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <OfflineIndicator />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={darkMode ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Tasks</Text>
          <Text style={styles.taskCount}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Search tasks, tags..."
            placeholderTextColor={darkMode ? '#666' : '#aaa'}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priorityFilter}
                style={styles.picker}
                onValueChange={setPriorityFilter}>
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={statusFilter}
                style={styles.picker}
                onValueChange={setStatusFilter}>
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Completed" value="Completed" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Task groups */}
        {tasks.length === 0 ? (
          renderEmptyState()
        ) : !hasAnyVisible ? (
          <View style={styles.noResultsState}>
            <Text style={styles.noResultsText}>
              No tasks match your filters.
            </Text>
          </View>
        ) : (
          <>
            {renderGroup('Overdue', grouped.Overdue)}
            {renderGroup('Today', grouped.Today)}
            {renderGroup('Upcoming', grouped.Upcoming)}
            {renderCompleted()}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm', {task: null})}
        accessibilityLabel="Add new task"
        accessibilityRole="button">
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (
  darkMode: boolean,
  insets: ReturnType<typeof useSafeAreaInsets>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#1a1a1a' : '#f4f6f8',
    },
    scrollView: {flex: 1},
    scrollContent: {
      paddingBottom: insets.bottom + 90, // room for FAB
      paddingTop: insets.top,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    screenTitle: {
      fontSize: 30,
      fontWeight: '800',
      color: darkMode ? '#ffffff' : '#1a1a2e',
      letterSpacing: -0.5,
    },
    taskCount: {
      fontSize: 14,
      color: darkMode ? '#888' : '#888',
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 14,
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      borderWidth: 1,
      borderColor: darkMode ? '#3a3a3a' : '#e0e0e0',
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    searchIcon: {
      fontSize: 14,
      marginRight: 8,
    },
    search: {
      flex: 1,
      paddingVertical: 13,
      fontSize: 15,
      color: darkMode ? '#ffffff' : '#1a1a2e',
    },
    clearSearch: {
      fontSize: 14,
      color: darkMode ? '#666' : '#aaa',
      paddingLeft: 8,
    },
    filtersContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    filterGroup: {flex: 1},
    filterLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: darkMode ? '#888' : '#888',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: darkMode ? '#3a3a3a' : '#e0e0e0',
      borderRadius: 10,
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      overflow: 'hidden',
    },
    picker: {
  
      color: darkMode ? '#ffffff' : '#1a1a2e',
    },
    groupContainer: {
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    groupIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    groupTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
    },
    countBadge: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    countText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    mainEmptyState: {
      alignItems: 'center',
      padding: 40,
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: darkMode ? '#3a3a3a' : '#e0e0e0',
    },
    mainEmptyIcon: {fontSize: 60, marginBottom: 16},
    mainEmptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: darkMode ? '#fff' : '#1a1a2e',
      marginBottom: 8,
    },
    mainEmptySubtitle: {
      fontSize: 15,
      color: darkMode ? '#888' : '#888',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    createFirstTaskButton: {
      backgroundColor: '#3498db',
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 12,
    },
    createFirstTaskText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    noResultsState: {
      alignItems: 'center',
      padding: 32,
    },
    noResultsText: {
      fontSize: 15,
      color: darkMode ? '#888' : '#aaa',
    },
    fab: {
      position: 'absolute',
      bottom: insets.bottom + 24,
      right: 24,
      backgroundColor: '#3498db',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#3498db',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    fabText: {
      fontSize: 30,
      color: '#fff',
      fontWeight: '300',
      lineHeight: 34,
    },
  });

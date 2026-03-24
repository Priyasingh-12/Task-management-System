import React, {useContext, useState} from 'react';
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
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';
import {StackNavigationProp} from '@react-navigation/stack';
import TaskItem from '../Component/TaskItem';
import OfflineIndicator from '../Component/OfflineIndicator';

type TaskListScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

export default function TaskListScreen({navigation}: TaskListScreenProps) {
  const {tasks, toggleTask, deleteTask} = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Group tasks
  const today = new Date();
  const todayString = today.toDateString();
  const grouped = {
    Today: tasks.filter(
      (t: {dueDate: string | number | Date; completed: boolean}) =>
        !t.completed && new Date(t.dueDate).toDateString() === todayString,
    ),
    Upcoming: tasks.filter(
      (t: {dueDate: string | number | Date; completed: boolean}) =>
        !t.completed && new Date(t.dueDate) > today,
    ),
    Overdue: tasks.filter(
      (t: {completed: boolean; dueDate: string | number | Date}) =>
        !t.completed && new Date(t.dueDate) < today,
    ),
  };

  // Search + filter
  const filterTasks = (list: any[]) =>
    list.filter(
      t =>
        (t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase())) &&
        (priorityFilter === 'All' || t.priority === priorityFilter) &&
        (statusFilter === 'All' ||
          (statusFilter === 'Completed' && t.completed) ||
          (statusFilter === 'Pending' && !t.completed)),
    );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderEmptyState = (title: string, count: number) => {
    if (count === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No {title.toLowerCase()} tasks</Text>
          <Text style={styles.emptySubtitle}>
            {title === 'Today'
              ? 'No tasks due today. Great job!'
              : title === 'Upcoming'
              ? 'No upcoming tasks scheduled.'
              : "No overdue tasks. You're all caught up!"}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderGroup = (title: string, list: any[]) => {
    const filteredList = filterTasks(list);
    const styles = getStyles(darkMode, insets);

    return (
      <View key={title} style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredList.length}</Text>
          </View>
        </View>

        {renderEmptyState(title, filteredList.length)}

        {filteredList.length > 0 && (
          <FlatList
            data={filteredList}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TaskItem
                task={item}
                onPress={() => navigation.navigate('TaskForm', {task: item})}
                onToggle={() => toggleTask(item.id)}
                onDelete={() =>
                  Alert.alert(
                    'Confirm Delete',
                    `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
                    [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Delete',
                        onPress: () => deleteTask(item.id),
                        style: 'destructive',
                      },
                    ],
                  )
                }
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  const renderMainEmptyState = () => {
    if (tasks.length === 0) {
      const styles = getStyles(darkMode, insets);
      return (
        <View style={styles.mainEmptyState}>
          <Text style={styles.mainEmptyIcon}>📋</Text>
          <Text style={styles.mainEmptyTitle}>No tasks yet</Text>
          <Text style={styles.mainEmptySubtitle}>
            Create your first task to get started with organizing your work!
          </Text>
          <TouchableOpacity
            style={styles.createFirstTaskButton}
            onPress={() => navigation.navigate('TaskForm', {task: null})}>
            <Text style={styles.createFirstTaskText}>
              Create Your First Task
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const styles = getStyles(darkMode, insets);

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
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Tasks</Text>
          <Text style={styles.taskCount}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.search}
            placeholder="Search tasks..."
            placeholderTextColor={darkMode ? '#999' : '#666'}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priorityFilter}
                style={styles.picker}
                onValueChange={setPriorityFilter}>
                <Picker.Item label="All Priorities" value="All" />
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
                <Picker.Item label="All Status" value="All" />
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Completed" value="Completed" />
              </Picker>
            </View>
          </View>
        </View>

        {renderMainEmptyState()}

        {tasks.length > 0 && (
          <>
            {renderGroup('Today', grouped.Today)}
            {renderGroup('Upcoming', grouped.Upcoming)}
            {renderGroup('Overdue', grouped.Overdue)}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm', {task: null})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (darkMode: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: insets?.bottom + 20,
      paddingTop: insets.top,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 5,
    },
    taskCount: {
      fontSize: 16,
      color: darkMode ? '#999' : '#666',
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    search: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      color: darkMode ? '#ffffff' : '#000000',
    },
    filtersContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 15,
    },
    filterGroup: {
      flex: 1,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: darkMode ? '#e0e0e0' : '#34495e',
      marginBottom: 8,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
    },
    picker: {
      height: 50,
      color: darkMode ? '#ffffff' : '#000000',
    },
    groupContainer: {
      marginBottom: 25,
      paddingHorizontal: 20,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    groupTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
    },
    countBadge: {
      backgroundColor: darkMode ? '#3498db' : '#007BFF',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    countText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    emptyState: {
      alignItems: 'center',
      padding: 30,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      borderRadius: 12,
      marginBottom: 10,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 15,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#e0e0e0' : '#34495e',
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 20,
    },
    mainEmptyState: {
      borderWidth: 0.2,
      alignItems: 'center',
      padding: 40,
      marginHorizontal: 20,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      borderRadius: 16,
      marginTop: 20,
    },
    mainEmptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    mainEmptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 10,
    },
    mainEmptySubtitle: {
      fontSize: 16,
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    createFirstTaskButton: {
      backgroundColor: '#3498db',
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 12,
    },
    createFirstTaskText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: '#3498db',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 0,
    },
    fabText: {
      fontSize: 28,
      color: '#fff',
      fontWeight: 'bold',
    },
  });

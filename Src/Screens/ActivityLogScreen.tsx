import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';
import {ActivityLog} from '../Types/Task';
import OfflineIndicator from '../Component/OfflineIndicator';

export default function ActivityLogScreen() {
  const context = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  if (!context) return null;
  const {logs, clearLogs} = context;

  const styles = getStyles(darkMode, insets);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // ── Render helpers ─────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No activity yet</Text>
      <Text style={styles.emptySubtitle}>
        Your task activities will appear here once you start creating, updating,
        or completing tasks.
      </Text>
    </View>
  );

  /**
   * Fixed: the original used `new Date().toLocaleTimeString()` at render
   * time, so every item showed the current time instead of when the log
   * was actually created. Now we read `item.timestamp` which is stored
   * as an ISO string when the log is created.
   */
  const renderItem = ({item, index}: ListRenderItemInfo<ActivityLog>) => {
    const isEven = index % 2 === 0;
    const date = new Date(item.timestamp);

    const timeLabel = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dateLabel = isToday(date)
      ? 'Today'
      : date.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        });

    return (
      <View style={[styles.logItem, isEven && styles.logItemEven]}>
        <View style={styles.logContent}>
          <Text style={styles.logText}>{item.message}</Text>
        </View>
        <View style={styles.logMeta}>
          <Text style={styles.timeText}>{timeLabel}</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <OfflineIndicator />

      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Activity Log</Text>
          <Text style={styles.subtitle}>
            {logs.length} {logs.length === 1 ? 'activity' : 'activities'}
          </Text>
        </View>
        {logs.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList<ActivityLog>
        data={[...logs].reverse()}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={darkMode ? '#fff' : '#000'}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          logs.length === 0 && styles.listContainerEmpty,
        ]}
      />
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
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
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
      paddingTop: insets.top,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      color: darkMode ? '#888' : '#888',
    },
    clearButton: {
      backgroundColor: '#e74c3c',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    clearButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: insets.bottom + 24,
    },
    listContainerEmpty: {
      flex: 1,
    },
    logItem: {
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      padding: 14,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#3a3a3a' : '#ebebeb',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logItemEven: {
      backgroundColor: darkMode ? '#252525' : '#f8f9fa',
    },
    logContent: {
      flex: 1,
      marginRight: 12,
    },
    logText: {
      fontSize: 14,
      color: darkMode ? '#e0e0e0' : '#2c3e50',
      lineHeight: 20,
    },
    logMeta: {
      alignItems: 'flex-end',
    },
    timeText: {
      fontSize: 12,
      fontWeight: '600',
      color: darkMode ? '#3498db' : '#2980b9',
    },
    dateText: {
      fontSize: 11,
      color: darkMode ? '#666' : '#aaa',
      marginTop: 2,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 15,
      color: darkMode ? '#888' : '#888',
      textAlign: 'center',
      lineHeight: 22,
    },
  });

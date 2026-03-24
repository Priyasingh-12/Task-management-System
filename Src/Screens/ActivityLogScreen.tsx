import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';
import OfflineIndicator from '../Component/OfflineIndicator';

export default function ActivityLogScreen() {
  const {logs, clearLogs} = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleClearLogs = () => {
    clearLogs();
  };

  const renderEmptyState = () => {
    const styles = getStyles(darkMode, insets);
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No activity yet</Text>
        <Text style={styles.emptySubtitle}>
          Your task activities will appear here once you start creating,
          updating, or completing tasks.
        </Text>
      </View>
    );
  };

  const renderLogItem = ({item, index}: {item: string; index: number}) => {
    const styles = getStyles(darkMode, insets);
    const isEven = index % 2 === 0;

    return (
      <View style={[styles.logItem, isEven && styles.logItemEven]}>
        <View style={styles.logContent}>
          <Text style={styles.logText}>{item}</Text>
        </View>
        <View style={styles.logTime}>
          <Text style={styles.timeText}>{new Date().toLocaleTimeString()}</Text>
        </View>
      </View>
    );
  };

  const styles = getStyles(darkMode, insets);

  return (
    <View style={styles.container}>
      <OfflineIndicator />
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Activity Log</Text>
        <Text style={styles.subtitle}>
          {logs.length} {logs.length === 1 ? 'activity' : 'activities'}
        </Text>
        {logs.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearLogs}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {logs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[...logs].reverse()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkMode ? '#fff' : '#000'}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const getStyles = (darkMode: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
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
    subtitle: {
      fontSize: 16,
      color: darkMode ? '#999' : '#666',
      marginBottom: 15,
    },
    clearButton: {
      backgroundColor: '#ff4444',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    clearButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
    },
    logItem: {
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      padding: 15,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#e0e0e0',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logItemEven: {
      backgroundColor: darkMode ? '#333' : '#f8f9fa',
    },
    logContent: {
      flex: 1,
      marginRight: 10,
    },
    logText: {
      fontSize: 14,
      color: darkMode ? '#ffffff' : '#2c3e50',
      lineHeight: 20,
    },
    logTime: {
      alignItems: 'flex-end',
    },
    timeText: {
      fontSize: 12,
      color: darkMode ? '#999' : '#666',
      fontStyle: 'italic',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      marginHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 24,
    },
  });

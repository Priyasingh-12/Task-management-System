import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';
import {NetworkUtils} from '../utils/NetworkUtils';

const OfflineStatusCard = () => {
  const {isOnline, pendingOperations, getOfflineStatus} =
    useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);

  const handleToggleConnectivity = () => {
    NetworkUtils.toggleConnectivity();
  };

  const handleCheckConnectivity = () => {
    NetworkUtils.checkConnectivity();
  };

  const status = getOfflineStatus();

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline-First Status</Text>
        <View
          style={[
            styles.statusIndicator,
            {backgroundColor: isOnline ? '#4CAF50' : '#FF5722'},
          ]}>
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          📱 Pending Operations: {pendingOperations.length}
        </Text>
        <Text style={styles.infoText}>
          🔄 Loading: {status.isLoading ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.infoText}>💾 Data Persistence: Active</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckConnectivity}>
          <Text style={styles.buttonText}>Check Connectivity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleToggleConnectivity}>
          <Text style={styles.buttonText}>Toggle Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      borderRadius: 12,
      padding: 16,
      margin: 16,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#e0e0e0',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
    },
    statusIndicator: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    info: {
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      color: darkMode ? '#e0e0e0' : '#34495e',
      marginBottom: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      flex: 1,
      backgroundColor: '#3498db',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default OfflineStatusCard;

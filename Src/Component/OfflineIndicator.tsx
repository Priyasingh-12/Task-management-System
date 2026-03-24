import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';

const OfflineIndicator = () => {
  const {isOnline, pendingOperations} = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);

  if (isOnline) return null;

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        Offline Mode
        {pendingOperations.length > 0 &&
          ` • ${pendingOperations.length} pending`}
      </Text>
    </View>
  );
};

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#ff6b35' : '#ff4757',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    icon: {
      fontSize: 16,
      marginRight: 8,
    },
    text: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default OfflineIndicator;

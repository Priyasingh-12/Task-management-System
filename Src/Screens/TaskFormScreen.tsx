import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TaskContext} from '../context/TaskContext';
import {ThemeContext} from '../context/ThemeContext';
import {Picker} from '@react-native-picker/picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type TaskFormScreenProps = {
  route: RouteProp<any, any>;
  navigation: StackNavigationProp<any, any>;
};

export default function TaskFormScreen({
  route,
  navigation,
}: TaskFormScreenProps) {
  const {addTask, updateTask} = useContext(TaskContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const existingTask = route.params?.task;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(
    existingTask?.description || '',
  );
  const [priority, setPriority] = useState(existingTask?.priority || 'Low');
  const [dueDate, setDueDate] = useState(
    existingTask ? new Date(existingTask.dueDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState(existingTask?.tags.join(',') || '');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate.toISOString(),
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
      };

      if (existingTask) {
        const updatedTask = {
          ...existingTask,
          ...taskData,
        };
        updateTask(updatedTask);
        Alert.alert('Success', 'Task updated successfully!');
      } else {
        addTask(taskData);
        Alert.alert('Success', 'Task created successfully!');
      }

      // Reset form for new tasks
      if (!existingTask) {
        setTitle('');
        setDescription('');
        setPriority('Low');
        setDueDate(new Date());
        setTags('');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Low');
    setDueDate(new Date());
    setTags('');
    setShowDatePicker(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const styles = getStyles(darkMode, insets);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={darkMode ? '#fff' : '#000'}
          />
        }>
        <View style={styles.formContainer}>
          <Text style={styles.screenTitle}>
            {existingTask ? 'Edit Task' : 'Create New Task'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={styles.picker}>
                <Picker.Item label="Low Priority" value="Low" />
                <Picker.Item label="Medium Priority" value="Medium" />
                <Picker.Item label="High Priority" value="High" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                📅 {dueDate.toLocaleDateString()}
              </Text>
              <Text style={styles.dateButtonSubtext}>Tap to change</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter tags separated by commas"
              value={tags}
              onChangeText={setTags}
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>
              Example: work, urgent, meeting
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}>
              <Text style={styles.saveButtonText}>
                {isLoading
                  ? 'Saving...'
                  : existingTask
                  ? 'Update Task'
                  : 'Create Task'}
              </Text>
            </TouchableOpacity>

            {!existingTask && (
              <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
                <Text style={styles.resetButtonText}>Reset Form</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      paddingBottom: insets.bottom + 20,
      paddingTop: insets.top + 10,
    },
    formContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 30,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#e0e0e0' : '#34495e',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      padding: 15,
      fontSize: 16,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      color: darkMode ? '#ffffff' : '#000000',
      // shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 0,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 0,
    },
    picker: {
      height: 50,
      color: darkMode ? '#ffffff' : '#000000',
    },
    dateButton: {
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      padding: 15,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 0,
    },
    dateButtonText: {
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#2c3e50',
      fontWeight: '500',
    },
    dateButtonSubtext: {
      fontSize: 12,
      color: darkMode ? '#999' : '#7f8c8d',
      marginTop: 2,
    },
    helperText: {
      fontSize: 12,
      color: darkMode ? '#999' : '#7f8c8d',
      marginTop: 5,
      fontStyle: 'italic',
    },
    buttonContainer: {
      marginTop: 20,
      gap: 12,
    },
    saveButton: {
      backgroundColor: '#3498db',
      padding: 18,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    disabledButton: {
      backgroundColor: '#95a5a6',
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    resetButton: {
      backgroundColor: 'transparent',
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
    },
    resetButtonText: {
      color: darkMode ? '#e0e0e0' : '#34495e',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

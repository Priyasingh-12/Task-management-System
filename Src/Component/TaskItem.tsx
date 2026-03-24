import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export default function TaskItem({task, onPress, onToggle, onDelete}: any) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onToggle}>
        <Text style={[styles.title, task.completed && styles.completed]}>
          {task.title} ({task.priority})
        </Text>
      </TouchableOpacity>

      <Text style={styles.desc}>{task.description}</Text>
      <Text style={styles.date}>
        Due: {new Date(task.dueDate).toDateString()}
      </Text>
      {task.tags?.length > 0 && (
        <Text style={styles.tags}>Tags: {task.tags.join(', ')}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  title: {fontSize: 18, fontWeight: 'bold'},
  completed: {textDecorationLine: 'line-through', color: 'gray'},
  desc: {fontSize: 14, marginVertical: 3},
  date: {fontSize: 12, color: 'gray'},
  tags: {fontSize: 12, color: '#555'},
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  edit: {color: 'blue'},
  delete: {color: 'red'},
});

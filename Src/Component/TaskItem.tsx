import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Task} from '../Types/Task';
import {ThemeContext} from '../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  task: Task;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
};

// ─── Priority config ─────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskItem({task, onPress, onToggle, onDelete}: Props) {
  const {darkMode} = useContext(ThemeContext);
  const styles = getStyles(darkMode);
  const priorityColor = PRIORITY_COLOR[task.priority];

  return (
    <View style={[styles.card, task.completed && styles.cardCompleted]}>
      {/* Priority accent bar */}
      <View style={[styles.priorityBar, {backgroundColor: priorityColor}]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.checkboxArea}
            onPress={onToggle}
            accessibilityLabel={
              task.completed ? 'Mark as incomplete' : 'Mark as complete'
            }
            accessibilityRole="checkbox">
            <View
              style={[
                styles.checkbox,
                task.completed && styles.checkboxChecked,
              ]}>
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <Text
              style={[styles.title, task.completed && styles.titleCompleted]}
              numberOfLines={2}>
              {task.title}
            </Text>
            <View style={styles.badgeRow}>
              {/* Priority badge */}
              <View
                style={[
                  styles.priorityBadge,
                  {backgroundColor: priorityColor + '22'},
                ]}>
                <Text
                  style={[styles.priorityBadgeText, {color: priorityColor}]}>
                  {task.priority}
                </Text>
              </View>

              {/* Unsynced indicator */}
              {!task.synced && (
                <View style={styles.unsyncedBadge}>
                  <Text style={styles.unsyncedText}>⏳ Pending sync</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* Due date */}
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text
            style={[styles.metaText, isOverdue(task) && styles.overdueText]}>
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {isOverdue(task) && !task.completed ? '  Overdue' : ''}
          </Text>
        </View>

        {/* Tags */}
        {task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onPress}
            accessibilityLabel="Edit task"
            accessibilityRole="button">
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            accessibilityLabel="Delete task"
            accessibilityRole="button">
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(task: Task): boolean {
  return !task.completed && new Date(task.dueDate) < new Date();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#3a3a3a' : '#e8e8e8',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: darkMode ? 0.3 : 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    cardCompleted: {
      opacity: 0.6,
    },
    priorityBar: {
      width: 4,
      borderRadius: 2,
      margin: 6,
      marginRight: 0,
      minHeight: 60,
    },
    body: {
      flex: 1,
      padding: 14,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    checkboxArea: {
      marginRight: 12,
      marginTop: 2,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: darkMode ? '#555' : '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#3498db',
      borderColor: '#3498db',
    },
    checkmark: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },
    titleBlock: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: darkMode ? '#ffffff' : '#1a1a2e',
      lineHeight: 22,
      marginBottom: 6,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: darkMode ? '#666' : '#aaa',
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    priorityBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    unsyncedBadge: {
      backgroundColor: darkMode ? '#3a2a00' : '#fff8e1',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: darkMode ? '#7a5c00' : '#ffe082',
    },
    unsyncedText: {
      fontSize: 11,
      color: darkMode ? '#ffc107' : '#f57f17',
      fontWeight: '600',
    },
    description: {
      fontSize: 13,
      color: darkMode ? '#999' : '#666',
      lineHeight: 18,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metaIcon: {
      fontSize: 12,
      marginRight: 5,
    },
    metaText: {
      fontSize: 12,
      color: darkMode ? '#888' : '#777',
    },
    overdueText: {
      color: '#e74c3c',
      fontWeight: '600',
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 10,
    },
    tag: {
      backgroundColor: darkMode ? '#1e3a5f' : '#e8f4fd',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 11,
      color: darkMode ? '#7ec8e3' : '#2980b9',
      fontWeight: '500',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: darkMode ? '#3a3a3a' : '#f0f0f0',
      paddingTop: 10,
      marginTop: 4,
    },
    editButton: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: darkMode ? '#1a3a5c' : '#e8f4fd',
    },
    editText: {
      color: '#3498db',
      fontSize: 13,
      fontWeight: '700',
    },
    deleteButton: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: darkMode ? '#3a1a1a' : '#fde8e8',
    },
    deleteText: {
      color: '#e74c3c',
      fontSize: 13,
      fontWeight: '700',
    },
  });

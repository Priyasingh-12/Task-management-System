import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemeContext} from '../context/ThemeContext';
import {AuthContext} from '../context/Authcontext';
import OfflineIndicator from '../Component/OfflineIndicator';
import OfflineStatusCard from '../Component/OfflineStatusCard';

export default function SettingsScreen() {
  const {darkMode, toggleTheme} = useContext(ThemeContext);
  const {signOut, user} = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        onPress: signOut,
        style: 'destructive',
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Settings</Text>
            <Text style={styles.subtitle}>Manage your app preferences</Text>
          </View>

          <OfflineStatusCard />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    Switch between light and dark themes
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleTheme}
                trackColor={{
                  false: darkMode ? '#444' : '#ddd',
                  true: '#3498db',
                }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>👤</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Signed in as</Text>
                  <Text style={styles.settingDescription}>
                    {user || 'Guest User'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}>
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.aboutCard}>
              <Text style={styles.appIcon}>📋</Text>
              <Text style={styles.appName}>Field Tasks</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                A lightweight mobile app for managing daily tasks and tracking
                completion.
              </Text>
              <Text style={styles.appAuthor}>Developed by Priya Singh</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Made for task only</Text>
          </View>
        </View>
      </ScrollView>
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
      paddingBottom: insets.bottom + 20,
      paddingTop: insets.top,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 30,
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
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 15,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      padding: 20,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#e0e0e0',
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: 24,
      marginRight: 15,
    },
    settingText: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: darkMode ? '#999' : '#666',
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ff4444',
      padding: 18,
      borderRadius: 12,
      marginTop: 10,
    },
    signOutIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    signOutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    aboutCard: {
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      padding: 25,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#e0e0e0',
    },
    appIcon: {
      fontSize: 48,
      marginBottom: 15,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      marginBottom: 5,
    },
    appVersion: {
      fontSize: 16,
      color: darkMode ? '#3498db' : '#007BFF',
      fontWeight: '600',
      marginBottom: 15,
    },
    appDescription: {
      fontSize: 14,
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 15,
    },
    appAuthor: {
      fontSize: 14,
      color: darkMode ? '#e0e0e0' : '#34495e',
      fontWeight: '500',
    },
    footer: {
      alignItems: 'center',
      marginTop: 20,
    },
    footerText: {
      fontSize: 14,
      color: darkMode ? '#999' : '#666',
      fontStyle: 'italic',
    },
  });

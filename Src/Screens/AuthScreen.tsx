import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthContext} from '../context/Authcontext';
import {ThemeContext} from '../context/ThemeContext';

const AuthScreen = () => {
  const {signIn} = useContext(AuthContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim());
      Alert.alert('Success', 'Welcome to Field Tasks!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const styles = getStyles(darkMode, insets);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
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
            <Text style={styles.appIcon}>📋</Text>
            <Text style={styles.title}>Field Tasks</Text>
            <Text style={styles.subtitle}>
              Welcome to your task management app
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={darkMode ? '#999' : '#666'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                This is a demo app. Any email address will work for signing in.
              </Text>
            </View>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>Create and manage tasks</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📅</Text>
                <Text style={styles.featureText}>
                  Set due dates and priorities
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Track activity logs</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌙</Text>
                <Text style={styles.featureText}>Dark mode support</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const getStyles = (darkMode: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    content: {
      padding: 24,
      minHeight: '100%',
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    appIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500',
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      marginBottom: 40,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#e0e0e0' : '#34495e',
      marginBottom: 8,
    },
    input: {
      height: 56,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#ddd',
      borderRadius: 12,
      paddingHorizontal: 20,
      fontSize: 16,
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      color: darkMode ? '#ffffff' : '#000000',
    },
    button: {
      backgroundColor: '#3498db',
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    disabledButton: {
      backgroundColor: '#95a5a6',
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    infoSection: {
      marginTop: 20,
      padding: 15,
      backgroundColor: darkMode ? '#2a2a2a' : '#e8f4fd',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#b3d9ff',
    },
    infoText: {
      fontSize: 14,
      color: darkMode ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 20,
    },
    features: {
      marginTop: 20,
    },
    featuresTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      textAlign: 'center',
      marginBottom: 20,
    },
    featureList: {
      gap: 15,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#444' : '#e0e0e0',
    },
    featureIcon: {
      fontSize: 20,
      marginRight: 15,
    },
    featureText: {
      fontSize: 16,
      color: darkMode ? '#e0e0e0' : '#34495e',
      flex: 1,
    },
  });

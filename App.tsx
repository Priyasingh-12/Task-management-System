import React, {useContext} from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import TaskListScreen from './Src/Screens/TaskListScreen';
import ActivityLogScreen from './Src/Screens/ActivityLogScreen';
import SettingsScreen from './Src/Screens/SettingScreen';
import {AuthContext, AuthProvider} from './Src/context/Authcontext';
import {ThemeContext, ThemeProvider} from './Src/context/ThemeContext';
import TaskFormScreen from './Src/Screens/TaskFormScreen';
import AuthScreen from './Src/Screens/AuthScreen';
import {TaskProvider} from './Src/context/TaskContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkMode ? '#2a2a2a' : '#fff',
          borderTopColor: darkMode ? '#444' : '#e0e0e0',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: darkMode ? '#999' : '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}>
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📋</Text>
          ),
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Activity Log"
        component={ActivityLogScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📊</Text>
          ),
          tabBarLabel: 'Activity',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>⚙️</Text>
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const {user} = useContext(AuthContext);
  const {darkMode} = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer
      theme={{
        ...(darkMode ? DarkTheme : DefaultTheme),
        colors: {
          ...(darkMode ? DarkTheme.colors : DefaultTheme.colors),
          background: darkMode ? '#000' : '#fff',
          text: darkMode ? '#fff' : '#000',
        },
      }}>
      <Stack.Navigator
        id={undefined}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: darkMode ? '#2a2a2a' : '#fff',
          },
          headerTintColor: darkMode ? '#fff' : '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}>
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TaskForm"
              component={TaskFormScreen}
              options={{
                title: 'Task Form',
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <TaskProvider>
            <RootNavigator />
          </TaskProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

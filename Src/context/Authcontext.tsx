import * as React from 'react';
import {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(value => {
      if (value) setUser(value);
    });
  }, []);

  const signIn = async (email: string) => {
    setUser(email);
    await AsyncStorage.setItem('user', email);
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{user, signIn, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

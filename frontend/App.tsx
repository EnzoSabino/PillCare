import React, { useState } from 'react';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'register' | 'home'>('register');
  const [user, setUser] = useState<any>(null);

  if (screen === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={() => setScreen('login')}
        onRegisterSuccess={() => setScreen('login')}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onNavigateToRegister={() => setScreen('register')}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setScreen('home');
        }}
      />
    );
  }

  return (
    <HomeScreen
      user={user}
      onLogout={() => {
        setUser(null);
        setScreen('login');
      }}
    />
  );
}
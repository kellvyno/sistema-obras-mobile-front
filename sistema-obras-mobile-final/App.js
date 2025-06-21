import 'react-native-gesture-handler'; // Importante para react-navigation
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator'; // << ESSA LINHA É CRUCIAL

export default function App() {
  return (
    <AppNavigator />
  );
}
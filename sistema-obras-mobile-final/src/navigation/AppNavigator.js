import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ObraFormScreen from '../screens/ObraFormScreen';
import ObraDetailsScreen from '../screens/ObraDetailsScreen';
import FiscalizacaoFormScreen from '../screens/FiscalizacaoFormScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Minhas Obras', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ObraForm"
          component={ObraFormScreen}
          options={({ route }) => ({
            title: route.params?.obraId ? 'Editar Obra' : 'Nova Obra',
            headerTitleAlign: 'center',
          })}
        />
        <Stack.Screen
          name="ObraDetails"
          component={ObraDetailsScreen}
          options={{ title: 'Detalhes da Obra', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="FiscalizacaoForm"
          component={FiscalizacaoFormScreen}
          options={({ route }) => ({
            title: route.params?.fiscalizacaoId ? 'Editar Fiscalização' : 'Nova Fiscalização',
            headerTitleAlign: 'center',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
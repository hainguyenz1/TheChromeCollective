import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TrackingRetailPricesScreen from '../screens/TrackingRetailPricesScreen';
import MyAccountScreen from '../screens/MyAccountScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TrackingRetailPrices" component={TrackingRetailPricesScreen} />
        <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

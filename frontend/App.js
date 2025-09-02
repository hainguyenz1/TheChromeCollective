import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import Auth0ProviderWrapper from './src/components/Auth0Provider';

export default function App() {
  return (
    <Auth0ProviderWrapper>
      <AppNavigator />
    </Auth0ProviderWrapper>
  );
} 
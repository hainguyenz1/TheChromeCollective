import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LoginButton = ({ style, textStyle }) => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login'
      }
    });
  };

  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.button, style]} disabled>
        <ActivityIndicator color="#fff" />
        <Text style={[styles.buttonText, textStyle]}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handleLogin}>
      <Text style={[styles.buttonText, textStyle]}>Log In</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LoginButton;

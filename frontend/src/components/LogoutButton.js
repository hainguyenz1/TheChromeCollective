import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LogoutButton = ({ style, textStyle }) => {
  const { logout, isLoading } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
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
    <TouchableOpacity style={[styles.button, style]} onPress={handleLogout}>
      <Text style={[styles.buttonText, textStyle]}>Log Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1a1a1a',
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
  },
});

export default LogoutButton;

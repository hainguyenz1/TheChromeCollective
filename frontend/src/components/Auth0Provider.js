import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { localhostAuth0Config } from '../config/localhost-auth0';

const Auth0ProviderWrapper = ({ children }) => {
  // Try environment variables first, fallback to localhost config
  const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN || localhostAuth0Config.domain;
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || localhostAuth0Config.clientId;
  const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || localhostAuth0Config.audience;
  const redirectUri = process.env.EXPO_PUBLIC_AUTH0_REDIRECT_URI || localhostAuth0Config.redirectUri;

  // Check if we're using placeholder values
  const isUsingPlaceholders = domain === 'dev-123456.us.auth0.com' || 
                             clientId === 'your-client-id-here' ||
                             domain === 'your-auth0-domain.auth0.com' ||
                             clientId === 'your-auth0-client-id';

  if (isUsingPlaceholders) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>🔐 Auth0 Setup Required</h3>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          textAlign: 'left'
        }}>
          <p style={{ marginBottom: '15px', color: '#666' }}>
            To enable authentication, please set up Auth0:
          </p>
          <ol style={{ color: '#333', lineHeight: '1.6' }}>
            <li>Go to <a href="https://auth0.com" target="_blank" style={{ color: '#007AFF' }}>auth0.com</a> and create a free account</li>
            <li>Create a new <strong>"Single Page Application"</strong></li>
            <li>In app settings, add these URLs:
              <ul style={{ marginTop: '5px' }}>
                <li><strong>Callback URLs:</strong> <code>http://localhost:19006, http://localhost:3000</code></li>
                <li><strong>Logout URLs:</strong> <code>http://localhost:19006, http://localhost:3000</code></li>
                <li><strong>Web Origins:</strong> <code>http://localhost:19006, http://localhost:3000</code></li>
              </ul>
            </li>
            <li>Create an API with identifier: <code>http://localhost:5001/api</code></li>
            <li>Copy your Domain and Client ID</li>
            <li>Update <code>frontend/src/config/localhost-auth0.js</code> with your credentials</li>
          </ol>
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '4px', 
            marginTop: '15px',
            border: '1px solid #2196f3'
          }}>
            <p style={{ margin: '0', color: '#1976d2', fontSize: '14px' }}>
              <strong>Quick Start:</strong> The app will work without authentication for now. 
              You can browse listings and test other features.
            </p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          {children}
        </div>
      </div>
    );
  }

  const authParams = {
    redirect_uri: redirectUri,
    scope: 'openid profile email'
  };

  // Only add audience if it's defined
  if (audience) {
    authParams.audience = audience;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authParams}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWrapper;

// Localhost Auth0 Configuration
// Replace these values with your actual Auth0 credentials

export const localhostAuth0Config = {
  domain: 'your_auth0_domain', // Replace with your Auth0 domain
  clientId: 'your_auth0_client_id', // Replace with your Auth0 client ID
  audience: undefined, // No audience for localhost development
  redirectUri: 'http://localhost:19006', // Your localhost URL
};

// Instructions:
// 1. Go to https://auth0.com and create a free account
// 2. Create a new "Single Page Application"
// 3. In the app settings, add these URLs:
//    - Allowed Callback URLs: http://localhost:19006, http://localhost:3000
//    - Allowed Logout URLs: http://localhost:19006, http://localhost:3000
//    - Allowed Web Origins: http://localhost:19006, http://localhost:3000
// 4. Create an API with identifier: http://localhost:5001/api
// 5. Copy your Domain and Client ID from the app settings
// 6. Replace the values above with your actual credentials

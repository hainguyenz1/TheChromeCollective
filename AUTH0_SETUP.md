# Auth0 Setup Instructions

This guide will help you set up Auth0 authentication for TheChromeCollective marketplace application.

## Prerequisites

- Auth0 account (free tier available at [auth0.com](https://auth0.com))
- Node.js and npm installed
- MongoDB running (local or Atlas)

## Step 1: Create Auth0 Application

1. **Log in to Auth0 Dashboard**
   - Go to [manage.auth0.com](https://manage.auth0.com)
   - Sign up or log in to your account

2. **Create a New Application**
   - Click "Applications" in the sidebar
   - Click "Create Application"
   - Name: "TheChromeCollective"
   - Type: "Single Page Application"
   - Click "Create"

3. **Configure Application Settings**
   - Go to your application's "Settings" tab
   - Note down your **Domain**, **Client ID**, and **Client Secret**
   - Add these URLs to "Allowed Callback URLs":
     ```
     http://localhost:19006
     http://localhost:3000
     ```
   - Add these URLs to "Allowed Logout URLs":
     ```
     http://localhost:19006
     http://localhost:3000
     ```
   - Add these URLs to "Allowed Web Origins":
     ```
     http://localhost:19006
     http://localhost:3000
     ```
   - Click "Save Changes"

## Step 2: Create Auth0 API

1. **Create API**
   - Go to "APIs" in the sidebar
   - Click "Create API"
   - Name: "TheChromeCollective API"
   - Signing Algorithm: "RS256"
   - Click "Create"

2. **Note the API Identifier**
   - This will be your `AUTH0_AUDIENCE` value

## Step 3: Configure Environment Variables

### Backend Configuration

1. **Copy the environment template:**
   ```bash
   cd backend
   cp env-template.txt .env
   ```

2. **Update `.env` with your Auth0 credentials:**
   ```env
   # Auth0 Configuration
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   ```

### Frontend Configuration

1. **Create environment file:**
   ```bash
   cd frontend
   touch .env
   ```

2. **Add Auth0 configuration to `.env`:**
   ```env
   # Auth0 Configuration
   EXPO_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   EXPO_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
   EXPO_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:19006

   # API Configuration
   EXPO_PUBLIC_API_URL=http://10.0.0.157:5001
   EXPO_PUBLIC_SOCKET_URL=http://10.0.0.157:5001
   ```

## Step 4: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install express-oauth-server jwks-client
```

### Frontend Dependencies
```bash
cd frontend
npm install @auth0/auth0-react --legacy-peer-deps
```

## Step 5: Test the Setup

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Authentication:**
   - Navigate to the "My Account" page
   - Click "Log In" button
   - You should be redirected to Auth0 login page
   - After successful login, you should see your profile

## Step 6: Verify API Protection

1. **Test Protected Endpoints:**
   - Try creating a listing without authentication (should fail)
   - Try creating a listing with authentication (should succeed)
   - Check that listings are associated with the authenticated user

## Troubleshooting

### Common Issues

1. **"Invalid token" errors:**
   - Check that your Auth0 domain and audience are correct
   - Ensure the JWT token is being sent in the Authorization header

2. **CORS errors:**
   - Verify that your callback URLs are correctly configured in Auth0
   - Check that your frontend URL matches the configured callback URL

3. **"User not found" errors:**
   - The user profile is created automatically on first API call
   - Check that the user creation endpoint is working

### Debug Steps

1. **Check Auth0 Dashboard:**
   - Go to "Monitoring" > "Logs" to see authentication attempts
   - Verify that tokens are being issued correctly

2. **Check Backend Logs:**
   - Look for JWT verification errors
   - Check that the middleware is correctly extracting user information

3. **Check Frontend Console:**
   - Look for Auth0 SDK errors
   - Verify that tokens are being stored and sent correctly

## Security Notes

- Never commit your `.env` files to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your Auth0 client secrets
- Monitor your Auth0 dashboard for suspicious activity

## Next Steps

After successful setup, you can:

1. **Customize the login experience** in Auth0 Dashboard
2. **Add social login providers** (Google, Facebook, etc.)
3. **Implement role-based access control** if needed
4. **Add user profile management** features
5. **Set up email verification** and password reset flows

## Support

If you encounter issues:

1. Check the [Auth0 Documentation](https://auth0.com/docs)
2. Review the [Auth0 Community](https://community.auth0.com/)
3. Check the application logs for detailed error messages

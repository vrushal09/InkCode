# InkCode - Live Deployment Guide

This guide provides instructions on deploying the InkCode application with Vercel (frontend) and Render (backend) and ensuring they work correctly together.

## Backend Setup (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: inkcode-backend (or your preferred name)
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Environment Variables**: 
     - PORT: 5000 (or your preferred port)
     - JDOODLE_CLIENT_ID: your_jdoodle_client_id
     - JDOODLE_CLIENT_SECRET: your_jdoodle_client_secret

4. Deploy the service and note the deployed URL (e.g., https://inkcode-ymp9.onrender.com)

## Frontend Setup (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: dist
   - **Environment Variables**:
     - VITE_API_URL: https://inkcode-ymp9.onrender.com (your backend URL)

4. Deploy the project

## Troubleshooting Connection Issues

If your frontend can't connect to your backend, try these steps:

1. **Check CORS Settings**:
   - The backend has been configured to allow all origins with `origin: '*'`
   - This should allow any Vercel domain to connect to your backend

2. **Backend Sleep Mode**:
   - Render may put your service to sleep on the free tier
   - The first request after inactivity might fail
   - Visit your backend URL directly (e.g., https://inkcode-ymp9.onrender.com/api/health) to wake it up

3. **Environment Variables**:
   - Verify your frontend has the correct VITE_API_URL set in Vercel

4. **Debug Tools**:
   - Use the terminal in the code editor and type 'debug' to access the connection debugger
   - This will show detailed information about the connection attempt and any errors

5. **Browser Console**:
   - Check your browser's developer console for CORS errors or other connection issues
   - If you see CORS errors, it means your backend is running but rejecting the frontend's requests

6. **Redeploy**:
   - Sometimes a simple redeploy of both services can resolve connection issues
   - In Vercel, you can trigger a redeploy from the Deployments tab

## Testing Your Deployment

After deployment:

1. Visit your Vercel frontend URL
2. Sign in to your account
3. Create a new project or open an existing one
4. Try running some code using different languages
5. If JavaScript works but Python doesn't, it indicates a backend connection issue
6. Use the 'debug' command in the terminal to diagnose the problem

## Common Issues and Solutions

### 1. "Backend server not available" message

**Cause**: Frontend can't connect to the backend URL.

**Solutions**:
- Check if the backend is running by visiting its health endpoint directly
- Verify the VITE_API_URL environment variable in Vercel
- Look for CORS errors in the browser console

### 2. CORS Errors

**Cause**: Backend is rejecting requests from your frontend domain.

**Solution**:
- We've set `origin: '*'` in the CORS configuration which should allow all domains
- If still seeing CORS errors, make sure the changes to server.js were deployed to Render

### 3. Slow First Response

**Cause**: Render free tier puts services to sleep after inactivity.

**Solution**:
- Visit your backend URL directly to wake it up before using the application
- Consider upgrading to a paid Render tier for always-on service

### 4. Other Issues

Use the connection debugger by typing 'debug' in the terminal to get more information about what's going wrong.

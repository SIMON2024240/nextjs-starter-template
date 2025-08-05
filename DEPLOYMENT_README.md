# NRC9 Recreational Facility Booking App - Deployment Guide

This guide explains how to deploy the NRC9 Recreational Facility Booking app on Vercel.

## Prerequisites

- A GitHub account
- Vercel account (https://vercel.com)
- The app source code pushed to a GitHub repository

## Steps to Deploy

1. **Push your project to GitHub**

   If you haven't already, initialize git and push your project:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Create a Vercel account**

   - Go to https://vercel.com and sign up or log in.

3. **Import your GitHub repository**

   - Click "New Project" on the Vercel dashboard.
   - Select your GitHub repository.
   - Vercel will auto-detect the Next.js framework.

4. **Configure environment variables**

   - If your app requires environment variables, add them in the Vercel project settings.

5. **Deploy the app**

   - Click "Deploy" to start the deployment.
   - Wait for the build and deployment to complete.

6. **Access your live app**

   - Vercel will provide a URL for your deployed app.

## Notes

- The app uses the `vercel.json` file in the root directory for configuration.
- For local development, use `npm run dev`.
- For production, use `npm run build` and `npm start`.

## Support

If you encounter any issues during deployment, please consult the Vercel documentation or contact support.

---

This completes the deployment setup for the NRC9 Recreational Facility Booking app.

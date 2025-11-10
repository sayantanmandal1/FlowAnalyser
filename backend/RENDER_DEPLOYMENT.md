# Backend Deployment Guide for Render

## Prerequisites
- Render account (https://render.com)
- PostgreSQL database (can be created on Render)
- GitHub repository with your code

## Step 1: Create PostgreSQL Database on Render

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `flowbitai-db`
   - **Database**: `flowbitai_analytics`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free or Starter
4. Click "Create Database"
5. **Save the Internal Database URL** (starts with `postgresql://`)

## Step 2: Deploy Backend Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `flowbitai-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: Free or Starter

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL=<your-internal-database-url-from-step-1>
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   JWT_SECRET=<generate-a-secure-random-string>
   VANNA_API_BASE_URL=https://your-ai-server.onrender.com
   ```

6. **Build Command**: (Leave empty - Docker handles it)
7. **Start Command**: (Leave empty - Docker handles it)

8. Click "Create Web Service"

## Step 3: Run Database Migrations

After deployment, you need to initialize the database:

1. Go to your backend service on Render
2. Click "Shell" tab
3. Run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

## Step 4: Seed Database (Optional)

To populate with sample data:

```bash
npm run db:seed
```

Or to ingest the Analytics_Test_Data.json:

```bash
npm run ingest-data-fixed data/Analytics_Test_Data.json
```

## Step 5: Verify Deployment

1. Check the service URL: `https://flowbitai-backend.onrender.com`
2. Test health endpoint: `https://flowbitai-backend.onrender.com/health`
3. Test API: `https://flowbitai-backend.onrender.com/api/analytics/stats`

## Important Notes

- **Cold Starts**: Free tier services spin down after 15 minutes of inactivity
- **Database Backups**: Enable automatic backups in database settings
- **Logs**: Monitor logs in the "Logs" tab for debugging
- **Custom Domain**: Can be added in service settings

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| NODE_ENV | Environment mode | `production` |
| PORT | Server port | `5000` |
| FRONTEND_URL | Frontend URL for CORS | `https://app.vercel.app` |
| JWT_SECRET | Secret for JWT tokens | Random 32+ char string |
| VANNA_API_BASE_URL | AI server URL | `https://ai.onrender.com` |

## Troubleshooting

### Service won't start
- Check logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran successfully

### Database connection errors
- Use **Internal Database URL** (not External)
- Check database is in same region
- Verify database is running

### API returns 500 errors
- Check environment variables are set
- Review application logs
- Verify database schema is up to date

## Updating the Service

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

## Manual Redeployment

1. Go to service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

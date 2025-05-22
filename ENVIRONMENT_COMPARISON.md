# Local vs. Vercel Environment Comparison Guide

This guide helps you understand the differences between running your Serene Flow Spa Suite application in the local development environment versus the Vercel production environment.

## Quick Access

- **Local Environment:** [http://localhost:5173](http://localhost:5173)
- **Production Environment:** [Your Vercel URL]
- **Server Status Check:** Run `./check-servers.ps1 -Detailed`
- **Environment Comparison Dashboard:** Run `./master-verify.ps1 -CompareEnvironments`
- **Visual Comparison Report:** Run `./master-verify.ps1 -CompareEnvironments -GenerateHtmlReport`

## Environment Characteristics

| Feature | Local Environment | Vercel Environment |
|---------|------------------|-------------------|
| **Purpose** | Development, testing | Staging, production |
| **URL** | http://localhost:5173 | https://your-app.vercel.app |
| **API URL** | http://localhost:5000/api | https://your-app.vercel.app/api |
| **Database** | Local PostgreSQL | Vercel PostgreSQL |
| **File System** | Direct access | Read-only (except /tmp) |
| **Environment Variables** | From .env file | From Vercel dashboard |
| **Logs** | Terminal console | Vercel dashboard |
| **Performance** | Varies based on local machine | Optimized for production |

## Visual Indicators

When using the application, you can easily identify which environment you're in:

1. **Environment Indicator in Sidebar**:
   - **Local**: Green badge showing "Development (Local)"
   - **Vercel**: Purple badge showing "Production (Vercel)"

2. **Dashboard Deployment Status Card**:
   - Shows detailed information about the current environment
   - Displays API, database status, and platform details
   - Updates in real-time to reflect connection status
   - Shows version, region, and deployment information
   - Includes timestamp of last check with refresh button

3. **URL in Browser**:
   - **Local**: Contains "localhost" and port number
   - **Vercel**: Contains "vercel.app" or your custom domain

4. **Refresh Button**:
   - Allows instantly checking environment changes
   - Displays timestamp of when information was last updated

5. **API Response Details**:
   - Shows detailed environment information from backend
   - Displays Node.js version and runtime information
   - Shows database connection status and name

## API Endpoints

| Endpoint | Local Environment | Vercel Environment | Purpose |
|----------|------------------|-------------------|---------|
| `/api/health` | Available | Available | Basic health check |
| `/api/test` | Not available | Available | Vercel-specific diagnostics |
| `/api/services` | Available | Available | Services data |
| `/api/customers` | Available | Available | Customer data |
| `/api/appointments` | Available | Available | Appointment data |
| `/api/staff` | Available | Available | Staff data |

## Database Differences

| Aspect | Local Environment | Vercel Environment |
|--------|------------------|-------------------|
| **Connection** | Direct connection | Connection pooling |
| **SSL** | Optional | Required |
| **Persistence** | Permanent | Persistent but with limitations |
| **Connection String** | Individual parameters | Single DATABASE_URL |
| **Access Control** | Local network | IP restricted |

## Testing Both Environments

### Local Environment Testing

1. **Start the application**:
   ```powershell
   # Start backend and frontend together
   npm run start:full
   
   # Or start them separately
   cd backend
   npm run dev
   
   # In another terminal
   cd ..
   npm run dev
   ```

2. **Run verification scripts**:
   ```powershell
   # Comprehensive verification
   ./verify-all.ps1
   
   # Or individual checks
   ./verify-deployment.ps1
   ./verify-database.ps1
   ./test-api.ps1
   ```

3. **Access the application**:
   Open your browser and navigate to http://localhost:5173

### Vercel Environment Testing

1. **Verify the deployment**:
   ```powershell
   # Set your Vercel URL as an environment variable
   $env:VERCEL_URL = "https://your-app.vercel.app"
   
   # Run comprehensive verification
   ./verify-all.ps1 -Vercel
   
   # Or individual checks
   ./verify-deployment.ps1 --vercel
   ./verify-database.ps1 -Vercel
   ./test-api.ps1 -Vercel
   ```

2. **Access the application**:
   Open your browser and navigate to your Vercel URL (https://your-app.vercel.app)

## Automated Environment Verification & Self-Healing

The Serene Flow Spa Suite now includes powerful self-healing capabilities for the local environment and enhanced verification tools for both environments.

### Self-Healing Capabilities (Local Environment)

Run the following command to check servers and automatically fix common issues:

```powershell
# Check and automatically heal server issues
./check-servers.ps1 -SelfHeal

# Force restart of servers with self-healing
./check-servers.ps1 -SelfHeal -ForceRestart
```

The self-healing system can automatically:

1. **Detect and restart crashed servers**
2. **Identify non-responsive processes** and restart them
3. **Start missing servers** if they're not running
4. **Provide detailed diagnostic information** about failures

### Environment Comparison Dashboard

The comparison dashboard provides a real-time side-by-side comparison of both environments:

```powershell
# Run the comparison dashboard
./master-verify.ps1 -CompareEnvironments

# Generate an HTML report
./master-verify.ps1 -CompareEnvironments -GenerateHtmlReport
```

The dashboard shows:
- API status in both environments
- Frontend status
- Database connectivity
- Environment information (versions, regions)
- Response times and performance metrics

### Visual Comparison Reports

The HTML reports provide:
- Color-coded status indicators
- Detailed metrics comparison
- Environment variable differences (sanitized)
- API endpoint availability matrix
- Screenshots of key interfaces in each environment (optional)

## Troubleshooting Common Differences

### API Connection Issues

| Issue | Local Solution | Vercel Solution |
|-------|---------------|----------------|
| CORS errors | Update allowed origins in server.js | Update FRONTEND_URL env variable |
| 404 errors | Check server is running (`./check-servers.ps1 -SelfHeal`) | Check API routes in vercel.json |
| Authentication failures | Check JWT_SECRET in .env | Check JWT_SECRET in Vercel env vars |
| Non-responsive API | Run `./check-servers.ps1 -SelfHeal` | Check function logs in Vercel dashboard |

### Database Connection Issues

| Issue | Local Solution | Vercel Solution |
|-------|---------------|----------------|
| Connection failure | Check PostgreSQL is running | Check DATABASE_URL in Vercel env vars |
| SSL errors | Disable SSL requirement | Ensure SSL config matches Vercel's requirements |
| Missing tables | Run migration manually | Check vercel-migrate.js executed properly |

## Best Practices for Working with Both Environments

1. **Use environment feature detection** rather than hardcoding environment checks
2. **Test thoroughly in both environments** before deploying changes
3. **Keep environment variables synchronized** between local .env and Vercel
4. **Use visual indicators** to always be aware of which environment you're working in
5. **Leverage the verification scripts** to quickly identify issues

## Conclusion

Understanding the differences between your local development environment and the Vercel production environment helps ensure a smooth deployment process and troubleshoot issues more effectively. Use the visual indicators built into the application and the provided verification scripts to maintain awareness of your current environment and quickly identify any configuration discrepancies.

For more detailed information on Vercel deployment, refer to the DEPLOYMENT_UPDATED.md and VERCEL_TROUBLESHOOTING_UPDATED.md documents.

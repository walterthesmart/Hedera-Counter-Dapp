# Deployment Guide

This guide covers deploying the Hedera Counter DApp to various environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Hedera testnet/mainnet account with sufficient HBAR
- ✅ Environment variables properly configured
- ✅ Smart contract compiled and tested
- ✅ Frontend built and tested locally

## 🔧 Smart Contract Deployment

### Step 1: Environment Setup

Create and configure your `.env` file:

```env
# Network Configuration
HEDERA_NETWORK=testnet  # or mainnet for production

# Account Credentials
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Contract Configuration (will be auto-populated)
CONTRACT_ID=
CONTRACT_ADDRESS=
```

### Step 2: Compile Contract

```bash
cd smart-contract
npm run compile
```

This creates the contract artifacts in `artifacts/contracts/Counter.sol/`.

### Step 3: Deploy Contract

```bash
npm run deploy
```

The deployment script will:
1. Validate your environment variables
2. Connect to the specified Hedera network
3. Deploy the contract with initial parameters
4. Save deployment information to `config/deployment.json`
5. Update environment variables with contract details

### Step 4: Verify Deployment

```bash
npm run verify
```

This script tests basic contract functionality to ensure deployment was successful.

## 🌐 Frontend Deployment

### Vercel Deployment (Recommended)

Vercel provides the easiest deployment for Next.js applications.

#### Step 1: Connect Repository

1. Visit [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your repository

#### Step 2: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=0.0.YOUR_CONTRACT_ID
NEXT_PUBLIC_APP_NAME=Hedera Counter DApp
NEXT_PUBLIC_MIRROR_NODE_URL=
```

#### Step 3: Deploy

Vercel will automatically:
- Build your application
- Deploy to a global CDN
- Provide a custom domain
- Enable automatic deployments on git push

### Netlify Deployment

#### Step 1: Build Settings

```toml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "frontend/out"

[build.environment]
  NODE_VERSION = "18"
```

#### Step 2: Environment Variables

Add in Netlify dashboard:
- `NEXT_PUBLIC_HEDERA_NETWORK`
- `NEXT_PUBLIC_CONTRACT_ID`
- `NEXT_PUBLIC_APP_NAME`

### Self-Hosted Deployment

#### Using PM2 (Production)

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
cd frontend
npm run build

# Start with PM2
pm2 start npm --name "hedera-counter" -- start
pm2 save
pm2 startup
```

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY frontend/.next ./.next
COPY frontend/public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t hedera-counter .
docker run -p 3000:3000 -e NEXT_PUBLIC_CONTRACT_ID=0.0.YOUR_ID hedera-counter
```

## 🔒 Security Considerations

### Environment Variables

**Never commit sensitive data to version control:**

```bash
# ❌ DON'T DO THIS
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...

# ✅ DO THIS INSTEAD
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

### Production Checklist

- [ ] Use mainnet for production deployments
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up proper error monitoring
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up backup procedures
- [ ] Monitor contract gas usage
- [ ] Implement proper logging

## 📊 Monitoring and Maintenance

### Contract Monitoring

Monitor your deployed contract:

```bash
# Check contract status
node scripts/verify.js

# Monitor transactions
# Use Hedera Mirror Node API or HashScan
```

### Frontend Monitoring

Set up monitoring for:
- Application uptime
- Error rates
- Performance metrics
- User analytics

Recommended tools:
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** for user tracking
- **Sentry** for error monitoring
- **LogRocket** for session replay

### Maintenance Tasks

Regular maintenance includes:

1. **Dependency Updates**
   ```bash
   npm audit
   npm update
   ```

2. **Security Patches**
   ```bash
   npm audit fix
   ```

3. **Performance Monitoring**
   - Check bundle sizes
   - Monitor load times
   - Optimize images and assets

4. **Contract Upgrades**
   - Plan upgrade strategies
   - Test thoroughly on testnet
   - Communicate changes to users

## 🚨 Troubleshooting

### Common Deployment Issues

#### Contract Deployment Fails

**Error**: `INSUFFICIENT_ACCOUNT_BALANCE`
```bash
# Solution: Add more HBAR to your account
# Get testnet HBAR: https://portal.hedera.com/
```

**Error**: `INVALID_CONTRACT_ID`
```bash
# Solution: Check contract compilation
npm run compile-contract
```

#### Frontend Build Fails

**Error**: `Module not found`
```bash
# Solution: Install dependencies
npm install
```

**Error**: `Environment variable not defined`
```bash
# Solution: Check .env.local file
cp .env.local.example .env.local
```

### Network Issues

#### Testnet vs Mainnet

Ensure consistency across all configurations:

```env
# All should match
HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

#### RPC Endpoints

If experiencing connection issues, try alternative endpoints:

```env
# Testnet alternatives
HEDERA_RPC_URL=https://testnet.hashio.io/api
# or
HEDERA_RPC_URL=https://testnet.mirrornode.hedera.com
```

## 📈 Scaling Considerations

### Performance Optimization

1. **Frontend Optimization**
   - Enable Next.js Image Optimization
   - Use CDN for static assets
   - Implement proper caching strategies
   - Minimize bundle size

2. **Contract Optimization**
   - Optimize gas usage
   - Batch operations when possible
   - Consider contract upgradability patterns

### Load Testing

Test your application under load:

```bash
# Install artillery for load testing
npm install -g artillery

# Create test configuration
# artillery.yml
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Load test"
    requests:
      - get:
          url: "/"
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Test smart contract
        run: npm run test-contract
      
      - name: Build frontend
        run: cd frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

If you encounter deployment issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [GitHub issues](https://github.com/your-repo/issues)
3. Join our [Discord community](https://discord.gg/hedera)
4. Contact support at [support@yourproject.com]

---

**Happy Deploying! 🚀**

#!/bin/bash
# VeloCity - Quick Deployment Script
# Run this script to deploy to production

echo "🚀 VeloCity Deployment Script"
echo "================================"
echo ""

# Check for required tools
echo "📋 Checking requirements..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

echo "✅ All requirements met"
echo ""

# Backend Deployment
echo "🔧 Deploying Backend to Railway..."
echo "================================"
cd Backend

# Login to Railway
echo "📝 Logging in to Railway..."
railway login

# Initialize Railway project
echo "🆕 Initializing Railway project..."
railway init --name "velocity-backend"

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ADMIN_PANEL_SECRET=$(openssl rand -base64 32)
railway variables set SENDGRID_API_KEY="SG.your_api_key_here"
railway variables set SENDGRID_FROM_EMAIL="noreply@velocityride.com"

# MongoDB Atlas connection
echo "💾 Configure MongoDB URI:"
echo "1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
echo "2. Get your connection string"
echo "3. Run: railway variables set MONGODB_URI=your_connection_string"
read -p "Press Enter when done..."
railway variables set MONGODB_URI=""

# Set frontend URL
echo "📱 Set frontend URL:"
read -p "Enter your Vercel frontend URL (e.g., https://app.vercel.app): " FRONTEND_URL
railway variables set FRONTEND_URL=$FRONTEND_URL

# Deploy
echo "🚀 Deploying backend..."
railway up

# Get Railway URL
RAILWAY_URL=$(railway status 2>/dev/null | grep -oP 'https://[^ ]+' | head -1)
echo "✅ Backend deployed at: $RAILWAY_URL"

cd ..
echo ""

# Frontend Deployment
echo "🎨 Deploying Frontend to Vercel..."
echo "==================================="
cd Frontend

# Login to Vercel
echo "📝 Logging in to Vercel..."
vercel login

# Set environment variables
echo "⚙️  Setting environment variables..."
read -p "Enter your backend URL (e.g., $RAILWAY_URL): " BACKEND_URL
VITE_API_URL="$BACKEND_URL/api"
VITE_WS_URL="$BACKEND_URL"

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=$VITE_API_URL
VITE_WS_URL=$VITE_WS_URL
EOF

# Deploy
echo "🚀 Deploying frontend..."
vercel --prod --env VITE_API_URL=$VITE_API_URL --env VITE_WS_URL=$VITE_WS_URL

cd ..
echo ""

# Final steps
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "1. Verify deployment at:"
echo "   - Backend: $RAILWAY_URL/api/health"
echo "   - Frontend: Check Vercel dashboard"
echo ""
echo "2. Configure SendGrid:"
echo "   - Go to SendGrid dashboard"
echo "   - Create API key"
echo "   - Run: railway variables set SENDGRID_API_KEY=your_key"
echo ""
echo "3. Test the platform:"
echo "   - Visit your frontend URL"
echo "   - Register as rider"
echo "   - Register as driver"
echo "   - Login as admin"
echo ""
echo "4. Monitor logs:"
echo "   - Backend: railway logs"
echo "   - Frontend: Vercel dashboard"
echo ""
echo "🎉 Your ride-sharing platform is live!"

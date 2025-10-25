#!/bin/bash
# POD Dashboard - GitHub Pages Deployment Script

echo "🚀 POD Dashboard Deployment Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if repository exists
echo "📋 Step 1: Checking for GitHub repository..."
if gh repo view pod-dashboard &>/dev/null; then
    echo -e "${GREEN}✓ Repository 'pod-dashboard' already exists${NC}"
else
    echo -e "${YELLOW}Creating GitHub repository 'pod-dashboard'...${NC}"
    
    # Create the repository
    if gh repo create pod-dashboard --public --source=. --remote=origin --description="POD Tickets Dashboard - React Application with 100% feature parity"; then
        echo -e "${GREEN}✓ Repository created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create repository${NC}"
        exit 1
    fi
fi

# Step 2: Push code to GitHub
echo ""
echo "📤 Step 2: Pushing code to GitHub..."
if git push -u origin main 2>/dev/null; then
    echo -e "${GREEN}✓ Code pushed successfully${NC}"
else
    echo -e "${YELLOW}Note: Code may already be pushed or using different branch name${NC}"
fi

# Step 3: Update vite.config.js with correct base path
echo ""
echo "⚙️  Step 3: Updating Vite configuration..."
if grep -q "base: '/pod-dashboard/'" vite.config.js; then
    echo -e "${GREEN}✓ Vite config already set correctly${NC}"
else
    echo -e "${YELLOW}Updating vite.config.js...${NC}"
    # This will be done manually or with sed
    echo -e "${YELLOW}Please ensure vite.config.js has: base: '/pod-dashboard/'${NC}"
fi

# Step 4: Build and deploy
echo ""
echo "🔨 Step 4: Building for production..."
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo "🚀 Step 5: Deploying to GitHub Pages..."
if npm run deploy; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    echo ""
    echo "=================================="
    echo -e "${GREEN}🎉 SUCCESS!${NC}"
    echo "=================================="
    echo ""
    echo "Your dashboard will be available at:"
    echo -e "${GREEN}https://tarek-mahran.github.io/pod-dashboard/${NC}"
    echo ""
    echo "Note: It may take 1-3 minutes for GitHub Pages to publish your site."
    echo ""
    echo "To check deployment status:"
    echo "  gh browse --repo tarek-mahran/pod-dashboard --settings"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi

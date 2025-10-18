#!/bin/bash

echo "🚀 Deploying Healthcare Pro to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy Healthcare Pro - $(date)"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Please add your GitHub repository as origin:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/healthcare-pro.git"
    exit 1
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo "Now go to Render.com and:"
echo "1. Create a new Web Service"
echo "2. Connect your GitHub repository"
echo "3. Set Environment to PHP"
echo "4. Add a MySQL database"
echo "5. Deploy!"
echo ""
echo "After deployment, visit: https://your-app.onrender.com/init-db.php"
echo "to initialize the database."

# Healthcare Pro - Deployment Guide

## Option 1: Render (Recommended)

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/healthcare-pro.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: healthcare-pro
     - **Environment**: PHP
     - **Build Command**: (leave empty)
     - **Start Command**: `php -S 0.0.0.0:$PORT -t .`
   - Add Environment Variables:
     - `MYSQL_HOST`: (will be provided by Render)
     - `MYSQL_DATABASE`: (will be provided by Render)
     - `MYSQL_USERNAME`: (will be provided by Render)
     - `MYSQL_PASSWORD`: (will be provided by Render)
     - `MYSQL_PORT`: (will be provided by Render)

3. **Create Database**
   - In Render dashboard, click "New +" → "PostgreSQL" (or MySQL if available)
   - Name: healthcare-db
   - Connect it to your web service

4. **Initialize Database**
   - After deployment, visit: `https://your-app.onrender.com/init-db.php`
   - This will create all tables and sample data

## Option 2: Heroku

### Prerequisites
- Heroku CLI installed
- GitHub account

### Steps:

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku App**
   ```bash
   heroku create healthcare-pro-app
   ```

3. **Add MySQL Add-on**
   ```bash
   heroku addons:create cleardb:ignite
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Initialize Database**
   ```bash
   heroku run php init-db.php
   ```

## Option 3: DigitalOcean App Platform

### Steps:

1. **Push to GitHub** (same as Render)

2. **Deploy on DigitalOcean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub
   - Select PHP as runtime
   - Add managed database (MySQL)
   - Deploy

## Option 4: VPS Deployment (DigitalOcean Droplet, Linode, etc.)

### Steps:

1. **Set up VPS**
   - Create Ubuntu 20.04+ droplet
   - Install LAMP stack:
   ```bash
   sudo apt update
   sudo apt install apache2 mysql-server php php-mysql php-curl php-json
   ```

2. **Configure Apache**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

3. **Set up Database**
   ```bash
   sudo mysql -u root -p
   CREATE DATABASE healthcare_pro;
   CREATE USER 'healthcare_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON healthcare_pro.* TO 'healthcare_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Deploy Code**
   ```bash
   git clone https://github.com/YOUR_USERNAME/healthcare-pro.git
   sudo cp -r healthcare-pro/* /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   ```

5. **Initialize Database**
   ```bash
   mysql -u healthcare_user -p healthcare_pro < database_setup.sql
   ```

## Environment Variables

For production, make sure to set these environment variables:

- `MYSQL_HOST`: Database host
- `MYSQL_DATABASE`: Database name
- `MYSQL_USERNAME`: Database username
- `MYSQL_PASSWORD`: Database password
- `MYSQL_PORT`: Database port (usually 3306)

## Security Considerations

1. **Change default passwords** in production
2. **Use HTTPS** (most platforms provide this automatically)
3. **Set up proper file permissions**
4. **Regular database backups**
5. **Update dependencies regularly**

## Recommended: Render

Render is the easiest option because:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy database integration
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variable management
- ✅ No server management required

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check environment variables
   - Verify database credentials
   - Ensure database is running

2. **File Permissions**
   - Ensure web server can read files
   - Check file ownership

3. **PHP Errors**
   - Check PHP error logs
   - Verify PHP version compatibility

4. **CORS Issues**
   - Update CORS headers in API files
   - Check domain configuration

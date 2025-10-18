# Healthcare Management System - Setup Instructions

## Quick Setup Guide

### Step 1: Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/download.html
2. Install XAMPP (default location: C:\xampp)
3. Start XAMPP Control Panel
4. Start Apache and MySQL services

### Step 2: Setup Database
1. Open http://localhost/phpmyadmin
2. Click "New" to create a database
3. Name it: `healthcare_pro`
4. Click "Import" tab
5. Choose the `database_setup.sql` file
6. Click "Go" to import

### Step 3: Configure Database Connection
Edit the file: `config/database.php`
```php
$host = 'localhost';
$dbname = 'healthcare_pro';
$username = 'root';        // Default XAMPP username
$password = '';            // Default XAMPP password (empty)
```

### Step 4: Copy Project Files
1. Copy all project files to: `C:\xampp\htdocs\healthcare\`
2. Make sure the folder structure is:
   ```
   C:\xampp\htdocs\healthcare\
   ├── assets/
   ├── auth/
   ├── config/
   ├── index.php
   ├── dashboard.php
   └── ... (all other files)
   ```

### Step 5: Access the Website
1. Open your web browser
2. Go to: http://localhost/healthcare
3. You should see the homepage!

## Default Login Credentials

### Admin Account
- **URL**: http://localhost/healthcare/auth/login.php
- **Email**: admin@healthcarepro.com
- **Password**: admin123

### Doctor Account
- **Email**: sarah.johnson@healthcarepro.com
- **Password**: password123

### Patient Account
- **Email**: john.smith@email.com
- **Password**: password123

## Troubleshooting

### If you see "Database connection failed":
1. Make sure MySQL is running in XAMPP
2. Check database credentials in `config/database.php`
3. Verify database `healthcare_pro` exists

### If you see "404 Not Found":
1. Check file paths are correct
2. Make sure files are in `C:\xampp\htdocs\healthcare\`
3. Restart Apache in XAMPP

### If you see PHP errors:
1. Check PHP error logs in XAMPP
2. Make sure PHP version is 7.4 or higher
3. Enable error reporting for debugging

## Testing the System

1. **Homepage**: http://localhost/healthcare
2. **Register**: http://localhost/healthcare/auth/register.php
3. **Login**: http://localhost/healthcare/auth/login.php
4. **Dashboard**: http://localhost/healthcare/dashboard.php (after login)

## Features to Test

### As Patient:
- Register new account
- Book appointment
- View medical records
- Manage appointments

### As Doctor:
- Login with doctor account
- View appointments
- Manage patients
- Add medical records

### As Admin:
- Login with admin account
- Manage users
- View system statistics
- Handle messages


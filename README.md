# Healthcare Management System

A comprehensive healthcare management system built with HTML, CSS, PHP, JavaScript, and SQL. This system provides a complete solution for managing patients, doctors, appointments, medical records, and administrative functions.

## Features

### Patient Features
- **User Registration & Authentication**: Secure registration and login system
- **Appointment Booking**: Easy appointment scheduling with available doctors
- **Medical Records Access**: View personal medical history and prescriptions
- **Appointment Management**: View, cancel, and manage appointments
- **Dashboard**: Personalized dashboard with appointment overview

### Doctor Features
- **Patient Management**: View and manage patient information
- **Appointment Management**: Handle patient appointments and schedules
- **Medical Records**: Add and manage patient medical records
- **Patient History**: Access comprehensive patient medical history
- **Dashboard**: Doctor-specific dashboard with statistics

### Admin Features
- **User Management**: Manage all system users (patients, doctors, admins)
- **Doctor Management**: Manage doctor profiles and specializations
- **Message Management**: Handle contact form messages
- **System Statistics**: View comprehensive system analytics
- **Database Management**: Full administrative control

### General Features
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: Password hashing and session management
- **Contact System**: Integrated contact form and messaging
- **Role-Based Access**: Different interfaces for different user types
- **Modern UI**: Clean and professional design

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Security**: Password hashing, SQL injection prevention
- **Responsive**: Mobile-first design approach

## Installation

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser

### Setup Instructions

1. **Clone or Download** the project files to your web server directory

2. **Database Setup**:
   ```sql
   -- Create database
   CREATE DATABASE healthcare_pro;
   
   -- Import the database schema
   mysql -u username -p healthcare_pro < database_setup.sql
   ```

3. **Configure Database Connection**:
   Edit `config/database.php` with your database credentials:
   ```php
   $host = 'localhost';
   $dbname = 'healthcare_pro';
   $username = 'your_username';
   $password = 'your_password';
   ```

4. **Set Permissions**:
   Ensure the web server has read/write permissions to the project directory

5. **Access the System**:
   Open your web browser and navigate to the project URL

## Default Login Credentials

### Admin Account
- **Email**: admin@healthcarepro.com
- **Password**: admin123
- **Role**: Administrator

### Doctor Accounts
- **Dr. Sarah Johnson**: sarah.johnson@healthcarepro.com / password123
- **Dr. Michael Chen**: michael.chen@healthcarepro.com / password123
- **Dr. Emily Davis**: emily.davis@healthcarepro.com / password123

### Patient Accounts
- **John Smith**: john.smith@email.com / password123
- **Jane Doe**: jane.doe@email.com / password123
- **Bob Wilson**: bob.wilson@email.com / password123

## File Structure

```
healthcare-management-system/
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   └── js/
│       └── script.js          # JavaScript functions
├── auth/
│   ├── login.php              # Login page
│   ├── register.php           # Registration page
│   └── logout.php             # Logout handler
├── config/
│   ├── database.php           # Database configuration
│   └── session.php            # Session management
├── index.php                  # Home page
├── dashboard.php              # Main dashboard
├── book_appointment.php       # Appointment booking
├── appointments.php           # Patient appointments
├── medical_records.php        # Medical records view
├── doctor_appointments.php    # Doctor appointment management
├── doctor_patients.php        # Doctor patient management
├── add_medical_record.php     # Add medical records
├── admin_users.php            # User management
├── admin_doctors.php          # Doctor management
├── admin_messages.php         # Message management
├── contact.php                # Contact form handler
├── database_setup.sql         # Database schema
└── README.md                  # This file
```

## Database Schema

### Core Tables
- **Users**: User accounts and authentication
- **Doctors**: Doctor profiles and specializations
- **Appointments**: Appointment scheduling and management
- **MedicalRecords**: Patient medical history
- **Messages**: Contact form submissions
- **OfficeHours**: System office hours configuration

### Key Features
- **Foreign Key Constraints**: Data integrity
- **Indexes**: Optimized query performance
- **Views**: Pre-built queries for common operations
- **Sample Data**: Ready-to-use test data

## Usage Guide

### For Patients
1. **Register**: Create a new account
2. **Login**: Access your dashboard
3. **Book Appointment**: Schedule with available doctors
4. **View Records**: Access your medical history
5. **Manage Appointments**: Cancel or reschedule appointments

### For Doctors
1. **Login**: Access doctor dashboard
2. **View Appointments**: Manage patient appointments
3. **Patient Management**: View patient information
4. **Medical Records**: Add patient medical records
5. **Update Status**: Mark appointments as completed

### For Administrators
1. **Login**: Access admin dashboard
2. **User Management**: Manage all system users
3. **Doctor Management**: Manage doctor profiles
4. **Message Management**: Handle contact inquiries
5. **System Analytics**: View system statistics

## Security Features

- **Password Hashing**: Secure password storage using PHP's password_hash()
- **SQL Injection Prevention**: Prepared statements for all database queries
- **Session Management**: Secure session handling
- **Role-Based Access**: Different access levels for different user types
- **Input Validation**: Server-side validation for all user inputs

## Customization

### Adding New Features
1. Create new PHP files for new functionality
2. Add corresponding database tables if needed
3. Update navigation menus
4. Add appropriate role-based access controls

### Styling
- Modify `assets/css/style.css` for custom styling
- Responsive design included
- Modern CSS Grid and Flexbox layouts

### Database
- Add new tables as needed
- Update foreign key relationships
- Add indexes for performance optimization

## Troubleshooting

### Common Issues
1. **Database Connection Error**: Check database credentials in `config/database.php`
2. **Permission Denied**: Ensure web server has proper file permissions
3. **Session Issues**: Check PHP session configuration
4. **CSS Not Loading**: Verify file paths and web server configuration

### Debug Mode
Enable PHP error reporting for development:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support and questions:
- Email: support@healthcarepro.com
- Documentation: Check the README and code comments
- Issues: Report bugs and feature requests

## Future Enhancements

- **Email Notifications**: Automated appointment reminders
- **File Uploads**: Medical document attachments
- **Advanced Reporting**: Detailed analytics and reports
- **API Integration**: Third-party service integration
- **Mobile App**: Native mobile application
- **Telemedicine**: Video consultation features

---

**Note**: This is a demonstration system. For production use, implement additional security measures, data backup procedures, and compliance with healthcare regulations (HIPAA, etc.).


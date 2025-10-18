<?php
require_once '../config/database.php';
require_once '../config/session.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $full_name = trim($_POST['full_name']);
    $email = trim($_POST['email']);
    $phone_number = trim($_POST['phone_number']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $role = $_POST['role'];
    
    // Validation
    if (empty($full_name) || empty($email) || empty($password)) {
        $error = 'All fields are required.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } else {
        try {
            // Check if email already exists
            $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = 'Email already exists.';
            } else {
                // Hash password and insert user
                $password_hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO Users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$full_name, $email, $phone_number, $password_hash, $role]);
                
                // If doctor, add to Doctors table and OfficeHours table
                if ($role === 'doctor') {
                    $user_id = $pdo->lastInsertId();
                    $specialization = $_POST['specialization'] ?? '';
                    $office_hours_days = $_POST['office_hours_days'] ?? '';
                    $office_hours_time = $_POST['office_hours_time'] ?? '';
                    
                    // Create office hours string
                    $office_hours = $office_hours_days . ' ' . $office_hours_time;
                    
                    $stmt = $pdo->prepare("INSERT INTO Doctors (user_id, specialization, office_hours) VALUES (?, ?, ?)");
                    $stmt->execute([$user_id, $specialization, $office_hours]);
                    
                    $doctor_id = $pdo->lastInsertId();
                    
                    // Insert office hours into OfficeHours table
                    insertOfficeHours($pdo, $doctor_id, $office_hours_days, $office_hours_time);
                }
                
                $success = 'Registration successful! You can now login.';
            }
        } catch (PDOException $e) {
            $error = 'Registration failed. Please try again.';
        }
    }
}

function insertOfficeHours($pdo, $doctor_id, $days, $time) {
    $day_ranges = [
        'Monday-Friday' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'Monday-Saturday' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'Tuesday-Saturday' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'Monday-Thursday' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        'Tuesday-Friday' => ['Tuesday', 'Wednesday', 'Thursday', 'Friday']
    ];
    
    $time_ranges = [
        '9AM-5PM' => ['09:00:00', '17:00:00'],
        '8AM-4PM' => ['08:00:00', '16:00:00'],
        '10AM-6PM' => ['10:00:00', '18:00:00'],
        '7AM-3PM' => ['07:00:00', '15:00:00'],
        '9AM-7PM' => ['09:00:00', '19:00:00']
    ];
    
    $days_list = $day_ranges[$days] ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    $time_range = $time_ranges[$time] ?? ['09:00:00', '17:00:00'];
    
    $open_time = $time_range[0];
    $close_time = $time_range[1];
    
    foreach ($days_list as $day) {
        $stmt = $pdo->prepare("INSERT INTO OfficeHours (doctor_id, day_of_week, open_time, close_time) VALUES (?, ?, ?, ?)");
        $stmt->execute([$doctor_id, $day, $open_time, $close_time]);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Healthcare Management System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="container">
        <div class="auth-form">
            <h2>Register</h2>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" id="full_name" name="full_name" required value="<?php echo htmlspecialchars($full_name ?? ''); ?>">
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required value="<?php echo htmlspecialchars($email ?? ''); ?>">
                </div>
                
                <div class="form-group">
                    <label for="phone_number">Phone Number</label>
                    <input type="tel" id="phone_number" name="phone_number" value="<?php echo htmlspecialchars($phone_number ?? ''); ?>">
                </div>
                
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" name="role" required onchange="toggleDoctorFields()">
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>
                
                <div id="doctor-fields" style="display: none;">
                    <div class="form-group">
                        <label for="specialization">Specialization</label>
                        <input type="text" id="specialization" name="specialization">
                    </div>
                    
                    <div class="form-group">
                        <label for="office_hours">Office Hours</label>
                        <input type="text" id="office_hours" name="office_hours" placeholder="e.g., Mon-Fri 9AM-5PM">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required>
                </div>
                
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
            
            <p class="auth-link">
                Already have an account? <a href="login.php">Login here</a>
            </p>
        </div>
    </div>
    
    <script>
        function toggleDoctorFields() {
            const role = document.getElementById('role').value;
            const doctorFields = document.getElementById('doctor-fields');
            if (role === 'doctor') {
                doctorFields.style.display = 'block';
            } else {
                doctorFields.style.display = 'none';
            }
        }
    </script>
</body>
</html>

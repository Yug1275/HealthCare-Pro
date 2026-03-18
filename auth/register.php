<?php
require_once '../config/database.php';
require_once '../config/session.php';

$error = '';
$success = '';
$full_name = $email = $phone_number = $role = $specialization = $office_hours_days = $office_hours_time = '';

// Predefined options
$day_options = [
    'Monday-Friday' => 'Monday-Friday',
    'Monday-Saturday' => 'Monday-Saturday',
    'Tuesday-Saturday' => 'Tuesday-Saturday',
    'Monday-Thursday' => 'Monday-Thursday',
    'Tuesday-Friday' => 'Tuesday-Friday'
];

$time_options = [
    '9AM-5PM' => '9AM-5PM',
    '8AM-4PM' => '8AM-4PM',
    '10AM-6PM' => '10AM-6PM',
    '7AM-3PM' => '7AM-3PM',
    '9AM-7PM' => '9AM-7PM'
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $full_name = trim($_POST['full_name']);
    $email = trim($_POST['email']);
    $phone_number = trim($_POST['phone_number']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $role = $_POST['role'];
    $specialization = $_POST['specialization'] ?? '';
    $office_hours_days = $_POST['office_hours_days'] ?? '';
    $office_hours_time = $_POST['office_hours_time'] ?? '';

    // Validation
    if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password) || empty($role)) {
        $error = 'All required fields must be filled.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } elseif ($role === 'doctor' && (empty($specialization) || empty($office_hours_days) || empty($office_hours_time))) {
        $error = 'Specialization and office hours are required for doctors.';
    } else {
        try {
            $pdo->beginTransaction();

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
                $user_id = $pdo->lastInsertId();

                // If doctor, insert into Doctors and OfficeHours
                if ($role === 'doctor') {
                    $stmt = $pdo->prepare("INSERT INTO Doctors (user_id, specialization, office_hours) VALUES (?, ?, ?)");
                    $office_hours_display = "$office_hours_days $office_hours_time";
                    $stmt->execute([$user_id, $specialization, $office_hours_display]);
                    $doctor_id = $pdo->lastInsertId();

                    // Insert individual office hours
                    insertOfficeHours($pdo, $doctor_id, $office_hours_days, $office_hours_time);
                }

                $pdo->commit();
                $success = 'Registration successful! You can now login.';
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            // Optional: log error for debugging
            error_log("Registration error: " . $e->getMessage());
            $error = 'Registration failed. Please try again.';
        }
    }
}

function insertOfficeHours($pdo, $doctor_id, $days_key, $time_key) {
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

    $days_list = $day_ranges[$days_key] ?? [];
    $time_range = $time_ranges[$time_key] ?? ['09:00:00', '17:00:00'];

    if (empty($days_list)) {
        throw new Exception("Invalid office hours days selected.");
    }

    foreach ($days_list as $day) {
        $stmt = $pdo->prepare("INSERT INTO OfficeHours (doctor_id, day_of_week, open_time, close_time) VALUES (?, ?, ?, ?)");
        $stmt->execute([$doctor_id, $day, $time_range[0], $time_range[1]]);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Healthcare Management System</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        input, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
        .btn { padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .alert { padding: 0.75rem; margin-bottom: 1rem; border-radius: 4px; }
        .alert-error { background: #f8d7da; color: #721c24; }
        .alert-success { background: #d4edda; color: #155724; }
    </style>
</head>
<body>
    <div class="container">
        <div class="auth-form">
            <h2>Register</h2>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="form-group">
                    <label for="full_name">Full Name *</label>
                    <input type="text" id="full_name" name="full_name" required value="<?php echo htmlspecialchars($full_name); ?>">
                </div>
                
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required value="<?php echo htmlspecialchars($email); ?>">
                </div>
                
                <div class="form-group">
                    <label for="phone_number">Phone Number</label>
                    <input type="tel" id="phone_number" name="phone_number" value="<?php echo htmlspecialchars($phone_number); ?>">
                </div>
                
                <div class="form-group">
                    <label for="role">Role *</label>
                    <select id="role" name="role" required onchange="toggleDoctorFields()">
                        <option value="patient" <?php echo ($role ?? '') === 'patient' ? 'selected' : ''; ?>>Patient</option>
                        <option value="doctor" <?php echo ($role ?? '') === 'doctor' ? 'selected' : ''; ?>>Doctor</option>
                    </select>
                </div>
                
                <div id="doctor-fields" style="display: <?php echo ($role ?? '') === 'doctor' ? 'block' : 'none'; ?>;">
                    <div class="form-group">
                        <label for="specialization">Specialization *</label>
                        <input type="text" id="specialization" name="specialization" value="<?php echo htmlspecialchars($specialization); ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="office_hours_days">Office Days *</label>
                        <select id="office_hours_days" name="office_hours_days">
                            <?php foreach ($day_options as $value => $label): ?>
                                <option value="<?php echo $value; ?>" <?php echo $office_hours_days === $value ? 'selected' : ''; ?>><?php echo $label; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="office_hours_time">Office Time *</label>
                        <select id="office_hours_time" name="office_hours_time">
                            <?php foreach ($time_options as $value => $label): ?>
                                <option value="<?php echo $value; ?>" <?php echo $office_hours_time === $value ? 'selected' : ''; ?>><?php echo $label; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Password *</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirm Password *</label>
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
            doctorFields.style.display = role === 'doctor' ? 'block' : 'none';
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', toggleDoctorFields);
    </script>
</body>
</html>
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/session.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'register':
        handleRegister();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check_session':
        checkSession();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleLogin() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';
    
    if (empty($email) || empty($password) || empty($role)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = ? AND role = ?");
        $stmt->execute([$email, $role]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['user_id'],
                    'name' => $user['full_name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials or role']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Login failed. Please try again.']);
    }
}

function handleRegister() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $full_name = $input['full_name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $password = $input['password'] ?? '';
    $confirm_password = $input['confirm_password'] ?? '';
    $role = $input['role'] ?? '';
    $specialization = $input['specialization'] ?? '';
    $office_hours_days = $input['office_hours_days'] ?? '';
    $office_hours_time = $input['office_hours_time'] ?? '';
    
    if (empty($full_name) || empty($email) || empty($password) || empty($role)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        return;
    }
    
    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
        return;
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        return;
    }
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            return;
        }
        
        // Hash password and insert user
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$full_name, $email, $phone, $password_hash, $role]);
        
        $user_id = $pdo->lastInsertId();
        
        // If doctor, add to doctors table and office hours
        if ($role === 'doctor' && !empty($specialization)) {
            $office_hours = $office_hours_days . ' ' . $office_hours_time;
            $stmt = $pdo->prepare("INSERT INTO doctors (user_id, specialization, office_hours) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $specialization, $office_hours]);
            
            $doctor_id = $pdo->lastInsertId();
            
            // Insert office hours into OfficeHours table
            insertOfficeHours($pdo, $doctor_id, $office_hours_days, $office_hours_time);
        }
        
        echo json_encode(['success' => true, 'message' => 'Registration successful! You can now login.']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

function checkSession() {
    if (isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['full_name'],
                'email' => $_SESSION['email'],
                'role' => $_SESSION['role']
            ]
        ]);
    } else {
        echo json_encode(['success' => true, 'logged_in' => false]);
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

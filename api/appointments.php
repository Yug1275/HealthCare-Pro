<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/session.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        createAppointment();
        break;
    case 'get':
        getAppointments();
        break;
    case 'update':
        updateAppointment();
        break;
    case 'delete':
        deleteAppointment();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function createAppointment() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $patient_name = $input['patientName'] ?? '';
    $patient_email = $input['patientEmail'] ?? '';
    $patient_phone = $input['patientPhone'] ?? '';
    $specialization = $input['specialization'] ?? '';
    $doctor_name = $input['doctor'] ?? '';
    $appointment_date = $input['appointmentDate'] ?? '';
    $appointment_time = $input['appointmentTime'] ?? '';
    $reason = $input['reason'] ?? '';
    $additional_notes = $input['additionalNotes'] ?? '';
    
    if (empty($patient_name) || empty($patient_email) || empty($specialization) || 
        empty($doctor_name) || empty($appointment_date) || empty($appointment_time) || empty($reason)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        return;
    }
    
    try {
        // Get doctor ID from name
        $stmt = $pdo->prepare("SELECT d.doctor_id FROM doctors d JOIN users u ON d.user_id = u.user_id WHERE u.full_name = ?");
        $stmt->execute([$doctor_name]);
        $doctor = $stmt->fetch();
        
        if (!$doctor) {
            echo json_encode(['success' => false, 'message' => 'Doctor not found']);
            return;
        }
        
        // Get patient ID (create if doesn't exist)
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND role = 'patient'");
        $stmt->execute([$patient_email]);
        $patient = $stmt->fetch();
        
        if (!$patient) {
            // Create patient user
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, 'patient')");
            $password_hash = password_hash('temp123', PASSWORD_DEFAULT); // Temporary password
            $stmt->execute([$patient_name, $patient_email, $patient_phone, $password_hash]);
            $patient_id = $pdo->lastInsertId();
        } else {
            $patient_id = $patient['user_id'];
        }
        
        // Create appointment
        $stmt = $pdo->prepare("INSERT INTO appointments (patient_id, doctor_id, specialization, appointment_date, appointment_time, reason_for_visit, additional_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Booked')");
        $stmt->execute([$patient_id, $doctor['doctor_id'], $specialization, $appointment_date, $appointment_time, $reason, $additional_notes]);
        
        echo json_encode(['success' => true, 'message' => 'Appointment booked successfully!']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to book appointment. Please try again.']);
    }
}

function getAppointments() {
    global $pdo;
    
    $user_role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];
    
    try {
        if ($user_role === 'doctor') {
            // Get doctor's appointments
            $stmt = $pdo->prepare("
                SELECT a.*, u.full_name as patient_name, u.email as patient_email, u.phone_number as patient_phone
                FROM appointments a 
                JOIN users u ON a.patient_id = u.user_id 
                JOIN doctors d ON a.doctor_id = d.doctor_id 
                WHERE d.user_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            ");
            $stmt->execute([$user_id]);
        } else {
            // Get patient's appointments
            $stmt = $pdo->prepare("
                SELECT a.*, u.full_name as doctor_name, d.specialization
                FROM appointments a 
                JOIN doctors d ON a.doctor_id = d.doctor_id 
                JOIN users u ON d.user_id = u.user_id 
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            ");
            $stmt->execute([$user_id]);
        }
        
        $appointments = $stmt->fetchAll();
        echo json_encode(['success' => true, 'appointments' => $appointments]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch appointments']);
    }
}

function updateAppointment() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $appointment_id = $input['id'] ?? '';
    $status = $input['status'] ?? '';
    
    if (empty($appointment_id) || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'Appointment ID and status are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE appointment_id = ?");
        $stmt->execute([$status, $appointment_id]);
        
        echo json_encode(['success' => true, 'message' => 'Appointment updated successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to update appointment']);
    }
}

function deleteAppointment() {
    global $pdo;
    
    $appointment_id = $_GET['id'] ?? '';
    
    if (empty($appointment_id)) {
        echo json_encode(['success' => false, 'message' => 'Appointment ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM appointments WHERE appointment_id = ?");
        $stmt->execute([$appointment_id]);
        
        echo json_encode(['success' => true, 'message' => 'Appointment deleted successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to delete appointment']);
    }
}
?>

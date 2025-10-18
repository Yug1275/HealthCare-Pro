<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../config/session.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_by_specialization':
        getDoctorsBySpecialization();
        break;
    case 'get_patients':
        getDoctorPatients();
        break;
    case 'delete_patient':
        deletePatient();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function getDoctorsBySpecialization() {
    global $pdo;
    
    $specialization = $_GET['specialization'] ?? '';
    
    if (empty($specialization)) {
        echo json_encode(['success' => false, 'message' => 'Specialization is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT u.full_name, d.specialization, d.doctor_id
            FROM doctors d 
            JOIN users u ON d.user_id = u.user_id 
            WHERE d.specialization = ? AND u.role = 'doctor'
            ORDER BY u.full_name
        ");
        $stmt->execute([$specialization]);
        $doctors = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'doctors' => $doctors]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch doctors']);
    }
}

function getDoctorPatients() {
    global $pdo;
    
    if (!isLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $user_role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];
    
    if ($user_role !== 'doctor') {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        return;
    }
    
    try {
        // Get patients who have booked appointments with this doctor
        $stmt = $pdo->prepare("
            SELECT DISTINCT u.user_id, u.full_name, u.email, u.phone_number
            FROM users u 
            JOIN appointments a ON u.user_id = a.patient_id 
            JOIN doctors d ON a.doctor_id = d.doctor_id 
            WHERE d.user_id = ? AND u.role = 'patient'
            ORDER BY u.full_name
        ");
        $stmt->execute([$user_id]);
        $patients = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'patients' => $patients]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch patients']);
    }
}

function deletePatient() {
    global $pdo;
    
    if (!isLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $user_role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];
    
    if ($user_role !== 'doctor') {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        return;
    }
    
    $patient_id = $_GET['id'] ?? '';
    
    if (empty($patient_id)) {
        echo json_encode(['success' => false, 'message' => 'Patient ID is required']);
        return;
    }
    
    try {
        // First, delete all appointments for this patient with this doctor
        $stmt = $pdo->prepare("
            DELETE a FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.doctor_id 
            WHERE a.patient_id = ? AND d.user_id = ?
        ");
        $stmt->execute([$patient_id, $user_id]);
        
        // Then delete all medical records for this patient with this doctor
        $stmt = $pdo->prepare("
            DELETE mr FROM medicalrecords mr 
            JOIN doctors d ON mr.doctor_id = d.doctor_id 
            WHERE mr.patient_id = ? AND d.user_id = ?
        ");
        $stmt->execute([$patient_id, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Patient data deleted successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to delete patient data']);
    }
}
?>


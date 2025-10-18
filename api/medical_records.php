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
        createMedicalRecord();
        break;
    case 'get':
        getMedicalRecords();
        break;
    case 'update':
        updateMedicalRecord();
        break;
    case 'delete':
        deleteMedicalRecord();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function createMedicalRecord() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $patient_name = $input['patient'] ?? '';
    $diagnosis = $input['diagnosis'] ?? '';
    $prescription = $input['prescription'] ?? '';
    $visit_date = $input['visitDate'] ?? '';
    $notes = $input['notes'] ?? '';
    
    if (empty($patient_name) || empty($diagnosis) || empty($visit_date)) {
        echo json_encode(['success' => false, 'message' => 'Patient, diagnosis, and visit date are required']);
        return;
    }
    
    try {
        // Get patient ID
        $stmt = $pdo->prepare("SELECT user_id FROM Users WHERE full_name = ? AND role = 'patient'");
        $stmt->execute([$patient_name]);
        $patient = $stmt->fetch();
        
        if (!$patient) {
            echo json_encode(['success' => false, 'message' => 'Patient not found']);
            return;
        }
        
        // Get doctor ID
        $user_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare("SELECT doctor_id FROM Doctors WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $doctor = $stmt->fetch();
        
        if (!$doctor) {
            echo json_encode(['success' => false, 'message' => 'Doctor not found']);
            return;
        }
        
        // Create medical record
        $stmt = $pdo->prepare("INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, prescription, visit_date) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$patient['user_id'], $doctor['doctor_id'], $diagnosis, $prescription, $visit_date]);
        
        echo json_encode(['success' => true, 'message' => 'Medical record saved successfully!']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to save medical record. Please try again.']);
    }
}

function getMedicalRecords() {
    global $pdo;
    
    $user_role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];
    
    try {
        if ($user_role === 'doctor') {
            // Get all records created by this doctor
            $stmt = $pdo->prepare("
                SELECT mr.*, u.full_name as patient_name, d.specialization
                FROM MedicalRecords mr 
                JOIN Users u ON mr.patient_id = u.user_id 
                JOIN Doctors d ON mr.doctor_id = d.doctor_id 
                WHERE d.user_id = ?
                ORDER BY mr.visit_date DESC
            ");
            $stmt->execute([$user_id]);
        } else {
            // Get patient's records
            $stmt = $pdo->prepare("
                SELECT mr.*, u.full_name as doctor_name, d.specialization
                FROM MedicalRecords mr 
                JOIN Doctors d ON mr.doctor_id = d.doctor_id 
                JOIN Users u ON d.user_id = u.user_id 
                WHERE mr.patient_id = ?
                ORDER BY mr.visit_date DESC
            ");
            $stmt->execute([$user_id]);
        }
        
        $records = $stmt->fetchAll();
        echo json_encode(['success' => true, 'records' => $records]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch medical records']);
    }
}

function updateMedicalRecord() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $record_id = $input['id'] ?? '';
    $diagnosis = $input['diagnosis'] ?? '';
    $prescription = $input['prescription'] ?? '';
    $visit_date = $input['visit_date'] ?? '';
    
    if (empty($record_id)) {
        echo json_encode(['success' => false, 'message' => 'Record ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE MedicalRecords SET diagnosis = ?, prescription = ?, visit_date = ? WHERE record_id = ?");
        $stmt->execute([$diagnosis, $prescription, $visit_date, $record_id]);
        
        echo json_encode(['success' => true, 'message' => 'Medical record updated successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to update medical record']);
    }
}

function deleteMedicalRecord() {
    global $pdo;
    
    $record_id = $_GET['id'] ?? '';
    
    if (empty($record_id)) {
        echo json_encode(['success' => false, 'message' => 'Record ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM MedicalRecords WHERE record_id = ?");
        $stmt->execute([$record_id]);
        
        echo json_encode(['success' => true, 'message' => 'Medical record deleted successfully']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to delete medical record']);
    }
}
?>

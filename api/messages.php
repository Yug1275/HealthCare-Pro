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
    case 'create':
        createMessage();
        break;
    case 'get':
        getMessages();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function createMessage() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $full_name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $subject = $input['subject'] ?? '';
    $message = $input['message'] ?? '';
    
    if (empty($full_name) || empty($email) || empty($subject) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Name, email, subject, and message are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO Messages (full_name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$full_name, $email, $phone, $subject, $message]);
        
        echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to send message. Please try again.']);
    }
}

function getMessages() {
    global $pdo;
    
    if (!isLoggedIn()) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $user_role = $_SESSION['role'];
    
    if ($user_role !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM Messages ORDER BY created_at DESC");
        $stmt->execute();
        $messages = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'messages' => $messages]);
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch messages']);
    }
}
?>


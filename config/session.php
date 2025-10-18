<?php
// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Function to get current user role
function getCurrentUserRole() {
    return $_SESSION['role'] ?? null;
}

// Function to require login
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit();
    }
}

// Function to require specific role
function requireRole($requiredRole) {
    requireLogin();
    if (getCurrentUserRole() !== $requiredRole) {
        header('Location: unauthorized.php');
        exit();
    }
}

// Function to logout
function logout() {
    // Clear all session variables
    $_SESSION = array();
    
    // Destroy the session cookie if it exists
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy the session
    session_destroy();
    
    // Determine the correct path based on current directory
    $current_dir = dirname($_SERVER['PHP_SELF']);
    if (strpos($current_dir, '/auth') !== false) {
        // If we're in auth directory, go up one level
        header('Location: ../index.php');
    } else {
        // If we're in root directory, go directly
        header('Location: index.php');
    }
    exit();
}
?>

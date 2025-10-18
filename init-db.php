<?php
require_once 'config/database.php';

try {
    // Read and execute the SQL file
    $sql = file_get_contents('database_setup.sql');
    
    // Split the SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "Database initialized successfully!";
} catch (PDOException $e) {
    echo "Error initializing database: " . $e->getMessage();
}
?>

<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: log.php');
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user_id = $_SESSION['user_id'];

if (isset($_POST['delete_account'])) {
    // Delete user posts
    $sql_delete_posts = "DELETE FROM blog_posts WHERE author = (SELECT FULLNAME FROM login WHERE id = ?)";
    $stmt_delete_posts = $conn->prepare($sql_delete_posts);
    $stmt_delete_posts->bind_param("i", $user_id);
    $stmt_delete_posts->execute();

    // Delete user account
    $sql_delete_account = "DELETE FROM login WHERE id = ?";
    $stmt_delete_account = $conn->prepare($sql_delete_account);
    $stmt_delete_account->bind_param("i", $user_id);
    if ($stmt_delete_account->execute()) {
        // Account deleted, end session
        session_destroy();
        header("Location: log.php?success=Account deleted successfully.");
    } else {
        header("Location: delete_account.php?error=Error deleting account.");
    }

    $stmt_delete_posts->close();
    $stmt_delete_account->close();
}

$conn->close();
?>

<?php

session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $email = $conn->real_escape_string($email);

    $sql = "SELECT * FROM login WHERE EMAIL='$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (hash_equals($user['PASSWORD'], hash('sha256', $password))) {
            $_SESSION['user_id'] = $user['ID'];
            $_SESSION['fullname'] = $user['FULLNAME'];
            header("Location: blog.php");
            exit();
        } else {
            header("Location: log.php?error=Invalid Email or Password");
            exit();
        }
    } else {
        header("Location: log.php?error=Invalid Email or Password");
        exit();
    }
}

$conn->close();















// session_start();

// // Database connection details
// $servername = "localhost";
// $username = "root";
// $password = "";
// $dbname = "user";

// // Create connection
// $conn = new mysqli($servername, $username, $password, $dbname);

// // Check connection
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

// // Check if the form is submitted
// if ($_SERVER["REQUEST_METHOD"] == "POST") {
//     $email = $_POST['email'];
//     $password = $_POST['password'];

//     // Protect against SQL injection
//     $email = $conn->real_escape_string($email);

//     // Query to check if the email exists
//     $sql = "SELECT * FROM login WHERE EMAIL='$email'";
//     $result = $conn->query($sql);

//     if ($result->num_rows > 0) {
//         $user = $result->fetch_assoc();
//         // Verify the password
//         if (hash_equals($user['PASSWORD'], hash('sha256', $password))) {
//             // Login successful, set session variables
//             $_SESSION['email'] = $email;
//             // Redirect to the dashboard or another secured page
//             header("Location: http://localhost/project/blog.php");
//             exit();
//         } else {
//             // Password doesn't match
//             header("Location: log.php?error=Invalid Email or Password");
//             exit();
//         }
//     } else {
//         // Email doesn't exist
//         header("Location: log.php?error=Invalid Email or Password");
//         exit();
//     }
// }

// $conn->close();






// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// session_start();

// if ($_SERVER['REQUEST_METHOD'] == 'POST') {
//     $email = $_POST['email'];
//     $password = $_POST['password'];

//     // Database connection
//     $con = new mysqli("localhost", "root", "", "user");

//     // Check connection
//     if ($con->connect_error) {
//         die('Failed to connect to database: ' . $con->connect_error);
//     }

//     // Prepare SQL statement
//     $stmt = $con->prepare('SELECT * FROM login WHERE EMAIL = ?');
//     if ($stmt === false) {
//         die('Error preparing statement: ' . $con->error);
//     }

//     // Bind parameters
//     $stmt->bind_param('s', $email);

//     // Execute query
//     $stmt->execute();

//     // Get result
//     $result = $stmt->get_result();

//     if ($result->num_rows > 0) {
//         // Fetch user data
//         $data = $result->fetch_assoc();

//         // Verify password
//         if (password_verify($password, $data['PASSWORD'])) {
//             // Store user info in session
//             $_SESSION['user_id'] = $data['ID'];
//             $_SESSION['fullname'] = $data['FULLNAME'];
//             $_SESSION['email'] = $data['EMAIL'];

//             // Redirect to dashboard or desired page
//             header('Location: http://localhost/project/dashboard.php');
//             exit();
//         } else {
//             // Invalid password
//             header('Location: http://localhost/project/log.php?error=Invalid%20email%20or%20password');
//             exit();
//         }
//     } else {
//         // User not found
//         header('Location: http://localhost/project/log.php?error=Invalid%20email%20or%20password');
//         exit();
//     }

//     // Close statement and connection
//     $stmt->close();
//     $con->close();
// } else {
//     // Redirect to login page if accessed directly
//     header('Location: http://localhost/project/log.php');
//     exit();
// }

















// session_start();

// if ($_SERVER['REQUEST_METHOD'] == 'POST') {
//     $email = $_POST['email'];
//     $password = $_POST['password'];

//     $con = new mysqli("localhost", "root", "", "user");

//     if ($con->connect_error) {
//         die('Failed to connect: ' . $con->connect_error);
//     } else {
//         $stmt = $con->prepare('SELECT * FROM login WHERE EMAIL = ?');
//         if ($stmt === false) {
//             die('Error preparing statement: ' . $con->error);
//         }
//         $stmt->bind_param('s', $email);
//         $stmt->execute();
//         $stmt_result = $stmt->get_result();

//         if ($stmt_result->num_rows > 0) {
//             $data = $stmt_result->fetch_assoc();

//             // Verify the password
//             if (password_verify($password, $data['PASSWORD'])) {
//                 // Store user info in session
//                 $_SESSION['user_id'] = $data['ID']; // Assuming you have an ID column
//                 $_SESSION['fullname'] = $data['FULLNAME'];
//                 $_SESSION['email'] = $data['EMAIL'];

//                 header('Location: blog.php'); // Redirect to blog page
//                 exit();
//             } else {
//                 header('Location: log.php?error=Invalid%20email%20or%20password');
//                 exit();
//             }
//         } else {
//             header('Location: log.php?error=Invalid%20email%20or%20password');
//             exit();
//         }

//         $stmt->close();
//         $con->close();
//     }
// }



?>

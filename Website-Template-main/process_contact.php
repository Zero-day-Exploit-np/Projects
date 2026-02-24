<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];
    
    // Validate email (optional)
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: contact.php?error=invalid_email");
        exit();
    }
    
    // Compose email message
    $to = "example@gmail.com'; // Replace with your email
    $from = $email;
    $headers = "From: $from";
    $body = "Name: $name\n\nEmail: $email\n\nSubject: $subject\n\nMessage:\n$message";
    
    // Send email
    if (mail($to, $subject, $body, $headers)) {
        header("Location: contact.php?success=message_sent");
        exit();
    } else {
        header("Location: contact.php?error=message_not_sent");
        exit();
    }
} else {
    header("Location: contact.php");
    exit();
}
?>

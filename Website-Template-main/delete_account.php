<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: log.php'); // Redirect to login if not logged in
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Account</title>
    <link rel="stylesheet" href="styles.css"> <!-- Link your CSS file here -->
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 154px;

        }

        .container h2 {
            color: #333;
            text-align: center;
        }

        .error-message,
        .success-message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
        }

        .error-message {
            background-color: #f8d7da;
            color: #721c24;
        }

        .success-message {
            background-color: #d4edda;
            color: #155724;
        }

        form {
            text-align: center;
        }

        button[type="submit"] {
            padding: 10px 20px;
            background-color: #dc3545;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        button[type="submit"]:hover {
            background-color: #c82333;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Delete Account</h2>
        <?php if (isset($_GET['error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_GET['error']); ?></div>
        <?php endif; ?>
        <?php if (isset($_GET['success'])): ?>
            <div class="success-message"><?php echo htmlspecialchars($_GET['success']); ?></div>
        <?php endif; ?>
        <form action="delete_account_process.php" method="post">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <button type="submit" name="delete_account">Delete Account</button>
        </form>
    </div>
    <footer>
        <!-- Footer content here -->

        <footer>
            <div class="footer-content">
                <div class="footer-section about">
                    <h2>About Us</h2>
                    <p>We are a team of passionate individuals working together to create amazing web experiences.</p>
                </div>
                <div class="footer-section links">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="#">Services</a></li>
                        <li><a href="#">Contact</a></li>
                        <li><a href="about.php">About</a></li>
                    </ul>
                </div>
                <div class="footer-section contact">
                    <h2>Contact Us</h2>
                    <p>Email: sonukarn.org@gmail.com</p>
                    <p>Phone: +123 456 7890</p>
                    <p><a href="https://github.com/Sonu-Karn" class="footer-link">GitHub</a></p>
                    <p><a href="https://www.facebook.com/sonukarn.org.np" class="footer-link">Facebook</a></p>
                    <p><a href="https://www.instagram.com/sonu_s.o.n.u" class="footer-link">Instagram</a></p>
                </div>
            </div>

            <div class="footer-bottom">
                &copy; 2024 YourCompanyName. All rights reserved.
            </div>
        </footer>
    </footer>
</body>

</html>
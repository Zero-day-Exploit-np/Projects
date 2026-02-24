<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>

    <div class="login-container">
        <h2>Login Form</h2>
        <?php if (isset($_GET['error'])): ?>
            <div class="error-message"><?php echo htmlspecialchars($_GET['error']); ?></div>
        <?php endif; ?>
        <form action="http://localhost/project/login.php" method="post">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" autocomplete="new-email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" autocomplete="new-password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <!-- http://127.0.0.1:5000 -->
        <div class="options">
            <a href="http://127.0.0.1:5000" id="create-account">Create a New Account</a>
            <span class="separator"> </span>
            <br>
            <a href="Forgot-Password.html" id="forgot-password">Forgot Password</a>
        </div>
    </div>

    <footer>
        <div class="footer-content">
            <div class="footer-section about">
                <h2>About Us</h2>
                <p>We are a team of passionate individuals working together to create amazing web experiences.</p>
            </div>
            <div class="footer-section links">
                <h2>Quick Links</h2>
                <ul>
                    <li><a href="http://localhost/project/index.html">Home</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="http://localhost/project/contact.php">Contact</a></li>
                    <li><a href="http://localhost/project/about.php">About</a></li>
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
</body>

</html>

<!-- 
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>

    <div class="login-container">
        <h2>Login Form</h2>
        <
        ?php if (isset($_GET['error'])): ?>      <
            <div class="error-message">          ?php echo htmlspecialchars($_GET['error']); ?></div>
        <
            ?php endif; ?>
        <form action="http://localhost/project/login.php" method="post">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" autocomplete="new-email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" autocomplete="new-password" required>
            </div>
            <button type="submit" onclick="login()">Login</button>
        </form>
        <div class="options">
            <a href="http://127.0.0.1:5000/" id="create-account">Create a New Account</a>
            <span class="separator"> </span>
            <br>
            <a href="Forgot-Password.html" id="forgot-password">Forgot Password</a>
        </div>
    </div>


    
    <footer>
    <div class="footer-content">
        <div class="footer-section about">
            <h2>About Us</h2>
            <p>We are a team of passionate individuals working together to create amazing web experiences.</p>
        </div>
        <div class="footer-section links">
            <h2>Quick Links</h2>
            <ul>
                <li><a href="http://localhost/project/index.html">Home</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="http://localhost/project/about.php">About</a></li>
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
</body>

</html> -->
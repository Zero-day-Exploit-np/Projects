<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
    <link rel="stylesheet" href="contact.css"> <!-- Link to your CSS file -->
    <!-- Optional: You can add a favicon using the <link> tag -->
</head>
<body>
    <div class="container">
        <h2>Contact Us</h2>
        <form action="process_contact.php" method="post">
            <label for="name">Your Name:</label>
            <input type="text" id="name" name="name" required>
            
            <label for="email">Your Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="subject">Subject:</label>
            <input type="text" id="subject" name="subject" required>
            
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="4" required></textarea>
            
            <button type="submit">Send Message</button>
        </form>
    </div>

    <footer>
        <!-- Footer content here -->
        <div class="footer-content">
        <div class="footer-section about">
            <h2>About Us</h2>
            <p>We are a team of passionate individuals working together to create amazing web experiences.</p>
        </div>
        <div class="footer-section links">
            <h2>Quick Links</h2>
            <ul>
                <li><a href="http://localhost/project/index.php">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="http://localhost/project/contact.php">Contact</a></li>
                <li><a href="http://localhost/project/about.html">About</a></li>
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

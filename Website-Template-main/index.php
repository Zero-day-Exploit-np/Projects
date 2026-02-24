<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Home</title>
  <link rel="icon" href="/image/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="./index.css">

</head>

<body>
  <!-- partial:index.partial.html -->
  <header>
    <h1>Crafted by Sonu Karn: Your gateway to insightful blogging.</h1>
    <nav>
      <a href="http://localhost/project/index.php">Home</a>
      <a href="http://localhost/project/about.html">About</a>
      <a href="http://localhost/project/contact.php">Contact</a>
      <a href="http://localhost/project/log.php">Login</a>

    </nav>
  </header>
  <div class="wrapper">
    <section id='steezy'>
      <h2>Latest Blogs</h2>
      <?php
      $servername = "localhost";
      $username = "root";
      $password = "";
      $dbname = "user"; // Assuming your database name is blog_db

      // Create connection
      $conn = new mysqli($servername, $username, $password, $dbname);

      // Check connection
      if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
      }

      // Fetch all blog posts
      $sql = "SELECT * FROM blog_posts";
      $result = $conn->query($sql);

      if ($result === false) {
        echo "Error fetching blog posts: " . $conn->error;
      } else {
        if ($result->num_rows > 0) {
          while ($row = $result->fetch_assoc()) {
            echo "<h2>" . htmlspecialchars($row["title"]) . "</h2>";
            if (!empty($row["image"])) {
              echo "<img src='" . htmlspecialchars($row["image"]) . "' alt='" . htmlspecialchars($row["title"]) . "'style='max-width: 300px;'><br>";
            }
            echo "<p>" . htmlspecialchars($row["content"]) . "</p>";
            echo "<small>By " . htmlspecialchars($row["author"]) . " on " . htmlspecialchars($row["created_at"]) . "</small>";
            echo "<hr>";
          }
        } else {
          echo "0 results";
        }
      }
      $conn->close();
      ?>
      
    </section>

    <!-- <section id='real'>
     
    </section> -->

    <!-- <section id='big'>
     
    </section> -->
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
    <div class="footer-bottosm">
      &copy; 2024 YourCompanyName. All rights reserved.
    </div>
  </footer>
</body>
<!-- partial -->
<script src='//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>
<script src="index.js"></script>

</body>

</html>
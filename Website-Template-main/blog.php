<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: log.php'); // Redirect to login if not logged in
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user_id = $_SESSION['user_id'];
$fullname = $_SESSION['fullname'];

// Fetch all posts by the user
$sql = "SELECT * FROM blog_posts WHERE author = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $fullname);
$stmt->execute();
$result = $stmt->get_result();

// Insert, Update or Delete a post
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = htmlspecialchars($_POST["title"]);
    $content = htmlspecialchars($_POST["content"]);

    if (isset($_POST['delete_post_id']) && !empty($_POST['delete_post_id'])) {
        // Delete existing post
        $delete_post_id = $_POST['delete_post_id'];

        $stmt = $conn->prepare("DELETE FROM blog_posts WHERE id = ? AND author = ?");
        $stmt->bind_param("is", $delete_post_id, $fullname);
        $stmt->execute();
        $stmt->close();

        header("Location: blog.php");
        exit();
    } elseif (isset($_POST['post_id']) && !empty($_POST['post_id'])) {
        // Update existing post
        $post_id = $_POST['post_id'];

        if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
            $image = $_FILES["image"]["name"];
            $imageFileType = strtolower(pathinfo($image, PATHINFO_EXTENSION));
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            $target_dir = "uploads/";
            $target_file = $target_dir . uniqid() . '.' . $imageFileType;

            if (in_array($imageFileType, $allowedTypes)) {
                if ($_FILES["image"]["size"] <= 2 * 1024 * 1024) {
                    $check = getimagesize($_FILES["image"]["tmp_name"]);
                    if ($check !== false) {
                        if (!is_dir($target_dir)) {
                            mkdir($target_dir, 0755, true);
                        }

                        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                            // Update post with image
                            $stmt = $conn->prepare("UPDATE blog_posts SET title = ?, content = ?, image = ? WHERE id = ? AND author = ?");
                            $stmt->bind_param("sssis", $title, $content, $target_file, $post_id, $fullname);
                            $stmt->execute();
                            $stmt->close();

                            header("Location: blog.php");
                            exit();
                        } else {
                            echo "Sorry, there was an error uploading your file.";
                        }
                    } else {
                        echo "File is not an image.";
                    }
                } else {
                    echo "File is too large. Maximum file size is 2MB.";
                }
            } else {
                echo "Only JPG, JPEG, PNG & GIF files are allowed.";
            }
        } else {
            // Update post without changing image
            $stmt = $conn->prepare("UPDATE blog_posts SET title = ?, content = ? WHERE id = ? AND author = ?");
            $stmt->bind_param("ssis", $title, $content, $post_id, $fullname);
            $stmt->execute();
            $stmt->close();

            header("Location: blog.php");
            exit();
        }
    } else {
        // Insert new post
        if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
            $image = $_FILES["image"]["name"];
            $imageFileType = strtolower(pathinfo($image, PATHINFO_EXTENSION));
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            $target_dir = "uploads/";
            $target_file = $target_dir . uniqid() . '.' . $imageFileType;

            if (in_array($imageFileType, $allowedTypes)) {
                if ($_FILES["image"]["size"] <= 2 * 1024 * 1024) {
                    $check = getimagesize($_FILES["image"]["tmp_name"]);
                    if ($check !== false) {
                        if (!is_dir($target_dir)) {
                            mkdir($target_dir, 0755, true);
                        }

                        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
                            $stmt = $conn->prepare("INSERT INTO blog_posts (title, content, author, image) VALUES (?, ?, ?, ?)");
                            $stmt->bind_param("ssss", $title, $content, $fullname, $target_file);
                            $stmt->execute();
                            $stmt->close();

                            header("Location: blog.php");
                            exit();
                        } else {
                            echo "Sorry, there was an error uploading your file.";
                        }
                    } else {
                        echo "File is not an image.";
                    }
                } else {
                    echo "File is too large. Maximum file size is 2MB.";
                }
            } else {
                echo "Only JPG, JPEG, PNG & GIF files are allowed.";
            }
        } else {
            $stmt = $conn->prepare("INSERT INTO blog_posts (title, content, author) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $title, $content, $fullname);
            $stmt->execute();
            $stmt->close();

            header("Location: blog.php");
            exit();
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Blog</title>
    <link rel="stylesheet" href="blog.css">
    <style>
        body {
            margin: 0;
        }
        footer {
            background: #333;
            color: #fff;
            padding: 20px 0;
            text-align: center;
        }
        p {
            margin-bottom: 2rem;
            line-height: 2;
            color: #7f8c8d;
        }
        .footer-content {
            display: flex;
            justify-content: space-around;
            max-width: 1200px;
            margin: auto;
        }
        .footer-section {
            flex: 1;
            padding: 10px;
        }
        .footer-section h2 {
            color: aliceblue;
            margin-top: 0;
            font-size: 18px;
        }
        .footer-section p, .footer-section ul, .footer-section li {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .footer-section ul {
            padding-top: 10px;
        }
        .footer-section ul li {
            margin-bottom: 10px;
        }
        .footer-section ul li a {
            color: #fff;
            text-decoration: none;
        }
        .footer-section ul li a:hover {
            text-decoration: underline;
        }
        .footer-link {
            color: azure;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        .footer-bottom {
            margin-top: 20px;
            font-size: 14px;
        }



        .delete-account-btn-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px; /* Adjust as needed */
        }

        .delete-account-btn {
            background-color: #f44336; /* Red */
            color: white;
            padding: 10px 20px;
            border: none;
            text-decoration: none;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .delete-account-btn:hover {
            background-color: #d32f2f; /* Darker red */
        }
    
    </style>
   
</head>
<body>
    <div class="blog-container">
    <div class="delete-account-btn-wrapper">
            <a class="delete-account-btn" href="http://localhost/project/delete_account.php">Delete Account</a>
        </div>

    <h2 id="form-title">Create a New Blog Post</h2>
        <p>Welcome, <?php echo htmlspecialchars($fullname); ?>! <a href="logout.php">Logout</a></p>
        <form method="post" action="blog.php" enctype="multipart/form-data">
            <input type="hidden" name="post_id" id="post_id" value="">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
            <label for="content">Content:</label>
            <textarea id="content" name="content" required></textarea>
            <label for="image">Image:</label>
            <input type="file" id="image" name="image" accept="image/*"><br>
            <button type="submit">Save</button>
        </form>
        <div id="error" class="error"></div>
    </div>

    <hr>

    <div class="blog-container">
        <h2>Existing Blog Posts</h2>
        <?php
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<div>";
                echo "<h3>" . htmlspecialchars($row["title"]) . "</h3>";
                if (!empty($row["image"])) {
                    echo "<img src='" . htmlspecialchars($row["image"]) . "' alt='" . htmlspecialchars($row["title"]) . "' style='max-width: 300px;'><br>";
                }
                echo "<p>" . htmlspecialchars($row["content"]) . "</p>";
                echo "<small>By " . htmlspecialchars($row["author"]) . " on " . htmlspecialchars($row["created_at"]) . "</small>";
                echo "<br><a href='#' class='edit-link' data-id='" . $row["id"] . "' data-title='" . htmlspecialchars($row["title"]) . "' data-content='" . htmlspecialchars($row["content"]) . "'>Edit</a>";
                echo "<form method='post' action='blog.php' style='display:inline-block; margin-left: 10px;'>
                        <input type='hidden' name='delete_post_id' value='" . $row["id"] . "'>
                        <button type='submit' onclick='return confirm(\"Are you sure you want to delete this post?\");'>Delete</button>
                      </form>";
                echo "</div><hr>";
            }
        } else {
            echo "0 results";
        }
        ?>
    </div>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        let editLinks = document.querySelectorAll(".edit-link");
        editLinks.forEach(function(link) {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                let postId = link.getAttribute("data-id");
                let title = link.getAttribute("data-title");
                let content = link.getAttribute("data-content");
                
                document.getElementById("post_id").value = postId;
                document.getElementById("title").value = title;
                document.getElementById("content").value = content;

                document.getElementById("form-title").textContent = "Edit Blog Post";
                document.querySelector("form button").textContent = "Update";
            });
        });
    });
    </script>

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
                    <li><a href="#contact">Contact</a></li>
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

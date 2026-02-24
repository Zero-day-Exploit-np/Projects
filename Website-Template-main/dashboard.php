
<?php
session_start();
if (!isset($_SESSION['email'])) {
    header("Location: log.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="blog.css">

</head>

<body>
    <h1>Welcome to your Dashboard</h1>
    <p>Hello, <?php echo htmlspecialchars($_SESSION['email']); ?>!</p>
    <a href="logout.php">Logout</a>
  
</body>

</html>

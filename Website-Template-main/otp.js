
  function sendOTP() {
    // Assuming you have a server-side endpoint to send OTP via email or SMS
    // This is a simplified example and needs server-side implementation for real-world scenarios
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Simulating sending OTP (in real-world, this would be done via AJAX/fetch to your server)
    alert(`OTP sent to ${email} or ${phone}`);

    // Show OTP verification form and hide account creation form
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('otp-form').style.display = 'block';
  }

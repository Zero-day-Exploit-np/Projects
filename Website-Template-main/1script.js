document.getElementById('signup-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = {
    fullname: document.getElementById('fullname').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phone: document.getElementById('phone').value
  };

  const response = await fetch('/create_account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  if (response.ok) {
    alert('Account created successfully!');
  } else {
    alert('Failed to create account.');
  }
});

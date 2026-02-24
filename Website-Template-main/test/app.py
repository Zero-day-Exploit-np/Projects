# Import necessary modules from Flask and other libraries
from flask import Flask, request, jsonify, session, send_from_directory, render_template, redirect, url_for
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import mysql.connector  # For database connection
import os

# Initialize the Flask app
app = Flask(__name__)

# Generate a random secret key for session management
app.secret_key = os.urandom(24)

# Email credentials and settings
EMAIL_ADDRESS = 'example@gmail.com'  # Sender's email address
EMAIL_PASSWORD = 'abcd efgh ijkl mnop'        # Email password (App-specific password)
SMTP_SERVER = 'smtp.gmail.com'                # SMTP server for Gmail
SENDER_NAME = 'Mero WebSite'                  # Name of the sender
SMTP_PORT = 587                               # SMTP port for sending emails via Gmail

# Function to generate a random 6-digit OTP
def generate_otp():
    return random.randint(100000, 999999)

# Function to send the OTP via email
def send_otp_via_email(email, otp):
    try:
        # Create an email message object with subject and body
        msg = MIMEMultipart()
        msg['From'] = f"{SENDER_NAME} <{EMAIL_ADDRESS}>"  # Sender's information
        msg['To'] = email                                  # Recipient's email
        msg['Subject'] = 'Your OTP Code'                   # Email subject

        # Create the body of the email
        body = f'Your OTP code is {otp}'
        msg.attach(MIMEText(body, 'plain'))

        # Establish connection to the SMTP server
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()                              # Secure the connection
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)    # Log in to the email server
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())  # Send the email
        
        print(f'OTP email sent to {email}')
        return True

    # Handle SMTP authentication errors
    except smtplib.SMTPAuthenticationError as e:
        print(f'Error sending OTP email to {email}: SMTP Authentication Error - {e.smtp_error}')
        return False
    
    # Handle other possible exceptions
    except Exception as e:
        print(f'Error sending OTP email to {email}: {str(e)}')
        return False

# Route for serving the index page
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')  # Serve the index.html file

# Route for requesting an OTP
@app.route('/request_otp', methods=['POST'])
def request_otp():
    data = request.json  # Get the JSON data from the client
    email = data.get('email')  # Extract email from the request data

    # If email is missing, return an error response
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Generate a new OTP and store it in the session
    otp = generate_otp()
    session['otp'] = otp
    session['email'] = email

    # Send the OTP via email and return a success or failure message
    if send_otp_via_email(email, otp):
        return jsonify({'message': 'OTP sent successfully'})
    else:
        return jsonify({'error': 'Failed to send OTP'}), 500

# Route for verifying the OTP
@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.json  # Get the JSON data from the client
    user_otp = data.get('otp')  # Extract the OTP provided by the user

    # If OTP is missing, return an error response
    if not user_otp:
        return jsonify({'error': 'OTP is required'}), 400

    # If no OTP has been requested, return an error response
    if 'otp' not in session:
        return jsonify({'error': 'No OTP requested'}), 400

    print(f"Expected OTP: {session['otp']}, Provided OTP: {user_otp}")

    try:
        # If the provided OTP matches the one stored in the session, verify it
        if int(user_otp) == session['otp']:
            session.pop('otp')  # Remove OTP from session after successful verification
            session['otp_verified'] = True  # Set a flag indicating OTP verification success
            return jsonify({'message': 'OTP verified successfully'})
        else:
            return jsonify({'error': 'Invalid OTP'}), 400
    except Exception as e:
        print(f'Error during OTP verification: {str(e)}')
        return jsonify({'error': 'An error occurred during OTP verification.'}), 500

# Route to render the login page
@app.route('/login')
def login_page():
    return render_template('login.html')  # Render login.html template

# Route for creating a new account after OTP verification
@app.route('/new-account-open.php', methods=['POST'])
def create_account():
    # Ensure that OTP has been verified before creating an account
    if 'otp_verified' not in session or not session['otp_verified']:
        return jsonify({'error': 'OTP not verified'}), 400

    # Get user inputs from the form
    fullname = request.form['fullname']
    phone = request.form['phone']
    email = request.form['email']
    password = request.form['password']

    # Ensure the email used to request OTP matches the email used to create the account
    if email != session.get('email'):
        return jsonify({'error': 'Email does not match the one used to request OTP'}), 400

    # Hash the password using SHA-256
    hashed_password = password_hash(password)

    try:
        # Connect to MySQL database
        con = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="user"
        )

        cursor = con.cursor()

        # Prepare SQL query to insert data into the 'login' table
        insert_query = "INSERT INTO login (FULLNAME, EMAIL, PASSWORD, PHONE, OTP) VALUES (%s, %s, %s, %s, 'verified')"
        insert_values = (fullname, email, hashed_password, phone)

        # Execute the query
        cursor.execute(insert_query, insert_values)

        # Commit changes
        con.commit()

        # Close cursor and connection
        cursor.close()
        con.close()

        # Clean up the session
        session.pop('otp_verified')  # Remove the flag after successful account creation
        session.pop('email')  # Remove email from session

        return jsonify({'message': 'Account created successfully', 'redirect': 'http://localhost/project/log.php'})

    # Handle database errors
    except mysql.connector.Error as err:
        print(f"Error creating account: {err}")
        return jsonify({'error': f"Error creating account: {err}"}), 500

# Function to hash the password using SHA-256
def password_hash(password):
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

# Main entry point of the application
if __name__ == '__main__':
    app.run(debug=True)  # Run the app in debug mode

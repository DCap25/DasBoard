const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  console.log('Send emails function called:', event.httpMethod);

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { type, data } = JSON.parse(event.body);
    console.log('Email request type:', type);

    const adminEmail = 'admin@thedasboard.com';

    switch (type) {
      case 'signup_notification':
        return await handleSignupNotification(data, adminEmail, headers);
      case 'welcome_email':
        return await handleWelcomeEmail(data, headers);
      case 'temp_password':
        return await handleTempPasswordEmail(data, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid email type' }),
        };
    }
  } catch (error) {
    console.error('Email function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message,
      }),
    };
  }
};

async function handleSignupNotification(data, adminEmail, headers) {
  const { name, email, companyType, subscriptionId } = data;

  const adminMessage = {
    to: adminEmail,
    from: 'noreply@thedasboard.com',
    subject: 'New Das Board Signup - Action Required',
    html: `
      <h2>New Das Board Signup</h2>
      <p>A new user has signed up and requires approval:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Company Type:</strong> ${companyType}</li>
        <li><strong>Subscription ID:</strong> ${subscriptionId}</li>
        <li><strong>Signup Time:</strong> ${new Date().toISOString()}</li>
      </ul>
      <p>Please review and add this user to the appropriate role in the Das Board admin panel.</p>
    `,
  };

  await sgMail.send(adminMessage);
  console.log('Admin notification sent for:', email);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Admin notification sent successfully' }),
  };
}

async function handleWelcomeEmail(data, headers) {
  const { name, email } = data;

  const welcomeMessage = {
    to: email,
    from: 'noreply@thedasboard.com',
    subject: 'Welcome to The Das Board!',
    html: `
      <h2>Welcome to The Das Board, ${name}!</h2>
      <p>Thank you for signing up for The Das Board. Your account has been created successfully.</p>
      <p>Our team is currently reviewing your account and setting up your access permissions.</p>
      <p>You will receive another email with your temporary login credentials once your account is ready.</p>
      <p>If you have any questions, please contact our support team.</p>
      <br>
      <p>Best regards,<br>The Das Board Team</p>
    `,
  };

  await sgMail.send(welcomeMessage);
  console.log('Welcome email sent to:', email);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Welcome email sent successfully' }),
  };
}

async function handleTempPasswordEmail(data, headers) {
  const { name, email, tempPassword, role } = data;

  const tempPasswordMessage = {
    to: email,
    from: 'noreply@thedasboard.com',
    subject: 'Your Das Board Account is Ready',
    html: `
      <h2>Your Das Board Account is Ready, ${name}!</h2>
      <p>Your account has been approved and set up with the following details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Temporary Password:</strong> <code>${tempPassword}</code></li>
      </ul>
      <p>Please log in at <a href="https://das-board-app.netlify.app">https://das-board-app.netlify.app</a> using your email and the temporary password above.</p>
      <p><strong>Important:</strong> Please change your password after your first login.</p>
      <br>
      <p>Best regards,<br>The Das Board Team</p>
    `,
  };

  await sgMail.send(tempPasswordMessage);
  console.log('Temporary password email sent to:', email);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Temporary password email sent successfully' }),
  };
}

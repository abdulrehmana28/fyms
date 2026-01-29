const generateForgotPasswordEmailTemplate = (resetPasswordUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reset Your Password</h1>
        <p>Hello,</p>
        <p>You have requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetPasswordUrl}" class="button">Reset Password</a>
        <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br>Your Team</p>
    </div>
</body>
</html>
`;
};

const generateRequestAcceptanceTemplate = (teacherName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Accepted</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Request Accepted</h1>
        <p>Hello,</p>
        <p>Your request has been accepted by ${teacherName}.</p>
        <p>Best regards,<br>CapTrak Team</p>
    </div>
</body>
</html>
`;
};

const generateRequestRejectionTemplate = (teacherName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Rejected</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Request Rejected</h1>
        <p>Hello,</p>
        <p>Your request has been rejected by ${teacherName}.</p>
        <p>Best regards,<br>CapTrak Team</p>
    </div>
</body>
</html>
`;
};

export {
  generateForgotPasswordEmailTemplate,
  generateRequestAcceptanceTemplate,
  generateRequestRejectionTemplate,
};

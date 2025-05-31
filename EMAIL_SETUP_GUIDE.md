# Email Service Setup Guide

This guide will help you set up EmailJS to send actual invitation emails instead of just copying links to clipboard.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Create an Email Service

1. In your EmailJS dashboard, click "Add New Service"
2. Choose your email provider:
   - **Gmail**: Easiest option if you have a Gmail account
   - **Outlook**: If you use Microsoft email
   - **Yahoo**: If you use Yahoo email
   - **Custom SMTP**: For other email providers

3. Follow the setup instructions for your chosen provider
4. **Important**: Copy the **Service ID** (it will look like `service_xxxxxxx`)

## Step 3: Create an Email Template

1. In EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Use this template content:

### Template Settings:
- **Template Name**: Team Invitation
- **Template ID**: `template_team_invite` (or copy the generated ID)

### Template Content:
```
Subject: You're invited to join {{project_name}} on InkCode!

Hi {{to_name}},

{{from_name}} has invited you to collaborate on the project "{{project_name}}" on InkCode!

**Your Role**: {{role}}

{{message}}

**Join the team now:**
{{invite_link}}

This invitation will expire in 7 days. If you have any questions, please contact {{from_name}}.

Best regards,
The InkCode Team
```

### Template Variables (make sure these are defined):
- `to_name`
- `to_email`
- `from_name`
- `project_name`
- `role`
- `message`
- `invite_link`

4. Save the template and copy the **Template ID**

## Step 4: Get Your Public Key

1. In EmailJS dashboard, go to "Account" > "General"
2. Find your **Public Key** (it will look like a random string)
3. Copy this key

## Step 5: Configure Environment Variables (Recommended)

**Option A: Using Environment Variables (Secure)**
1. Copy `.env.example` to `.env` in the frontend folder
2. Replace the placeholder values with your actual EmailJS credentials:

```bash
# .env file
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

**Option B: Direct Configuration (Quick Setup)**
1. Open the file: `src/services/emailService.js`
2. Replace the configuration values:

```javascript
const EMAIL_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID_HERE',      // From Step 2
    templateId: 'YOUR_TEMPLATE_ID_HERE',    // From Step 3
    publicKey: 'YOUR_PUBLIC_KEY_HERE'       // From Step 4
};
```

**Note**: Option A is recommended for security as it keeps your credentials out of the code.

## Step 6: Test the Email System

1. Save the changes and restart your development server
2. Try inviting a team member with a real email address
3. Check if the email is received (also check spam folder)

## Troubleshooting

### Common Issues:

1. **Emails not being sent**
   - Check that all IDs and keys are correct
   - Verify your email service is properly connected in EmailJS
   - Check the browser console for error messages

2. **Emails going to spam**
   - This is normal for new EmailJS accounts
   - Ask recipients to check their spam folder
   - Consider upgrading to a paid EmailJS plan for better deliverability

3. **Gmail not working**
   - Make sure 2-factor authentication is enabled
   - Use an App Password instead of your regular password
   - Check Gmail's "Less secure app access" settings

4. **Template variables not working**
   - Ensure all variable names in the template match exactly
   - Double-check the template ID is correct

### Fallback Behavior:

If EmailJS is not configured or fails, the system will automatically fall back to copying the invitation link to your clipboard. You can then manually send this link to the team member via any messaging platform.

## Free Plan Limitations

EmailJS free plan includes:
- 200 emails per month
- EmailJS branding in emails
- Basic email templates

For production use, consider upgrading to a paid plan for:
- More emails per month
- Remove EmailJS branding
- Priority support
- Better deliverability

## Security Notes

- Never commit your EmailJS keys to public repositories
- Consider using environment variables for production
- The current setup is suitable for development and small teams
- For large-scale production, consider using a backend email service

## Alternative Email Services

If you prefer a different email service, you can modify `src/services/emailService.js` to use:
- SendGrid
- AWS SES
- Mailgun
- Nodemailer (requires backend)

The current implementation can be easily adapted to work with any email service.

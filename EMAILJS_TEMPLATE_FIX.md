# 🚨 URGENT FIX: EmailJS Template Configuration

## Problem
Your emails are going to `mehtavrushalvm@gmail.com` instead of the intended recipient because your EmailJS template is configured with a hardcoded email address.

## Solution: Fix Your EmailJS Template

### Step 1: Access EmailJS Dashboard
1. Go to https://dashboard.emailjs.com
2. Login to your account
3. Click on **"Email Templates"**

### Step 2: Edit Your Template
1. Find template with ID: `template_bckhnet`
2. Click **"Edit"** button

### Step 3: Fix the "To Email" Field
**❌ WRONG (Current Setup):**
```
To Email: mehtavrushalvm@gmail.com
```

**✅ CORRECT (What You Need):**
```
To Email: {{to_email}}
```

### Step 4: Complete Template Configuration

**Template Settings:**
- **Template Name**: Team Invitation
- **Template ID**: `template_bckhnet`
- **To Email**: `{{to_email}}` ← **CRITICAL FIX**
- **From Name**: `{{from_name}}`
- **Subject**: `You're invited to join {{project_name}} on InkCode!`

**Template Content:**
```
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

### Step 5: Variable Mapping
Make sure these variables are defined in your template:
- `{{to_email}}` - Recipient email address
- `{{to_name}}` - Recipient name
- `{{from_name}}` - Sender name
- `{{project_name}}` - Project name
- `{{role}}` - User role (member/admin)
- `{{message}}` - Invitation message
- `{{invite_link}}` - Join link

### Step 6: Save and Test
1. Click **"Save"** in EmailJS dashboard
2. Test by sending an invitation to a different email address
3. Check that the email goes to the correct recipient

## Quick Test
After fixing the template:
1. Go to your InkCode dashboard
2. Open a project's team manager
3. Invite someone with a different email address
4. Verify the email goes to the correct recipient

## Additional Notes
- The issue is NOT in your code - the code is correctly passing `to_email: toEmail`
- The issue is in the EmailJS template configuration
- Once you fix the template, all invitations will go to the correct recipients
- You may want to delete any test invitations sent to the wrong email

## Common Mistakes to Avoid
1. **Don't hardcode email addresses** in the "To Email" field
2. **Always use `{{to_email}}`** for dynamic recipients
3. **Test with different email addresses** to verify it works
4. **Check spam folders** when testing

After making this change, your team invitation system will work correctly and send emails to the intended recipients!

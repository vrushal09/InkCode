# Simple EmailJS Template (Text Version)

If you prefer a simpler text-based template or if HTML emails aren't working, use this plain text version:

## Template Settings:
- **To Email**: `{{to_email}}`
- **From Name**: `{{from_name}} (InkCode Team)`
- **Subject**: `You're invited to join "{{project_name}}" on InkCode!`
- **Reply To**: `{{reply_to}}`

## Template Content (Plain Text):

```
Hi {{to_name}}!

🎉 Great news! {{from_name}} has invited you to collaborate on their project "{{project_name}}" on InkCode.

📋 PROJECT DETAILS:
• Project Name: {{project_name}}
• Your Role: {{role}}
• Invited by: {{from_name}}

💬 MESSAGE FROM {{from_name}}:
{{message}}

🚀 JOIN YOUR TEAM:
Click this link to accept the invitation and start coding together:
{{invite_link}}

⏰ IMPORTANT: This invitation expires in 7 days, so make sure to join soon!

❓ WHAT IS INKCODE?
InkCode is a collaborative code editor that lets teams code together in real-time. You'll be able to:
• Write and edit code with your team
• Chat with team members
• See changes instantly
• Code from any device

🔗 CAN'T CLICK THE LINK?
Copy and paste this URL into your browser:
{{invite_link}}

If you have any questions, feel free to reach out to {{from_name}} who sent you this invitation.

Happy coding!
The InkCode Team

---
This email was sent because {{from_name}} invited you to join their project on InkCode.
```

## Quick Setup Steps:

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com
2. **Edit your template** (`template_bckhnet`)
3. **Set "To Email" to**: `{{to_email}}`
4. **Copy the text above** into the content area
5. **Save the template**
6. **Test with a real email address**

## Why Use Text Version?

- ✅ Better deliverability (less likely to be marked as spam)
- ✅ Works with all email clients
- ✅ Faster loading
- ✅ Accessible to screen readers
- ✅ Professional appearance

## Choose Your Version:

1. **HTML Version**: More visually appealing, modern design
2. **Text Version**: Better compatibility, higher deliverability

You can start with the text version to ensure emails are being delivered correctly, then switch to HTML later if needed.

# Complete EmailJS Template Configuration

## Template Settings (Critical Configuration)

### Basic Information:
- **Template Name**: `InkCode Team Invitation`
- **Template ID**: `template_bckhnet` (use your existing ID)

### Email Configuration:
- **To Email**: `{{to_email}}` ← **MOST IMPORTANT: This must be dynamic**
- **From Name**: `InkCode Team ({{from_name}})`
- **From Email**: Use your verified email address
- **Reply To**: `{{reply_to}}`
- **Subject**: `🚀 You're invited to join "{{project_name}}" on InkCode!`

## Complete Template HTML Content

Copy this EXACT content into your EmailJS template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InkCode Team Invitation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .project-info {
            background: #f8fafc;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .project-info h3 {
            margin: 0 0 10px;
            color: #1e293b;
            font-size: 18px;
        }
        .project-info p {
            margin: 0;
            color: #64748b;
        }
        .role-badge {
            display: inline-block;
            background: #ddd6fe;
            color: #7c3aed;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }
        .link-fallback {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            color: #475569;
            word-break: break-all;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 5px 0;
            color: #64748b;
            font-size: 14px;
        }
        .expiry-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        .feature {
            text-align: center;
            padding: 15px;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .feature h4 {
            margin: 0 0 5px;
            color: #1e293b;
            font-size: 14px;
        }
        .feature p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .content {
                padding: 25px 20px;
            }
            .features {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join your team on InkCode and start coding together</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Hi {{to_name}}! 👋</h2>
            
            <p><strong>{{from_name}}</strong> has invited you to collaborate on their project. You're about to join an awesome coding experience!</p>

            <!-- Project Information -->
            <div class="project-info">
                <h3>📁 Project: {{project_name}}</h3>
                <p>{{message}}</p>
                <div class="role-badge">Your Role: {{role}}</div>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{invite_link}}" class="cta-button">
                    🚀 Join Team Now
                </a>
            </div>

            <!-- Features -->
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">💻</div>
                    <h4>Real-time Collaboration</h4>
                    <p>Code together in real-time</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💬</div>
                    <h4>Team Chat</h4>
                    <p>Communicate with your team</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔄</div>
                    <h4>Live Sync</h4>
                    <p>See changes instantly</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h4>Any Device</h4>
                    <p>Code from anywhere</p>
                </div>
            </div>

            <!-- Expiry Warning -->
            <div class="expiry-note">
                ⏰ <strong>Important:</strong> This invitation expires in 7 days. Join soon!
            </div>

            <!-- Fallback Link -->
            <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <div class="link-fallback">
                {{invite_link}}
            </div>

            <p>If you have any questions, feel free to reach out to <strong>{{from_name}}</strong> who sent you this invitation.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>InkCode</strong> - Collaborative Code Editor</p>
            <p>Happy coding! 🎯</p>
            <p style="font-size: 12px; color: #94a3b8;">
                This email was sent because {{from_name}} invited you to join their project.
            </p>
        </div>
    </div>
</body>
</html>
```

## Variable Mapping

Make sure these variables are properly mapped in your EmailJS template:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient email | `user@example.com` |
| `{{to_name}}` | Recipient name | `john.doe` |
| `{{from_name}}` | Sender name | `Jane Smith` |
| `{{project_name}}` | Project name | `My Awesome Project` |
| `{{role}}` | User role | `member` or `admin` |
| `{{message}}` | Invitation message | Custom message |
| `{{invite_link}}` | Join link | `https://yourapp.com/join-team?token=...` |
| `{{reply_to}}` | Reply-to email | `user@example.com` |

## Step-by-Step Setup

### 1. Login to EmailJS Dashboard
Go to: https://dashboard.emailjs.com

### 2. Edit Your Template
- Click "Email Templates"
- Find template ID: `template_bckhnet`
- Click "Edit"

### 3. Configure Template Settings
- **To Email**: `{{to_email}}` ← CRITICAL
- **From Name**: `InkCode Team ({{from_name}})`
- **Subject**: `🚀 You're invited to join "{{project_name}}" on InkCode!`
- **Reply To**: `{{reply_to}}`

### 4. Paste the HTML Content
Copy the entire HTML template above and paste it into the "Content" section.

### 5. Test Variables
Click "Test Template" and verify all variables are recognized.

### 6. Save Template
Click "Save" to apply changes.

## Testing Checklist

After setting up the template:

✅ **Template uses `{{to_email}}` variable**  
✅ **All variables are mapped correctly**  
✅ **Subject line includes project name**  
✅ **HTML renders properly in preview**  
✅ **Mobile-responsive design**  
✅ **Call-to-action button is prominent**  
✅ **Fallback link is provided**  
✅ **Professional appearance**

## Common Issues & Solutions

### Issue: Emails still go to wrong address
**Solution**: Double-check the "To Email" field is `{{to_email}}`, not a hardcoded email.

### Issue: Variables not working
**Solution**: Ensure variable names match exactly (case-sensitive).

### Issue: HTML not rendering
**Solution**: Make sure you're using the "HTML" content type, not plain text.

### Issue: Button not clickable
**Solution**: Verify the `{{invite_link}}` variable is properly formatted.

## Pro Tips

1. **Test with different email providers** (Gmail, Outlook, Yahoo)
2. **Check spam folders** during testing
3. **Use a professional from email** for better deliverability
4. **Keep subject line under 50 characters** for mobile
5. **Include both button and text link** for accessibility

This template is designed to be professional, mobile-friendly, and highly effective for team invitations!

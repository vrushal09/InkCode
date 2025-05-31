import emailjs from '@emailjs/browser';

// EmailJS configuration - uses environment variables for security
// In Vite, environment variables must be prefixed with VITE_ and accessed via import.meta.env
const EMAIL_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_yshmkbo',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_bdmkzjm', 
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'ki9V1m-StmNDUywfH'
};

// Initialize EmailJS
emailjs.init(EMAIL_CONFIG.publicKey);

/**
 * Send team invitation email
 * @param {string} toEmail - Recipient email address
 * @param {string} inviterName - Name of the person sending the invitation
 * @param {string} projectName - Name of the project
 * @param {string} inviteLink - Join link for the team
 * @param {string} role - Role being assigned (admin, member)
 */
export const sendTeamInvitationEmail = async (toEmail, inviterName, projectName, inviteLink, role = 'member') => {
    try {
        const templateParams = {
            to_email: toEmail,
            to_name: toEmail.split('@')[0], // Use email username as name
            from_name: inviterName,
            project_name: projectName,
            invite_link: inviteLink,
            role: role,
            message: `You've been invited to join the "${projectName}" project as a ${role}. Click the link below to accept the invitation and start collaborating!`,
            reply_to: toEmail // This helps with deliverability
        };        console.log('📧 Sending email with params:', {
            serviceId: EMAIL_CONFIG.serviceId,
            templateId: EMAIL_CONFIG.templateId,
            toEmail: toEmail,
            fromName: inviterName,
            projectName: projectName
        });

        console.log('📧 Template parameters being sent:', templateParams);

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templateId,
            templateParams
        );

        console.log('EmailJS response:', response);
        console.log('Email sent to:', toEmail, 'Status:', response.status, 'Text:', response.text);
        
        return { 
            success: true, 
            response,
            deliveryInfo: {
                status: response.status,
                statusText: response.text,
                recipient: toEmail,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Failed to send email:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            text: error.text
        });
        return { success: false, error };
    }
};

/**
 * Fallback method - copies invite link to clipboard and shows instructions
 */
export const fallbackInviteMethod = async (inviteLink, email) => {
    try {
        await navigator.clipboard.writeText(inviteLink);
        return {
            success: true,
            message: `Invitation link copied to clipboard! Please send this link to ${email}:\n\n${inviteLink}`
        };
    } catch (error) {
        return {
            success: false,
            message: `Please copy this invitation link and send it to ${email}:\n\n${inviteLink}`
        };
    }
};

/**
 * Send invitation with email service fallback
 */
export const sendInvitation = async (toEmail, inviterName, projectName, inviteLink, role = 'member') => {
    // Check if EmailJS is properly configured
    const isConfigured = EMAIL_CONFIG.serviceId !== 'service_inkcode' && 
                         EMAIL_CONFIG.templateId !== 'template_team_invite' && 
                         EMAIL_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
                         EMAIL_CONFIG.publicKey.length > 10;
    
    if (!isConfigured) {
        console.log('EmailJS not configured, using fallback method');
        const fallbackResult = await fallbackInviteMethod(inviteLink, toEmail);
        return {
            ...fallbackResult,
            message: fallbackResult.success ? 
                `📋 ${fallbackResult.message}\n\n💡 To send emails automatically, configure EmailJS using the EMAIL_SETUP_GUIDE.md` :
                fallbackResult.message
        };
    }

    // Try to send email first
    const emailResult = await sendTeamInvitationEmail(toEmail, inviterName, projectName, inviteLink, role);
    
    if (emailResult.success) {
        return {
            success: true,
            message: `📧 Invitation email sent successfully to ${toEmail}!`
        };
    } else {
        // Fallback to clipboard if email fails
        console.log('Email failed, falling back to clipboard');
        const fallbackResult = await fallbackInviteMethod(inviteLink, toEmail);
        return {
            ...fallbackResult,
            message: fallbackResult.success ?
                `⚠️ Email failed, but invitation link copied to clipboard! Please send this link to ${toEmail}:\n\n${inviteLink}` :
                `❌ Email failed and clipboard copy failed. Please manually copy this link and send to ${toEmail}:\n\n${inviteLink}`
        };
    }
};

// Simple email service - deployment safe
interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  text?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: any
}

// Email templates
export const emailTemplates = {
  welcome: (options: { name: string; email: string; password?: string }) => ({
    subject: "Welcome to Asset Tracking System",
    html: `
      <!DOCTYPE html>
      <html>
      <head><title>Welcome to Asset Tracking System</title></head>
      <body>
        <h1>Welcome, ${options.name}!</h1>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${options.email}</p>
        ${options.password ? `<p><strong>Password:</strong> ${options.password}</p>` : ""}
        <p>Please login using the credentials provided.</p>
      </body>
      </html>
    `,
  }),

  accountSetup: (options: { name: string; setupLink: string; tempPassword?: string }) => ({
    subject: "Complete Your Account Setup - Asset Tracking System",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete Your Account Setup</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Asset Tracking System!</h1>
            <p>Hello ${options.name},</p>
          </div>
          
          <p>Your account request has been approved! Please set up your password:</p>
          <a href="${options.setupLink}" class="button">Complete Account Setup</a>
          
          ${
            options.tempPassword
              ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3>Temporary Access</h3>
            <p><strong>Temporary Password:</strong> ${options.tempPassword}</p>
          </div>
          `
              : ""
          }
          
          <p>This setup link will expire in 7 days.</p>
          <p>Best regards,<br>Asset Tracking System Team</p>
        </div>
      </body>
      </html>
    `,
  }),

  accountRequest: (options: {
    adminName: string
    requesterName: string
    requesterEmail: string
    department: string
    jobTitle: string
    reason: string
  }) => ({
    subject: "New Account Request - Asset Tracking System",
    html: `
      <!DOCTYPE html>
      <html>
      <head><title>New Account Request</title></head>
      <body>
        <h1>Hello, ${options.adminName}</h1>
        <p>A new account request has been submitted:</p>
        
        <h2>Request Details:</h2>
        <p><strong>Name:</strong> ${options.requesterName}</p>
        <p><strong>Email:</strong> ${options.requesterEmail}</p>
        <p><strong>Department:</strong> ${options.department}</p>
        <p><strong>Job Title:</strong> ${options.jobTitle}</p>
        <p><strong>Reason:</strong> ${options.reason}</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/users">Review Account Requests</a></p>
      </body>
      </html>
    `,
  }),
}

// Client-safe email service
export class EmailService {
  static async sendTestEmail(to: string): Promise<EmailResult> {
    // Always use API route for email sending
    try {
      const response = await fetch("/api/email/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      })

      const result = await response.json()
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  static async sendAccountSetupEmail(
    user: { name: string; email: string; id: string },
    tempPassword?: string,
  ): Promise<EmailResult> {
    const setupLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/setup-account?token=setup-${user.id}`

    const template = emailTemplates.accountSetup({
      name: user.name,
      setupLink,
      tempPassword,
    })

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: template.subject,
          html: template.html,
        }),
      })

      return await response.json()
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async sendAccountRequestNotification(
    admin: { name: string; email: string },
    request: {
      firstName: string
      lastName: string
      email: string
      department: string
      jobTitle: string
      reason: string
    },
  ): Promise<EmailResult> {
    const template = emailTemplates.accountRequest({
      adminName: admin.name,
      requesterName: `${request.firstName} ${request.lastName}`,
      requesterEmail: request.email,
      department: request.department,
      jobTitle: request.jobTitle,
      reason: request.reason,
    })

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: admin.email,
          subject: template.subject,
          html: template.html,
        }),
      })

      return await response.json()
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export default EmailService

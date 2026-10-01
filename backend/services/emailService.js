// =============================================
// Email Service - Resend integration
// =============================================

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'mindfuturetech@gmail.com';

// =============================================
// 1. Email to the OWNER (you) - notification
// =============================================
async function sendOwnerNotification({ firstName, lastName, email, phone, position, message }) {
  const isApplication = position && position.trim() !== '';

  const subject = isApplication
    ? `New Application: ${position} - ${firstName} ${lastName}`
    : `New Contact Message - ${firstName} ${lastName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:30px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0b1a2f, #1a2f44); padding: 24px 30px;">
                    <h1 style="color:#ffffff; margin:0; font-size: 20px;">
                      ${isApplication ? '📥 New Job Application' : '📥 New Contact Message'}
                    </h1>
                    <p style="color:#cbd5e1; margin:6px 0 0; font-size: 13px;">via Mindfuturetech website</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      
                      ${isApplication ? `
                      <tr>
                        <td style="padding: 10px 0; color:#64748b; font-size:13px; width: 140px; vertical-align: top;">Position</td>
                        <td style="padding: 10px 0; color:#0b1a2f; font-size:15px; font-weight:600;">${position}</td>
                      </tr>` : ''}

                      <tr>
                        <td style="padding: 10px 0; color:#64748b; font-size:13px; width: 140px; vertical-align: top;">Name</td>
                        <td style="padding: 10px 0; color:#0b1a2f; font-size:15px; font-weight:600;">${firstName} ${lastName}</td>
                      </tr>

                      <tr>
                        <td style="padding: 10px 0; color:#64748b; font-size:13px; vertical-align: top;">Email</td>
                        <td style="padding: 10px 0; color:#0b1a2f; font-size:15px;">
                          <a href="mailto:${email}" style="color:#2563eb; text-decoration:none;">${email}</a>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 10px 0; color:#64748b; font-size:13px; vertical-align: top;">Phone</td>
                        <td style="padding: 10px 0; color:#0b1a2f; font-size:15px;">${phone || '(not provided)'}</td>
                      </tr>

                      <tr>
                        <td style="padding: 10px 0; color:#64748b; font-size:13px; vertical-align: top;">Remark</td>
                        <td style="padding: 10px 0; color:#0b1a2f; font-size:15px; line-height: 1.6;">
                          ${message.replace(/\n/g, '<br>')}
                        </td>
                      </tr>

                    </table>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
                      Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: `Mindfuturetech <${FROM_EMAIL}>`,
    to: [OWNER_EMAIL],
    replyTo: email,
    subject,
    html
  });

  if (error) {
    console.error('Resend error (owner notification):', error);
    throw new Error(error.message || 'Failed to send owner notification');
  }

  return data;
}

// =============================================
// 2. Thank-you email to the USER
// =============================================
async function sendUserThankYou({ firstName, email, position }) {
  const isApplication = position && position.trim() !== '';

  const subject = isApplication
    ? `Thank you for applying at Mindfuturetech`
    : `Thank you for contacting Mindfuturetech`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:30px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0b1a2f, #1a2f44); padding: 30px; text-align: center;">
                    <h1 style="color:#ffffff; margin:0; font-size: 22px;">Mindfuturetech</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 36px 30px;">
                    <h2 style="color: #0b1a2f; margin: 0 0 16px; font-size: 22px;">
                      Hi ${firstName},
                    </h2>

                    ${isApplication ? `
                      <p style="color:#475569; font-size:15px; line-height:1.7; margin: 0 0 14px;">
                        Thank you for applying for the <strong style="color:#0b1a2f;">${position}</strong> position at Mindfuturetech.
                      </p>
                    ` : `
                      <p style="color:#475569; font-size:15px; line-height:1.7; margin: 0 0 14px;">
                        Thank you for reaching out to Mindfuturetech.
                      </p>
                    `}

                    <p style="color:#475569; font-size:15px; line-height:1.7; margin: 0 0 14px;">
                      We've received your message and our team will review it carefully.
                      We'll get back to you within <strong style="color:#0b1a2f;">24 hours</strong>.
                    </p>

                    <p style="color:#475569; font-size:15px; line-height:1.7; margin: 0 0 24px;">
                      In the meantime, feel free to explore more about what we do at Mindfuturetech.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://mindfuturetech.com" style="display:inline-block; padding: 14px 32px; background: #5b7fa6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        Visit Our Website
                      </a>
                    </div>

                    <p style="color:#64748b; font-size:14px; line-height:1.6; margin: 24px 0 0;">
                      Best regards,<br>
                      <strong style="color:#0b1a2f;">Team Mindfuturetech</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color:#94a3b8; font-size: 12px; margin: 0 0 6px;">
                      Mindfuturetech · Pune, Maharashtra, India
                    </p>
                    <p style="color:#94a3b8; font-size: 12px; margin: 0;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { data, error } = await resend.emails.send({
    from: `Mindfuturetech <${FROM_EMAIL}>`,
    to: [email],
    subject,
    html
  });

  if (error) {
    console.error('Resend error (user thank-you):', error);
    throw new Error(error.message || 'Failed to send user email');
  }

  return data;
}

module.exports = {
  sendOwnerNotification,
  sendUserThankYou
};
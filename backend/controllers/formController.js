// =============================================
// Controller: Form (unified)
// Sends two emails via Resend:
// 1. Notification to OWNER
// 2. Thank-you to USER
// =============================================

const {
  sendOwnerNotification,
  sendUserThankYou
} = require('../services/emailService');

const handleSubmit = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, message } = req.body;

    // ---- Validate ----
    const errors = [];

    if (!firstName || firstName.trim() === '') errors.push('First name is required');
    if (!lastName || lastName.trim() === '') errors.push('Last name is required');
    if (!email || email.trim() === '') errors.push('Email is required');
    if (!message || message.trim() === '') errors.push('Remark is required');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const isJobApplication = position && position.trim() !== '';

    console.log(`\n📥 New ${isJobApplication ? 'JOB APPLICATION' : 'CONTACT MESSAGE'}:`);
    console.log('----------------------------------------');
    console.log('Name     :', `${firstName} ${lastName}`);
    console.log('Email    :', email);
    console.log('Phone    :', phone || '(not provided)');
    if (isJobApplication) console.log('Position :', position);
    console.log('Remark   :', message);
    console.log('----------------------------------------\n');

    // ---- Send emails via Resend ----
    const emailResults = {
      ownerEmailSent: false,
      userEmailSent: false,
      errors: []
    };

    // 1. Notify the OWNER
    try {
      await sendOwnerNotification({ firstName, lastName, email, phone, position, message });
      emailResults.ownerEmailSent = true;
      console.log('✅ Owner notification email sent');
    } catch (err) {
      console.error('❌ Owner notification failed:', err.message);
      emailResults.errors.push('owner: ' + err.message);
    }

    // 2. Send THANK YOU to the USER
    try {
      await sendUserThankYou({ firstName, email, position });
      emailResults.userEmailSent = true;
      console.log('✅ User thank-you email sent');
    } catch (err) {
      console.error('❌ User thank-you failed:', err.message);
      emailResults.errors.push('user: ' + err.message);
    }

    console.log('\n');

    // ---- Response ----
    // Even if one email fails, we still tell the user success
    // (since their form was received). We log errors on our side.
    return res.status(200).json({
      success: true,
      type: isJobApplication ? 'application' : 'contact',
      message: isJobApplication
        ? 'Application received successfully'
        : 'Message received successfully',
      data: {
        firstName,
        lastName,
        email,
        position: position || null,
        emailsSent: emailResults,
        receivedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in formController:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while processing your request'
    });
  }
};

module.exports = { handleSubmit };
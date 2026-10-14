const chatbotService = require("../services/chatBotService");
const {
  sendOwnerNotification,
  sendUserThankYou,
} = require("../services/emailService");

/*
POST /api/v1/chatbot/leads
{ name, query, countryCode, mobile, email, pageUrl?, source? }

201 { success: true, message, data: { id } }
400 { success: false, message, errors: { field: "reason" } }

on success, send email to owner and user (if email provided)
*/
const createLead = async (req, res, next) => {
  try {
    const { name, query, countryCode, mobile, email, pageUrl, source } =
      req.body || {};

    const lead = await chatbotService.createLead(
      { name, query, countryCode, mobile, email },
      {
        pageUrl,
        source,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
    );

    // If the lead is a duplicate, we still return success but do not send emails
    if (lead.duplicate) {
      return res.status(200).json({
        success: true,
        message: "Details received. Our team will contact you soon.",
        data: { id: lead.id },
      });
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    const message = query;
    const phone = mobile ? `${countryCode}${mobile}` : "";

    // ---- Send emails via Resend ---- Received request by Mindi-Bot
    const emailResults = {
      ownerEmailSent: false,
      userEmailSent: false,
      errors: [],
    };

    // 1. Notify the OWNER
    try {
      await sendOwnerNotification({
        firstName,
        lastName,
        email,
        phone,
        position: "",
        message,
      });
      emailResults.ownerEmailSent = true;
      console.log("✅ Owner notification email sent");
    } catch (err) {
      console.error("❌ Owner notification failed:", err.message);
      emailResults.errors.push("owner: " + err.message);
    }

    // 2. Send THANK YOU to the USER
    try {
      await sendUserThankYou({ firstName, email, position: "" });
      emailResults.userEmailSent = true;
      console.log("✅ User thank-you email sent");
    } catch (err) {
      console.error("❌ User thank-you failed:", err.message);
      emailResults.errors.push("user: " + err.message);
    }

    console.log("\n");
    
    return res.status(201).json({
      success: true,
      message: "Details received. Our team will contact you soon.",
      data: { id: lead.id },
    });
  } catch (error) {
    if (error.name === "ValidationError" && error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.details,
      });
    }

    next(error);
  }
};

module.exports = {
  createLead,
};

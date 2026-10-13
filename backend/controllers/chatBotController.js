const chatbotService = require("../services/chatBotService");

/*
POST /api/v1/chatbot/leads
{ name, query, countryCode, mobile, email, pageUrl?, source? }

201 { success: true, message, data: { id } }
400 { success: false, message, errors: { field: "reason" } }
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

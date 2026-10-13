const ChatLead = require("../models/ChatLead");

/*
Business logic for the website chatbot.
No Express objects in here (req / res), so it can be reused and tested alone.
*/

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

/* ---------------------------------------------------
   cleaning
--------------------------------------------------- */

// single line: control characters and repeated spaces collapse to one space
const cleanLine = (value, max) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

// multi line: keep line breaks, drop other control characters
const cleanText = (value, max) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);

/* ---------------------------------------------------
   validation
   Returns the cleaned values, or throws ValidationError
   listing every field that is wrong.
--------------------------------------------------- */
const validateLead = (input = {}) => {
  const errors = {};

  const name = cleanLine(input.name, 80);
  if (name.length < 2 || !/\p{L}/u.test(name)) {
    errors.name = "Name must have at least 2 letters";
  }

  const query = cleanText(input.query, 1000);
  if (query.length < 5) {
    errors.query = "Query must be at least 5 characters";
  }

  const countryCode = String(input.countryCode ?? "").replace(/\s+/g, "");
  let number = String(input.mobile ?? "").replace(/[\s\-().]/g, "");

  if (!/^\+[1-9]\d{0,3}$/.test(countryCode)) {
    errors.countryCode = "Country code must look like +91";
  } else if (!/^\d+$/.test(number)) {
    errors.mobile = "Mobile number must contain digits only";
  } else {
    if (countryCode === "+91") {
      if (number.length === 11 && number.startsWith("0")) {
        number = number.slice(1);
      }
      if (!/^[6-9]\d{9}$/.test(number)) {
        errors.mobile = "Enter a valid 10-digit Indian mobile number";
      }
    } else if (
      number.length < 6 ||
      number.length > 14 ||
      countryCode.length - 1 + number.length > 15
    ) {
      errors.mobile = "Mobile number length is not valid";
    }
  }

  const email = cleanLine(input.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (Object.keys(errors).length) {
    throw new ValidationError(Object.values(errors)[0], errors);
  }

  return {
    name,
    query,
    countryCode,
    mobile: `${countryCode}${number}`,
    email,
  };
};

/* ---------------------------------------------------
   create
   `meta` is context from the request: { ip, userAgent, pageUrl, source }
--------------------------------------------------- */
const createLead = async (input, meta = {}) => {
  const lead = validateLead(input);

  // The same person pressing send twice, or the widget retrying after a
  // slow network, should not create two rows.
  const existing = await ChatLead.findOne({
    email: lead.email,
    mobile: lead.mobile,
    query: lead.query,
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  }).select("_id createdAt");

  if (existing) {
    return {
      id: existing._id.toString(),
      createdAt: existing.createdAt,
      duplicate: true,
    };
  }

  const saved = await ChatLead.create({
    ...lead,
    source: cleanLine(meta.source || "website-chatbot", 50),
    pageUrl: cleanLine(meta.pageUrl, 500),
    ip: cleanLine(meta.ip, 64),
    userAgent: cleanLine(meta.userAgent, 300),
  });

  return {
    id: saved._id.toString(),
    createdAt: saved.createdAt,
    duplicate: false,
  };
};

module.exports = {
  createLead,
  validateLead,
  ValidationError,
};

const mongoose = require("mongoose");

/*
One document = one person who finished the website chatbot.
*/
const chatLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    query: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },

    // "+91"
    countryCode: {
      type: String,
      required: true,
      trim: true,
      match: /^\+[1-9]\d{0,3}$/,
    },

    // full international number, e.g. "+919876543210"
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: /^\+[1-9]\d{6,14}$/,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },

    // where the team is in following this lead up
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CLOSED"],
      default: "NEW",
      index: true,
    },

    source: {
      type: String,
      default: "website-chatbot",
      trim: true,
      maxlength: 50,
    },

    // context captured automatically
    pageUrl: { type: String, default: "", maxlength: 500 },
    ip: { type: String, default: "", maxlength: 64 },
    userAgent: { type: String, default: "", maxlength: 300 },
  },
  {
    timestamps: true,
  },
);

chatLeadSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ChatLead", chatLeadSchema);

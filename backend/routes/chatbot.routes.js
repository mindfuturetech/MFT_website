const express = require("express");

const { createLead } = require("../controllers/chatBotController");

const router = express.Router();

/*
Mounted in app.js as:
  app.use("/api/v1/chatbot", require("./routes/chatbot.routes"));

Public (visitors are not logged in).
Add rate limiting here before going live, for example:
  const rateLimit = require("express-rate-limit");
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
  router.post("/leads", limiter, createLead);
*/
router.post("/leads", createLead);

module.exports = router;

// =============================================
// Routes: Form (unified for apply-job + contact)
// =============================================

const express = require('express');
const router = express.Router();

const { handleSubmit } = require('../controllers/formController');

router.post('/submit', handleSubmit);

module.exports = router;
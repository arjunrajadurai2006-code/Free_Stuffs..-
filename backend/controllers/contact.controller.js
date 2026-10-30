const db = require('../config/db');

async function handleContactForm(req, res, next) {
  try {
    const { name, email, subject, message, department } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, valid email address, and message are required.'
      });
    }

    if (!email.includes('@') || email.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Persist contact message to database
    await db.query(
      `INSERT INTO contact_messages (name, email, department, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        department || 'General',
        subject ? subject.trim() : 'Customer Concierge Inquiry',
        message.trim()
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting NEST & NOVA. Your message has been received, and our concierge team will respond within 24 hours.'
    });
  } catch (error) {
    next(error);
  }
}

async function handleNewsletter(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@') || email.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    try {
      await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email.toLowerCase().trim()]);
    } catch (e) {
      // Ignore duplicate subscriber entry safely
    }

    return res.json({
      success: true,
      message: 'Welcome to the Nest & Nova circle. Your exclusive 10% welcome coupon code is WELCOME10.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleContactForm,
  handleNewsletter
};

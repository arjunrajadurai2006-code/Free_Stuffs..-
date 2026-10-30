const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'nest_and_nova_dev_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

async function register(req, res, next) {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, valid email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name.trim(), email.toLowerCase().trim(), password_hash, 'customer', phone || null]
    );

    const newUserId = result.insertId;
    const userPayload = {
      id: newUserId,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      role: 'customer',
      phone: phone || null
    };

    const token = generateToken(userPayload);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to NEST & NOVA!',
      token,
      user: {
        id: userPayload.id,
        full_name: userPayload.full_name,
        email: userPayload.email,
        role: userPayload.role,
        phone: userPayload.phone
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    const user = rows && rows.length > 0 ? rows[0] : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.clearCookie('token');
  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

async function getMe(req, res, next) {
  try {
    const [rows] = await db.query('SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    const [addresses] = await db.query('SELECT * FROM addresses WHERE user_id = ?', [user.id]);

    return res.json({
      success: true,
      user,
      addresses: addresses || []
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { full_name, phone } = req.body;
    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    await db.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [
      full_name.trim(),
      phone || null,
      req.user.id
    ]);

    return res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await db.query('SELECT id, full_name FROM users WHERE email = ?', [normalizedEmail]);

    if (rows && rows.length > 0) {
      const user = rows[0];
      // Generate cryptographic random token and 1-hour expiration
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [
        resetToken,
        expiresAt,
        user.id
      ]);
    }

    // Always return safe neutral message to prevent account enumeration
    return res.json({
      success: true,
      message: `If an account is associated with ${normalizedEmail}, password reset instructions have been dispatched.`
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const [rows] = await db.query('SELECT id, reset_token_expires FROM users WHERE reset_token = ?', [token]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has already been used.'
      });
    }

    const user = rows[0];
    const now = new Date();
    if (user.reset_token_expires && now > new Date(user.reset_token_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired. Please request a new one.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    // Single-use token invalidation: clear reset_token and reset_token_expires
    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [newHash, user.id]
    );

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};

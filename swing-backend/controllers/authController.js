const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 3;
const OTP_LOCK_MINUTES = Number(process.env.OTP_LOCK_MINUTES) || 5;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const otpEmailBody = (code) =>
  `Your Swing verification code is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`;

// @route POST /api/auth/register
// @desc  Register a trainee or trainer, then send an OTP for verification.
//        (Admins are seeded separately — not created via public registration.)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    if (!['trainee', 'trainer'].includes(role)) {
      return res.status(400).json({ message: 'role must be either "trainee" or "trainer"' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      location,
      role,
      otpCode,
      otpExpires,
      otpAttempts: 0
    });

    await sendEmail({
      to: user.email,
      subject: 'Swing — Verify your account',
      text: otpEmailBody(otpCode)
    });

    res.status(201).json({
      message: 'Registration successful. An OTP has been sent to your email for verification.',
      userId: user._id,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @route POST /api/auth/verify-otp
// @desc  Verify the OTP code sent at registration (or resend).
//        3 wrong attempts -> locked for 5 minutes, then attempts reset.
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'email and otp are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+otpCode +otpExpires +otpAttempts +otpLockUntil'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account is already verified' });

    // Check lockout
    if (user.otpLockUntil && user.otpLockUntil > new Date()) {
      const secondsLeft = Math.ceil((user.otpLockUntil - new Date()) / 1000);
      return res.status(429).json({
        message: `Too many failed attempts. Please wait ${Math.ceil(
          secondsLeft / 60
        )} minute(s) and try registering the OTP again.`
      });
    }

    // If lock period has passed, attempts were already usable again
    if (user.otpLockUntil && user.otpLockUntil <= new Date()) {
      user.otpAttempts = 0;
      user.otpLockUntil = undefined;
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otpCode !== otp) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
        user.otpLockUntil = new Date(Date.now() + OTP_LOCK_MINUTES * 60 * 1000);
        user.otpAttempts = 0;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.status(429).json({
          message: `Incorrect OTP entered ${OTP_MAX_ATTEMPTS} times. Please wait ${OTP_LOCK_MINUTES} minutes, then register again to receive a new code.`
        });
      }

      await user.save();
      return res.status(400).json({
        message: `Incorrect OTP. ${OTP_MAX_ATTEMPTS - user.otpAttempts} attempt(s) remaining.`
      });
    }

    // Success
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();

    const token = signToken(user);
    res.json({
      message: 'Account verified successfully',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

// @route POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+otpLockUntil +otpAttempts'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account is already verified' });

    if (user.otpLockUntil && user.otpLockUntil > new Date()) {
      const secondsLeft = Math.ceil((user.otpLockUntil - new Date()) / 1000);
      return res.status(429).json({
        message: `Please wait ${Math.ceil(secondsLeft / 60)} minute(s) before requesting a new OTP.`
      });
    }

    const otpCode = generateOtp();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Swing — Your new verification code',
      text: otpEmailBody(otpCode)
    });

    res.json({ message: 'A new OTP has been sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP', error: err.message });
  }
};

// @route POST /api/auth/login
// @desc  Login for trainee, trainer, or admin. Each role only ever reaches
//        its own dashboard because the frontend routes on user.role and the
//        backend's roleCheck middleware blocks cross-role access to APIs.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Account not verified. Please verify your email with the OTP sent to you.'
      });
    }

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

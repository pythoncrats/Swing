const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByEmail,
  updateUserFields,
  matchPassword,
  toSafeUser
} = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const sendEmail = require('../utils/sendEmail');

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 3;
const OTP_LOCK_MINUTES = Number(process.env.OTP_LOCK_MINUTES) || 5;

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const otpEmailBody = (code) =>
  `Your Swing verification code is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`;

const addMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

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

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const otpCode = generateOtp();
    const otpExpires = addMinutes(OTP_EXPIRES_MINUTES);

    const user = await createUser({
      role,
      name,
      email,
      password,
      phone,
      location,
      otpCode,
      otpExpires
    });

    await sendEmail({
      to: user.email,
      subject: 'Swing — Verify your account',
      text: otpEmailBody(otpCode)
    });

    res.status(201).json({
      message: 'Registration successful. An OTP has been sent to your email for verification.',
      userId: user.id,
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

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.is_verified) return res.status(400).json({ message: 'Account is already verified' });

    const now = new Date();

    // Check lockout
    if (user.otp_lock_until && new Date(user.otp_lock_until) > now) {
      const secondsLeft = Math.ceil((new Date(user.otp_lock_until) - now) / 1000);
      return res.status(429).json({
        message: `Too many failed attempts. Please wait ${Math.ceil(
          secondsLeft / 60
        )} minute(s) and try registering the OTP again.`
      });
    }

    // If lock period has passed, reset attempts
    if (user.otp_lock_until && new Date(user.otp_lock_until) <= now) {
      await updateUserFields(user.id, { otp_attempts: 0, otp_lock_until: null });
      user.otp_attempts = 0;
    }

    if (!user.otp_code || !user.otp_expires || new Date(user.otp_expires) < now) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp_code !== otp) {
      const attempts = user.otp_attempts + 1;

      if (attempts >= OTP_MAX_ATTEMPTS) {
        await updateUserFields(user.id, {
          otp_attempts: 0,
          otp_lock_until: addMinutes(OTP_LOCK_MINUTES),
          otp_code: null,
          otp_expires: null
        });
        return res.status(429).json({
          message: `Incorrect OTP entered ${OTP_MAX_ATTEMPTS} times. Please wait ${OTP_LOCK_MINUTES} minutes, then register again to receive a new code.`
        });
      }

      await updateUserFields(user.id, { otp_attempts: attempts });
      return res.status(400).json({
        message: `Incorrect OTP. ${OTP_MAX_ATTEMPTS - attempts} attempt(s) remaining.`
      });
    }

    // Success
    const verifiedUser = await updateUserFields(user.id, {
      is_verified: true,
      otp_code: null,
      otp_expires: null,
      otp_attempts: 0,
      otp_lock_until: null
    });

    const token = signToken(verifiedUser);
    res.json({
      message: 'Account verified successfully',
      token,
      user: toSafeUser(verifiedUser)
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

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.is_verified) return res.status(400).json({ message: 'Account is already verified' });

    const now = new Date();
    if (user.otp_lock_until && new Date(user.otp_lock_until) > now) {
      const secondsLeft = Math.ceil((new Date(user.otp_lock_until) - now) / 1000);
      return res.status(429).json({
        message: `Please wait ${Math.ceil(secondsLeft / 60)} minute(s) before requesting a new OTP.`
      });
    }

    const otpCode = generateOtp();
    await updateUserFields(user.id, {
      otp_code: otpCode,
      otp_expires: addMinutes(OTP_EXPIRES_MINUTES),
      otp_attempts: 0,
      otp_lock_until: null
    });

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

    const user = await findUserByEmail(email);
    if (!user || !(await matchPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Account not verified. Please verify your email with the OTP sent to you.'
      });
    }

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: toSafeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: toSafeUser(req.user) });
};

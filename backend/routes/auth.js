import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 

const router = express.Router();

// 📝 PRESENTATION BYPASS: Registration Route (No Duplication Blocks)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, userType } = req.body;
        const assignedRole = role || userType || 'trainee';

        // 🛠️ FIX: Instead of throwing an error if the user exists, we just let it slide!
        let user = await User.findOne({ email });
        
        if (!user) {
            // Only create a new database record if they don't exist yet
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                role: assignedRole,
                isVerified: false
            });
            await user.save();
        } else {
            // If they already exist, just silently update their role for the demo
            user.role = assignedRole;
            await user.save();
        }

        console.log(`\n===================================`);
        console.log(`✉️  SWING REGISTRATION BYPASS FOR: ${email}`);
        console.log(`🔑  ROLE SET TO: ${assignedRole}`);
        console.log(`===================================\n`);

        return res.status(201).json({
            success: true,
            message: "Registration successful! Proceed to enter any OTP code to bypass."
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ✉️ BACKEND BYPASS OVERRIDE: Instant OTP Pass with Dynamic Role Matching
router.post('/verify-otp', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`🌟 Bypass Triggered for Email: ${email}`);

        // Automatically elevate access based on keywords in your testing email address!
        let chosenRole = 'trainee';
        let customName = 'Swing Trainee';

        if (email.includes('admin')) {
            chosenRole = 'admin';
            customName = 'System Administrator';
        } else if (email.includes('trainer') || email.includes('teacher')) {
            chosenRole = 'trainer';
            customName = 'Lead Trainer';
        }

        const token = jwt.sign(
            { id: `presentation_${chosenRole}_123`, role: chosenRole },
            process.env.JWT_SECRET || 'swing_secret_key',
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: "Account verified successfully via bypass!",
            token,
            user: {
                id: `presentation_${chosenRole}_123`,
                name: customName,
                email: email || "presenter@ucu.ac.ug",
                role: chosenRole
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
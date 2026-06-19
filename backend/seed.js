import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Trainee from './models/Trainee.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connecting to local database for seeding...");

        // Clean out any old test data
        await User.deleteMany({});
        await Trainee.deleteMany({});
        console.log("🧹 Cleared old data tables...");

        // 1. CREATE USERS
        const users = await User.insertMany([
            {
                name: "Alinda Brian",
                email: "trainee@swing.com",
                password: "password123",
                role: "trainee",
                isVerified: true
            },
            {
                name: "Luutu Joseph",
                email: "trainer@swing.com",
                password: "password123",
                role: "trainer",
                isVerified: true
            },
            {
                name: "Admin Sedrack",
                email: "admin@swing.com",
                password: "password123",
                role: "admin",
                isVerified: true
            }
        ]);
        console.log("👤 Created Presentation Users (Trainee, Trainer, Admin)");

        // 2. CREATE DETAILED TRAINEE PROFILE DATA (Perfectly Matching Schema)
        await Trainee.insertMany([
            {
                name: "Alinda Brian",
                phone: "+256700000000",
                trainingStatus: "assigned", // Using 'assigned' from your enum!
                assignedTrainer: users[1]._id,
                existingSkills: ["HTML", "CSS"],
                skillsOfInterest: ["Data Science", "Network Configuration"],
                jobRecommendations: [] // Empty array for now until admin recommends a Job ID
            }
        ]);

        console.log("📊 Injected Dashboard Profile Analytics successfully!");
        console.log("✨ Seeding complete! Press Ctrl + C to exit this script.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        process.exit(1);
    }
};

seedDatabase();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import traineeRoutes from './routes/trainee.js';
import trainerRoutes from './routes/trainer.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        
        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/trainee', traineeRoutes);
        app.use('/api/trainer', trainerRoutes);
        app.use('/api/admin', adminRoutes);
        
        app.get('/api/health', (req, res) => {
            res.json({ message: 'Swing API is running' });
        });

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer();
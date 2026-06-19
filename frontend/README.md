# Swing Frontend Application

Complete React-based frontend for the Swing training and job placement platform.

## Features

- Authentication with OTP verification
- Role-based dashboards (Trainee, Trainer, Administrator)
- State management with Zustand
- Light blue theme with Tailwind CSS
- API integration ready
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
- components/     Core UI components
- pages/          Page components
- store/          State management
- styles/         Global styles
- App.jsx         Main app component
- main.jsx        Entry point
```

## Technologies

- React 18
- React Router v6
- Zustand (State Management)
- Tailwind CSS
- Axios
- Lucide React Icons
- Vite

## Color Scheme (Light Blue)

- Primary: #00BCD4
- Dark: #006064
- Light: #E0F7FF
- Accent: #4DD0E1

## API Endpoints Expected

- POST   /api/auth/register
- POST   /api/auth/verify-otp
- POST   /api/auth/login
- GET    /api/auth/me
- GET    /api/trainee/{id}
- PUT    /api/trainee/{id}/profile
- GET    /api/trainer/{id}
- GET    /api/admin/trainees
- GET    /api/admin/trainers
- GET    /api/admin/jobs
- GET    /api/admin/organizations
- POST   /api/admin/assign-trainee
- POST   /api/admin/recommend-job
- POST   /api/admin/organizations

Author: Swing Development Team
Version: 1.0.0

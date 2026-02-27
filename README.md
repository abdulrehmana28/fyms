# FYMS CapTrak - Capstone Project Tracking System

A comprehensive full-stack web application designed to streamline the management and supervision of academic capstone projects. This system facilitates seamless interaction between administrators, teachers, and students throughout the project lifecycle.

## 🚀 Features

### Admin Dashboard

- **User Management**: Add, edit, and manage students and teachers
- **Project Overview**: Monitor all ongoing capstone projects with real-time statistics
- **Supervisor Assignment**: Assign and reassign supervisors to student projects
- **Deadline Management**: Create and manage project deadlines across all projects
- **Analytics Dashboard**: Visualize project data with interactive charts using Recharts
- **Bulk Operations**: Download project files and manage multiple projects efficiently

### Teacher Portal

- **Assigned Students**: View and manage all assigned students and their projects
- **Request Management**: Approve or reject supervisor requests from students
- **File Access**: Review and download student project submissions
- **Feedback System**: Provide detailed feedback on student projects
- **Notifications**: Receive real-time updates on student activities

### Student Portal

- **Project Submission**: Submit capstone project proposals and documents
- **File Upload**: Upload project files with progress tracking
- **Supervisor Request**: Request and manage supervisor assignments
- **Deadline Tracking**: View and track all project deadlines
- **Notifications**: Stay updated with feedback and important announcements
- **Feedback Access**: View feedback from supervisors and track progress

## 🛠️ Tech Stack

### Frontend

- **React** - Modern UI library with hooks
- **Redux Toolkit** - State management with Redux Persist
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization and analytics
- **Axios** - HTTP client for API requests
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications
- **Vite** - Fast build tool and dev server

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service integration
- **Express Rate Limit** - API rate limiting
- **Cookie Parser** - Cookie management
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
fyms-captrak-proto/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   │   └── modal/       # Modal components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   ├── teacher/     # Teacher portal pages
│   │   │   ├── student/     # Student portal pages
│   │   │   └── auth/        # Authentication pages
│   │   ├── store/           # Redux store and slices
│   │   ├── lib/             # Utility libraries
│   │   └── assets/          # Static assets
│   └── public/              # Public static files
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Custom middleware
│   │   └── utils/           # Helper functions
│   ├── config/              # Configuration files
│   ├── uploads/             # File upload directory
│   └── temp/                # Temporary files
│
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cookie
COOKIE_EXPIRE=7

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

4. Seed the database (optional):

```bash
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

### Admin Access

1. Login with admin credentials
2. Navigate to dashboard to view system statistics
3. Manage students and teachers from dedicated pages
4. Assign supervisors to student projects
5. Create and monitor project deadlines

### Teacher Access

1. Login with teacher credentials
2. View assigned students and their projects
3. Approve/reject supervisor requests
4. Provide feedback on student submissions
5. Download and review project files

### Student Access

1. Login with student credentials
2. Submit project proposals
3. Request supervisors
4. Upload project files
5. View feedback and track deadlines

## 🔐 Authentication & Security

- **JWT-based authentication** with httpOnly cookies
- **Role-based access control** (Admin, Teacher, Student)
- **Password hashing** using bcrypt
- **Rate limiting** to prevent API abuse
- **CORS configuration** for secure cross-origin requests
- **Input validation** and sanitization

## 📧 Email Notifications

The system sends automated email notifications for:

- Account creation and welcome messages
- Password reset requests
- Supervisor assignment confirmations
- Deadline reminders
- Project submission confirmations
- Feedback notifications

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Vercel/Heroku/Railway)

```bash
cd backend
# Configure vercel.json for Vercel deployment
vercel --prod
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Admin Routes

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/projects` - Get all projects
- `POST /api/admin/students` - Add new student
- `POST /api/admin/teachers` - Add new teacher

### Project Routes

- `POST /api/projects` - Create project
- `GET /api/projects` - Get user projects
- `PUT /api/projects/:id` - Update project
- `GET /api/projects/:id/files` - Download project files

### Notification Routes

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🤝 Contributing

This is an academic project. For any suggestions or improvements, please reach out to the project maintainer.

## 📝 License

This project is created for educational purposes.

## 🙏 Acknowledgments

- Thanks to all the open-source libraries and frameworks used in this project
- Special thanks to the academic institution for the project opportunity

---

⭐ If you find this project useful, please consider giving it a star!

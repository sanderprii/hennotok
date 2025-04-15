# User Authentication Application

A clean, modern user authentication application with a responsive design built using React, Node.js, and SQLite.


## Features

- User registration with validations
- User login with authentication
- Session management with JWT
- Protected routes for authenticated users
- Dashboard for logged-in users
- Secure password storage with bcrypt
- Responsive design (works on mobile and desktop)
- Modern UI with Ant Design components
- SQLite database with Prisma ORM
- RESTful API architecture

## Tech Stack

### Frontend
- React
- React Router DOM
- Ant Design
- CSS3

### Backend
- Node.js
- Express.js
- Prisma (ORM)
- SQLite
- bcrypt for password hashing
- JWT for authentication

## Project Structure

```
my-app/
├── client/                     # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SignUp.jsx     # Registration form
│   │   │   ├── Login.jsx      # Login form
│   │   │   ├── Dashboard.jsx  # User dashboard
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── styles/
│   │   │   ├── SignUp.css     # Registration form styles
│   │   │   ├── Login.css      # Login form styles
│   │   │   └── Dashboard.css  # Dashboard styles
│   │   ├── App.jsx
│   │   └── index.jsx
├── server/                     # Backend Node.js application
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   ├── validation.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── passwordUtils.js
│   │   └── index.js          # Server entry point
```

## Installation

Follow these steps to set up the project:

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Steps

1. Install dependencies
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

2. Set up environment variables
   ```bash
   # In the server directory
   cd server
   
   # Create .env file
   echo "DATABASE_URL=\"file:./dev.db\"
   JWT_SECRET=\"your-super-secret-key-replace-in-production\"
   PORT=5000" > .env
   ```

3. Initialize the database
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## Running the Application

You can run both the frontend and backend simultaneously:

```bash
# From the root directory
npm start
```

Or run them separately:

```bash
# For the backend (from the server directory)
npm run dev

# For the frontend (from the client directory)
npm start
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

## API Endpoints

| Method | Endpoint           | Description      | Request Body                                         | Response                                   |
|--------|-------------------|------------------|----------------------------------------------------|-------------------------------------------|
| POST   | /api/users/register | Register new user | `{ username, password, confirmPassword }`           | `{ id, username, createdAt, message }`    |
| POST   | /api/users/login    | Login user        | `{ username, password }`                             | `{ id, username, token, message }`         |

## Authentication Flow

1. **User Registration**:
    - User submits registration form with username and password
    - Server validates input and stores hashed credentials
    - User is redirected to login

2. **User Login**:
    - User submits login credentials
    - Server verifies credentials and issues JWT token
    - Token is stored in localStorage
    - User is redirected to dashboard

3. **Session Management**:
    - Protected routes check for valid token
    - Unauthorized access redirects to login
    - Dashboard displays user-specific information
    - Logout clears token and redirects to login

## Form Validation Rules

- **Username**:
    - Required field

- **Password**:
    - Required field
    - Minimum 6 characters

- **Confirm Password**:
    - Required field
    - Must match the password field

## Database Schema

### User Table
| Field     | Type      | Attributes                |
|-----------|-----------|---------------------------|
| id        | Int       | @id @default(autoincrement()) |
| username  | String    | @unique                   |
| password  | String    |                           |
| createdAt | DateTime  | @default(now())          |
| updatedAt | DateTime  | @updatedAt               |

## Future Development

- Email verification
- Password reset functionality
- User profile management
- Remember me functionality
- Social login options
- User roles and permissions

## License

[MIT](LICENSE)
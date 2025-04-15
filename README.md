# User Registration Application

A clean, modern user registration application with a responsive design built using React, Node.js, and SQLite.



## Features

- User registration with validations
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

## Project Structure

```
my-app/
├── client/                     # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── SignUp.jsx     # Registration form
│   │   ├── styles/
│   │   │   └── SignUp.css     # Registration form styles
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
│   │   │   └── validation.js
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

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. Install dependencies
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

3. Set up environment variables
   ```bash
   # In the server directory
   cd server
   
   # Create .env file
   echo "DATABASE_URL=\"file:./dev.db\"
   JWT_SECRET=\"your-super-secret-key-replace-in-production\"
   PORT=5000" > .env
   ```

4. Initialize the database
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

- Login functionality
- User profile management
- Email verification
- Password reset functionality
- User dashboard
- Authentication with JWT

## License

[MIT](LICENSE)
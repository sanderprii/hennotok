# Social Media Application

A clean, modern social media application with a responsive design built using React, Node.js, and SQLite. Features user authentication, media uploads, profiles, and topic-based content browsing.

## Features

### User Authentication
- User registration with validations
- User login with authentication
- Session management with JWT
- Protected routes for authenticated users

### Social Media Features
- Upload images and videos (up to 2MB for images, 60sec for videos)
- Create posts with descriptions
- Categorize posts with topics
- Browse posts by topic
- View user profiles
- Video preview and playback
- Modal image and video viewing

### General Features
- Responsive design (works on mobile and desktop)
- Modern UI with Ant Design components
- SQLite database with Prisma ORM
- RESTful API architecture
- Client-side validation for uploads
- Server-side validation

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
- Multer for file uploads
- FFmpeg for video processing
- Sharp for image processing

## Project Structure

```
project/
├── client/                     # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SignUp.js      # Registration form
│   │   │   ├── Login.js       # Login form
│   │   │   ├── Layout.js      # Main layout with navbars
│   │   │   ├── Home.js        # Home feed
│   │   │   ├── Discover.js    # Topics discovery
│   │   │   ├── TopicPosts.js  # Posts by topic
│   │   │   ├── CreatePost.js  # Post creation
│   │   │   ├── Profile.js     # User profile
│   │   │   ├── Inbox.js       # Messages (placeholder)
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── styles/
│   │   │   ├── SignUp.css
│   │   │   ├── Login.css
│   │   │   ├── Layout.css
│   │   │   ├── Home.css
│   │   │   ├── Discover.css
│   │   │   ├── TopicPosts.css
│   │   │   ├── CreatePost.css
│   │   │   ├── Profile.css
│   │   │   └── Inbox.css
│   │   ├── App.js
│   │   └── index.js
├── server/                     # Backend Node.js application
│   ├── uploads/                # Media file storage
│   │   ├── images/            
│   │   ├── videos/            
│   │   └── thumbnails/        
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Topics seed data
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   └── postController.js
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   └── postRoutes.js
│   │   ├── middleware/
│   │   │   ├── validation.js
│   │   │   ├── auth.js
│   │   │   └── upload.js      # File upload handling
│   │   ├── utils/
│   │   │   └── passwordUtils.js
│   │   └── index.js          # Server entry point
```

## Installation

Follow these steps to set up the project:

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- FFmpeg (for video processing)

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

4. Seed the database with topics
   ```bash
   npx prisma db seed
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

### Authentication

| Method | Endpoint           | Description      | Request Body                                  | Response                                |
|--------|-------------------|------------------|----------------------------------------------|----------------------------------------|
| POST   | /api/users/register | Register user    | `{ username, password, confirmPassword }`    | `{ id, username, createdAt, message }` |
| POST   | /api/users/login    | Login user        | `{ username, password }`                      | `{ id, username, token, message }`      |

### Posts

| Method | Endpoint                | Description         | Request Body                           | Response                           |
|--------|------------------------|---------------------|---------------------------------------|-----------------------------------|
| GET    | /api/posts/topics       | Get all topics      | -                                     | Array of topics                    |
| GET    | /api/posts/topics/:id   | Get topic by ID     | -                                     | Topic object                       |
| POST   | /api/posts/create       | Create new post     | FormData with `file`, `description`, `topicId` | `{ id, message }`                |
| GET    | /api/posts/user         | Get user's posts    | -                                     | Array of posts                     |
| GET    | /api/posts              | Get all posts       | Optional query param `topicId`        | Array of posts                     |

## Authentication Flow

1. **User Registration**:
    - User submits registration form with username and password
    - Server validates input and stores hashed credentials
    - User is redirected to login

2. **User Login**:
    - User submits login credentials
    - Server verifies credentials and issues JWT token
    - Token is stored in localStorage
    - User is redirected to home feed

3. **Session Management**:
    - Protected routes check for valid token
    - Unauthorized access redirects to login
    - Bottom navbar allows navigation between sections
    - Logout in profile section clears token

## Form Validation Rules

- **Username**:
    - Required field

- **Password**:
    - Required field
    - Minimum 6 characters

- **Confirm Password**:
    - Required field
    - Must match the password field

- **File Upload**:
    - Images: Maximum 2MB
    - Videos: Maximum 60 seconds duration
    - Only image and video file types accepted

- **Post Creation**:
    - Topic selection is required
    - Description is optional

## Database Schema

### User Table
| Field     | Type      | Attributes                |
|-----------|-----------|---------------------------|
| id        | Int       | @id @default(autoincrement()) |
| username  | String    | @unique                   |
| password  | String    |                           |
| createdAt | DateTime  | @default(now())          |
| updatedAt | DateTime  | @updatedAt               |

### Topic Table
| Field     | Type      | Attributes                |
|-----------|-----------|---------------------------|
| id        | Int       | @id @default(autoincrement()) |
| name      | String    | @unique                   |

### Post Table
| Field        | Type      | Attributes                |
|--------------|-----------|---------------------------|
| id           | Int       | @id @default(autoincrement()) |
| userId       | Int       | Foreign key to User        |
| topicId      | Int       | Foreign key to Topic       |
| description  | String?   | Optional                   |
| fileUrl      | String    |                           |
| fileType     | String    | "image" or "video"         |
| fileSize     | Int       | Size in bytes              |
| thumbnailUrl | String?   | Optional                   |
| duration     | Int?      | Optional (for videos)      |
| createdAt    | DateTime  | @default(now())           |
| updatedAt    | DateTime  | @updatedAt                |

## Future Development

- Email verification
- Password reset functionality
- User profile customization
- Social features (likes, comments, follows)
- User search functionality
- Advanced content filters
- Edit and delete posts
- Notifications
- Messaging functionality
- Social login options
- User roles and permissions

## License

[MIT](LICENSE)
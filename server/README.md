# Hennotok Server

## Mock Data for Testing

This project includes mock data for testing the application. The mock data includes users, posts, likes, comments, and notifications.

### How to Seed the Database with Mock Data

1. Make sure your database is set up and the Prisma schema is up to date:

```bash
npx prisma migrate dev
```

2. Run the seed script:

```bash
node scripts/seed_db.js
```

This will:
- Clear existing data in the database
- Create mock media files in the `public/uploads` directory
- Seed the database with users, topics, posts, likes, comments, and notifications

### Test User Credentials

You can log in with the following test users:

- Username: `testuser1`, Password: `password123`
- Username: `testuser2`, Password: `password123`
- Username: `testuser3`, Password: `password123`

### Mock Data Structure

The mock data includes:
- 3 users
- 5 topics
- 10 posts (mix of images and videos)
- 10 likes
- 10 comments (including replies)
- 5 comment likes
- 10 notifications
- 5 follows

### Notes

- The mock media files are minimal placeholders (1x1 pixel images and tiny videos)
- In a real environment, you would upload actual media files
- The seed script creates the necessary directories if they don't exist

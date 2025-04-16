# Social Features Implementation Documentation

This document outlines the implementation of social features (likes, comments, and notifications) in the Hennotok application.

## Table of Contents
1. [Database Schema Updates](#database-schema-updates)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Frontend Components](#frontend-components)
4. [User Flows](#user-flows)
5. [Testing](#testing)

## Database Schema Updates

We extended the Prisma schema to include the following models:

### Like Model
```prisma
model Like {
  id        Int      @id @default(autoincrement())
  userId    Int
  postId    Int
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
  
  // Ensure a user can only like a post once
  @@unique([userId, postId])
}
```

### Comment Model
```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  userId    Int
  postId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
  
  // Self-relation for comment replies
  parentId  Int?     
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  // For comment likes
  likes     CommentLike[]
}
```

### CommentLike Model
```prisma
model CommentLike {
  id        Int      @id @default(autoincrement())
  userId    Int
  commentId Int
  createdAt DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id])
  comment   Comment  @relation(fields: [commentId], references: [id])
  
  // Ensure a user can only like a comment once
  @@unique([userId, commentId])
}
```

### Notification Model
```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  type        String   // e.g., "like", "comment", "follow"
  recipientId Int
  senderId    Int
  postId      Int?
  commentId   Int?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  // Relations
  recipient   User     @relation("recipient", fields: [recipientId], references: [id])
  sender      User     @relation("sender", fields: [senderId], references: [id])
}
```

### Updated User Model
Added relationships to the User model:
```prisma
model User {
  // Existing fields...
  
  // Added relationships for likes, comments, and notifications
  likes        Like[]
  comments     Comment[]
  commentLikes CommentLike[]
  notifications Notification[] @relation("recipient")
  sentNotifications Notification[] @relation("sender")
}
```

### Updated Post Model
Added relationships to the Post model:
```prisma
model Post {
  // Existing fields...
  
  // Added relationships for likes and comments
  likes        Like[]
  comments     Comment[]
}
```

## Backend API Endpoints

### Like Controller
Created a controller (`likeController.js`) with the following endpoints:

- **POST /api/likes/posts/:postId** - Like a post
- **DELETE /api/likes/posts/:postId** - Unlike a post
- **GET /api/likes/posts/:postId** - Get likes for a post
- **POST /api/likes/comments/:commentId** - Like a comment
- **DELETE /api/likes/comments/:commentId** - Unlike a comment

### Comment Controller
Created a controller (`commentController.js`) with the following endpoints:

- **POST /api/comments/posts/:postId** - Create a comment on a post
- **GET /api/comments/posts/:postId** - Get comments for a post
- **PUT /api/comments/:commentId** - Update a comment
- **DELETE /api/comments/:commentId** - Delete a comment

### Notification Controller
Created a controller (`notificationController.js`) with the following endpoints:

- **GET /api/notifications** - Get user notifications
- **PUT /api/notifications/:notificationId/read** - Mark notification as read
- **PUT /api/notifications/read-all** - Mark all notifications as read
- **DELETE /api/notifications/:notificationId** - Delete a notification

### Post Controller Updates
Updated the Post controller to include:

- **GET /api/posts/:postId** - Get a specific post with like and comment counts
- Updated existing endpoints to include like and comment counts
- Added `isLiked` flag to indicate if the current user has liked a post

## Frontend Components

### LikeButton Component
Created a reusable like button component (`LikeButton.js`) that:
- Displays the like count
- Shows filled or outlined heart icon based on like status
- Handles like/unlike actions
- Updates the UI optimistically

### CommentSection Component
Created a comment section component (`CommentSection.js`) that:
- Displays comments for a post
- Allows users to add new comments
- Supports editing and deleting comments
- Shows comment likes
- Handles expanding/collapsing the comment section

### NotificationCenter Component
Created a notification center component (`NotificationCenter.js`) that:
- Displays a badge with unread notification count
- Shows a dropdown with notifications
- Allows marking notifications as read
- Supports deleting notifications
- Navigates to relevant content when a notification is clicked

### PostDetail Component
Created a post detail component (`PostDetail.js`) that:
- Displays a single post with full details
- Shows likes and comments
- Allows users to interact with the post
- Provides a dedicated page for post interactions

### Updates to Existing Components
- **Layout.js**: Added NotificationCenter to the top navigation bar
- **Home.js**: Added LikeButton and CommentSection to posts
- **TopicPosts.js**: Added LikeButton and CommentSection to posts
- **UserProfile.js**: Updated to navigate to PostDetail when a post is clicked

## User Flows

### Liking a Post
1. User views a post in the feed
2. User clicks the like button
3. The like count updates immediately
4. A notification is sent to the post owner

### Commenting on a Post
1. User enters a comment in the comment input field
2. User submits the comment
3. The comment appears in the comment section
4. A notification is sent to the post owner

### Viewing Notifications
1. User clicks the notification bell icon
2. A dropdown displays recent notifications
3. Unread notifications are highlighted
4. User can mark notifications as read or delete them

### Viewing Post Details
1. User clicks on a post
2. User is navigated to the post detail page
3. User can see all comments and interact with the post

## Testing

To test these features:

1. **Like Functionality**:
   - Try liking and unliking posts
   - Verify like counts update correctly
   - Check that notifications are sent to post owners

2. **Comment Functionality**:
   - Add comments to posts
   - Edit and delete your own comments
   - Like comments
   - Verify comment counts update correctly

3. **Notification Functionality**:
   - Perform actions that generate notifications
   - Check that notifications appear in the notification center
   - Test marking notifications as read
   - Verify navigation when clicking on notifications

4. **Post Detail View**:
   - Navigate to post detail pages
   - Verify all interactions work correctly
   - Test media preview functionality

# To-Do App

A collaborative notes and to-do application built with Node.js, Express, and MongoDB. Supports multi-user collaboration and role-based permissions.

## Features
- Create, update, and delete notes/to-dos
- Share notes with other users for collaboration
- Four user roles: admin, editor, user, viewer, each with specific permissions
- Google OAuth for authentication; sessions managed and persisted in MongoDB

## Getting Started
1. Install dependencies: `npm install`
2. Ensure MongoDB is running locally (default: `mongodb://localhost/test-app`)
3. Start the server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage
- Authenticate via Google at `/auth/login`
- After login, use endpoints such as:
  - `POST /addNotes` to create a note (requires authentication and permission)
  - `PATCH /updateNotes/:noteId` to update a note
  - See code for additional endpoints (e.g., `/createUser`, `/me`)
- Sessions are stored in MongoDB using connect-mongo
- All endpoints are protected by role-based authorization middleware

## Testing Permissions
- Log in and obtain your session cookie (browser or API client)
- Access endpoints according to your assigned role to verify permissions (e.g., only editors/users can add notes, only admins can manage contributors)
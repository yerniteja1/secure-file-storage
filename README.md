# Secure File Storage Service

A full-stack web application for secure file storage, management, and sharing. Built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.

## Features

- **Authentication**: Secure user registration and login with JWT
- **File Upload**: Upload files up to 100MB with progress tracking
- **File Management**: View, download, and delete files
- **Sharing**: Toggle files between public/private with shareable links
- **Dashboard**: Personal file management interface
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local filesystem (configurable for Cloudinary)
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod

## Project Structure

```
secure-file-storage/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── files.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── validation.ts
│   │   │   ├── errors.ts
│   │   │   ├── fileUpload.ts
│   │   │   └── prisma.ts
│   │   └── types/
│   │       └── index.ts
│   └── uploads/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── types/
│       └── App.tsx
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- Docker (for PostgreSQL)
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd secure-file-storage
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env  # Edit with your configuration
npx prisma migrate dev
npm run dev
```

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Edit with your configuration
npm run dev
```

### 5. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/files/upload | Upload a file |
| GET | /api/files | List user's files |
| GET | /api/files/:id | Get file details |
| GET | /api/files/:id/download | Download file |
| DELETE | /api/files/:id | Delete file |
| PATCH | /api/files/:id | Update file metadata |
| PATCH | /api/files/:id/share | Toggle public/private |
| GET | /api/files/public/:shareId | Access public file |
| GET | /api/files/public/:shareId/download | Download public file |

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/filestorage
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Security Features

- JWT authentication with token expiration
- Password hashing with bcryptjs (10 rounds)
- File type validation (images, documents, videos, audio)
- File size limits (100MB max)
- CORS configuration
- Helmet.js for HTTP headers
- Input validation with Zod
- Authorization checks for file access

## License

MIT
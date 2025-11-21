🚀 Postman Clone API (Express + TypeScript + SQLite)

A lightweight Postman-like backend built using Express, TypeScript, JWT authentication, bcrypt, and SQLite (better-sqlite3).
Supports user signup/signin and CRUD for saved API requests.

📌 Features
🔐 Authentication

User signup (email + password)

User login

Password hashing with bcryptjs

Token-based authentication using JWT

📁 Saved Request Management

Authenticated users can:

Get all saved requests

Create/save a new request

Delete an existing request

🗄️ Database

SQLite (via better-sqlite3)

Automatically creates tables:

users

requests

📦 Tech Stack
Component	Library
Server	Express (TypeScript)
Database	SQLite (better-sqlite3)
Auth	JWT + bcryptjs
Environment	dotenv
Middleware	CORS
📂 Project Structure
project/
│
├── server.ts
├── postman.db
└── .env

⚙️ Installation
1️⃣ Clone project & install dependencies
npm install

2️⃣ Create .env
JWT_SECRET=your_secret_key
PORT=3001

3️⃣ Run project
npm run dev   # if using ts-node-dev


or

tsc && node dist/server.js

🛣️ API Endpoints
🔐 Authentication Endpoints
POST /api/auth/signup

Create a new user.

Request Body
{
  "email": "test@test.com",
  "password": "test"
}

Response
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "test@test.com"
  }
}

POST /api/auth/signin

Login user.

Request Body
{
  "email": "test@test.com",
  "password": "test"
}

📁 Request Storage Endpoints

(All require Authorization: Bearer <token>)

GET /api/requests

Return all saved requests for the authenticated user.

Response Example
[
  {
    "id": 1,
    "name": "Get Users",
    "url": "https://api.example.com/users",
    "method": "GET",
    "headers": "{}",
    "body": null,
    "created_at": "2025-01-01"
  }
]

POST /api/requests

Save a new API request.

Request Body
{
  "name": "Get Users",
  "description": "Fetch all users",
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": "{\"Authorization\": \"Bearer xyz\"}",
  "body": null
}

DELETE /api/requests/:id

Delete a request owned by the user.

Example
DELETE /api/requests/5

🗄️ Database Schema
users table
Column	Type
id	INTEGER (PK)
email	TEXT UNIQUE
password	TEXT
created_at	DATETIME
requests table
Column	Type
id	INTEGER (PK)
user_id	INTEGER (FK)
name	TEXT
description	TEXT
url	TEXT
method	TEXT
headers	TEXT
body	TEXT
created_at	DATETIME
🛡️ JWT Authentication

Send token with every request:

Authorization: Bearer <your_token>

🚀 Deployment Notes

SQLite file postman.db must persist (mount a persistent disk for Render)

Make sure .env variables exist on server

Works perfectly on:

Render

Railway

Docker

Local

🤝 Contributing

Feel free to submit issues or improvements!

🧑‍💻 Author

Built by Pranit
Minimal, fast, and clean backend for Postman-like UI.
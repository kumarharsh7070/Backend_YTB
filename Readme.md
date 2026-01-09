# 🎬 YouTube Clone – Full Stack MERN Application

A full-stack YouTube-like video sharing platform built using the **MERN stack**.  
It supports authentication, video upload & streaming, likes, comments, playlists, subscriptions, notifications, search, and dark/light mode.

---

## 🚀 Live Demo

- Frontend: https://your-frontend.vercel.app
- Backend API: https://your-backend.onrender.com

---

## ✨ Features

### 🔐 Authentication

- User registration & login (JWT based)
- Protected routes
- Change / reset password

### 📹 Video Features

- Upload videos with thumbnails
- Watch videos
- Edit & delete own videos
- View count tracking

### ❤️ Likes System

- Like / unlike videos
- Like / unlike comments
- Persistent like state

### 💬 Comments

- Add comments on videos
- Edit & delete own comments
- Comment notifications

### 🔔 Notifications

- Like notifications
- Comment notifications
- Subscription notifications
- Notification bell with unread count

### 📺 Channel System

- User channel page
- Subscribe / unsubscribe
- Subscriber count
- Channel videos

### 📂 Playlists

- Create playlists
- Add / remove videos
- Edit & delete playlists

### 🔍 Search

- Search videos by title
- Real-time results

### 🌗 Dark / Light Mode

- Theme toggle
- Saved in localStorage

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Context API
- Axios

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (media storage)

---

## 📁 Project Structure

```
YouTubeClone/
│
├── fronted/ # Frontend (React + Vite)
│ ├── public/
│ ├── src/
│ │ ├── api/
│ │ ├── assets/
│ │ ├── pages/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── index.html
│ ├── tailwind.config.js
│ └── vite.config.js
│
├── src/ # Backend
│ ├── Controller/
│ ├── Db/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── app.js
│ └── index.js
│
├── .env
├── package.json
└── README.md
```

---

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### Frontend (`fronted/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

---

## ▶️ How to Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/YouTubeClone.git
cd YouTubeClone
```

### 2️⃣ Run Backend

```bash
npm install
npm run dev
```

### 3️⃣ Run Frontend

```bash
cd fronted
npm install
npm run dev
```

---

## 👨‍💻 Author

**Kumar Harsh**  
Full Stack Developer

---

⭐ If you like this project, give it a star!

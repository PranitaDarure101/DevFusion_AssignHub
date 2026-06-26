# 🎓 AssignHub

<div align="center">

### Secure Role-Based Assignment Management Platform

*A modern assignment management platform built for educational institutions with secure authentication, role-based access control, PDF assignment distribution, and multi-format student submissions.*

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?logo=firebase)
![Supabase](https://img.shields.io/badge/Supabase-Storage-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-blue?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![License](https://img.shields.io/badge/License-Hackathon-success)

</div>

---

# 📌 Overview

AssignHub is a modern **role-based assignment management platform** designed for schools, colleges, coaching institutes, and educational organizations.

Unlike conventional LMS platforms where assignment sharing often occurs through WhatsApp groups, email attachments, or Google Drive links, AssignHub provides a centralized, secure, and controlled environment for assignment distribution and submission.

The system supports:

- Secure authentication
- Admin-controlled assignment publishing
- Student-specific assignment visibility
- PDF-based assignment distribution
- Multi-format assignment submission
- Real-time submission tracking
- Deadline management

---

# 🚀 Key Features

## 👨‍💼 Admin Portal

- Secure Firebase Authentication
- Create assignments
- Upload assignments only in PDF format
- Set deadlines
- Assign to all students or selected students
- View all submissions
- Download submitted files
- Track late and on-time submissions
- View submission statistics

---

## 👨‍🎓 Student Portal

- Secure Login
- View assigned assignments
- Download assignment PDF
- Submit assignments before deadline
- Support multiple submission formats
- View submission history
- Replace submissions before deadline (optional)
- Real-time submission confirmation

---

# 📂 Supported File Formats

## Assignment Upload (Admin)

✔ PDF only

This ensures every assignment is standardized and readable across all devices.

---

## Submission Upload (Students)

Students can upload:

- PDF
- DOC
- DOCX
- PPT
- PPTX
- ZIP
- TXT

---

# 🔒 Security Features

- Firebase Authentication
- Role-based Access Control
- Protected Routes
- Student Authorization
- Admin Authorization
- Firestore Security Rules
- Supabase Storage Policies
- File Type Validation
- File Size Validation

---

# 🏗 System Architecture

```
                +----------------------+
                |      React App       |
                +----------+-----------+
                           |
          +----------------+----------------+
          |                                 |
          |                                 |
+---------v---------+            +----------v----------+
| Firebase Auth     |            | Firestore Database |
| Authentication    |            | Assignment Metadata|
+-------------------+            +---------------------+
                                             |
                                             |
                                  +----------v----------+
                                  | Supabase Storage    |
                                  | Assignment Files    |
                                  | Submission Files    |
                                  +---------------------+
```

---

# 🛠 Technology Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Context API

---

## Backend Services

### Authentication

- Firebase Authentication

### Database

- Cloud Firestore

### File Storage

- Supabase Storage

---

## Storage Architecture

```
Assignments

Admin
      |
      |
Upload PDF
      |
      |
Firestore Metadata
      |
      |
Supabase Storage
      |
Students Download


Student Submission

Student
      |
Upload
(PDF/DOC/DOCX/PPT/PPTX/ZIP/TXT)
      |
Firestore Metadata
      |
Supabase Storage
      |
Admin Reviews
```

---

# 📁 Project Structure

```
AssignHub
│
├── public
│
├── src
│   ├── components
│   ├── context
│   ├── hooks
│   ├── lib
│   ├── pages
│   ├── routes
│   ├── services
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── firestore.rules
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/YourUsername/DevFusion_AssignHub.git
```

Move into the project

```bash
cd DevFusion_AssignHub
```

Install dependencies

```bash
npm install
```

Create environment file

```
.env
```

Add your Firebase and Supabase credentials.

Run development server

```bash
npm run dev
```

---

# 🔑 Environment Variables

```
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=
```

---

# 📸 Screenshots

## Admin Dashboard

> Add Screenshot Here

---

## Student Dashboard

> Add Screenshot Here

---

## Assignment Details

> Add Screenshot Here

---

## Submission Dashboard

> Add Screenshot Here

---

# 🎯 Problem Statement

Traditional assignment sharing suffers from:

- Uncontrolled distribution
- No submission tracking
- Poor deadline management
- Mixed communication channels
- Difficult file organization

AssignHub solves these challenges through a centralized and secure platform.

---

# 💡 Future Enhancements

- AI-based plagiarism detection
- OCR for handwritten assignments
- AI grading assistant
- Email notifications
- Push notifications
- Calendar integration
- Analytics dashboard
- Assignment version history
- Mobile Application
- Offline support
- Dark Mode
- Multi-language support

---

# 📱 Mobile Compatibility

The platform is fully responsive and optimized for:

- Desktop
- Laptop
- Tablet
- Mobile Devices

---

# 🌟 Highlights

- Secure Authentication
- Modern UI
- Fast Performance
- Multi-format Submission
- PDF Assignment Distribution
- Cloud Storage
- Role-Based Access
- Responsive Design
- Scalable Architecture

---

# 📊 Project Status

✅ Completed

Ready for Hackathon Demonstration

---

# 👨‍💻 Team

## Team Name

**Six Pioneer**

---

## Developed By

- Veer Raheja
- Pranita Darure
- Team Members

---

# 🙏 Acknowledgements

Built for

**DevFusion 3.0 — The Developers Hackathon**

---

<div align="center">

### ⭐ If you like this project, consider giving it a star.

</div>
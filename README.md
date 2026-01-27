# 🏥 Nirmaya Health Services

<div align="center">

<img width="1919" height="832" alt="image" src="https://github.com/user-attachments/assets/5c265878-6bdc-4e92-b738-4d54cdabdfc9" />


### Smart Hospital Management System

**A modern, comprehensive full-stack healthcare platform built with React & FastAPI**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://nirmayahealthservices.netlify.app/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

[Live Demo](https://nirmayahealthservices.netlify.app/) • [Report Bug](https://github.com/RSaha0507/Nirmaya-Health-Services/issues) • [Request Feature](https://github.com/RSaha0507/Nirmaya-Health-Services/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**Nirmaya Health Services** is a production-ready, enterprise-grade hospital management system that revolutionizes healthcare delivery through modern technology. Built with cutting-edge frameworks and designed for scalability, this platform seamlessly connects patients, doctors, and administrators in a unified ecosystem.

### Why Nirmaya?

- 🚀 **Modern Stack** - Built with React 19 and FastAPI for blazing-fast performance
- 🔐 **Enterprise Security** - JWT authentication, bcrypt hashing, and role-based access control
- 💬 **Real-time Communication** - WebSocket-powered notifications and messaging
- 💳 **Integrated Payments** - Stripe payment gateway for seamless transactions
- 🤖 **AI-Powered** - Google Gemini API integration for intelligent chatbot assistance
- 📱 **Responsive Design** - Mobile-first approach with TailwindCSS
- ⚡ **High Performance** - Async operations with Motor and FastAPI
- 🏥 **Comprehensive** - 15+ medical departments with specialized features

---

## ✨ Key Features

### For Patients 👥

- **Smart Appointment Booking**
  - Multi-step intuitive booking flow
  - Real-time doctor availability
  - Department and specialty filtering
  - Online consultation options

- **Personalized Dashboard**
  - View upcoming and past appointments
  - Access medical records and prescriptions
  - Download reports and test results
  - Track health checkup packages

- **AI Health Assistant**
  - 24/7 chatbot powered by Google Gemini
  - Instant answers to health queries
  - Department and service recommendations

- **Emergency Services**
  - Quick ambulance booking
  - Real-time ambulance tracking
  - Emergency contact integration

- **Health Packages**
  - Comprehensive health checkup packages
  - Discounted pricing
  - Easy online booking and payment

### For Doctors 👨‍⚕️

- **Professional Portal**
  - Dedicated dashboard for appointment management
  - Patient medical history access
  - Real-time schedule updates
  - Digital prescription generation

- **Appointment Management**
  - View daily/weekly schedules
  - Patient details and medical records
  - Appointment cancellation and rescheduling
  - Consultation notes and documentation

- **Communication Tools**
  - Secure messaging with patients
  - Real-time notifications
  - Video consultation integration

### For Administrators ⚙️

- **Complete Control Panel**
  - Full CRUD operations for all entities
  - User and doctor management
  - Appointment oversight and analytics

- **Resource Management**
  - Medical equipment inventory tracking
  - Bed availability management
  - Department and staff scheduling
  - Ambulance fleet management

- **Analytics & Reporting**
  - Visual dashboards with Recharts
  - Revenue tracking and statistics
  - Patient demographics and trends
  - System performance metrics

- **System Configuration**
  - Payment gateway settings
  - Notification preferences
  - Role and permission management
  - Database backups and maintenance

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI Framework |
| **TailwindCSS** | 3.4.1 | Styling |
| **Lucide React** | 0.539.0 | Icons |
| **Recharts** | 3.6.0 | Data Visualization |
| **Firebase** | 12.1.0 | Authentication & Storage |
| **Date-fns** | 4.1.0 | Date Manipulation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.6 | Web Framework |
| **Motor** | 3.7.0 | Async MongoDB Driver |
| **PyJWT** | 2.10.1 | JWT Authentication |
| **Bcrypt** | 4.2.1 | Password Hashing |
| **HTTPx** | 0.28.1 | HTTP Client |
| **WebSockets** | 14.1 | Real-time Communication |
| **Stripe** | Latest | Payment Processing |

### Database & Infrastructure

- **MongoDB Atlas** - Cloud NoSQL Database
- **Netlify** - Frontend Hosting
- **Google Gemini API** - AI Chatbot

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Patient    │  │    Doctor    │  │    Admin     │       │
│  │   Portal     │  │    Portal    │  │   Portal     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Pages  │  │Components│  │  State   │  │   API    │     │
│  │ (30+)    │  │  (Reusable)│ │Management│ │  Client  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   REST API    │
                    │   WebSocket   │
                    └───────┬───────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │   API    │  │WebSocket │  │ Payment  │     │
│  │  Layer   │  │ Endpoints│  │ Manager  │  │ Gateway  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB)                        │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐  │
│  │Users │ │Doctors│ │Appts │ │Equip │ │Payments│ │Records│  │
│  └──────┘ └───────┘ └──────┘ └──────┘ └────────┘ └───────┘  │
│                   (20+ Collections)                         │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

**21 MongoDB Collections:**

1. `users` - Patient accounts and profiles
2. `doctors` - Doctor profiles with specialties & schedules
3. `appointments` - Appointment bookings and history
4. `messages` - Chat and messaging system
5. `equipment` - Medical equipment inventory
6. `inventory` - General inventory management
7. `shifts` - Staff shift scheduling
8. `reports` - Medical reports and documents
9. `analytics` - System analytics and metrics
10. `notifications` - User notifications
11. `payments` - Payment records
12. `health_packages` - Health checkup packages
13. `ambulance_requests` - Ambulance bookings
14. `health_records` - Patient medical records
15. `lab_tests` - Laboratory test data
16. `beds` - Hospital bed management
17. `prescriptions` - Doctor prescriptions
18. `departments` - Hospital departments
19. `ambulances` - Ambulance fleet data
20. `payment_transactions` - Stripe transactions
21. `package_bookings` - Package booking records

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **Python** 3.8 or higher
- **MongoDB Atlas** account
- **Firebase** project
- **Stripe** account (for payments)
- **Google AI API** key (for chatbot)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RSaha0507/Nirmaya-Health-Services.git
   cd Nirmaya-Health-Services
   ```

2. **Navigate to backend**
   ```bash
   cd backend
   ```

3. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/nirmaya_health
   JWT_SECRET=your_super_secret_jwt_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   STRIPE_API_KEY=your_stripe_secret_key_here
   ```

6. **Run the backend server**
   ```bash
   python server.py
   ```
   
   Server will start at `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` in the `frontend` directory:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001/api
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   
   Application will open at `http://localhost:3000`

### Demo Accounts

**Admin Access:**
- Email: `admin@nirmaya.com`
- Password: `admin123`

**Doctor Access:**
- Email: `ananya@nirmaya.com`
- Password: `doctor123`

**Patient Access:**
- Create a new account via Sign Up

---

## 📁 Project Structure

```
Nirmaya-Health-Services/
│
├── backend/
│   ├── server.py              # Main FastAPI application (98KB)
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── seeds/                 # Database seeding scripts
│   └── venv/                  # Virtual environment
│
├── frontend/
│   ├── public/
│   │   ├── logo.png           # Application logo
│   │   └── index.html         # HTML template
│   │
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Chatbot.js
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ...
│   │   │
│   │   ├── pages/             # 30+ page components
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── DoctorsPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DoctorPortal.js
│   │   │   └── ...
│   │   │
│   │   ├── data/              # Static data for departments
│   │   │   ├── cardiology.js
│   │   │   ├── neurology.js
│   │   │   └── ...
│   │   │
│   │   ├── App.js             # Main application component
│   │   ├── firebase.js        # Firebase configuration
│   │   └── index.js           # Application entry point
│   │
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/{id}` | Get doctor by ID |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/{id}` | Update doctor (Admin) |
| DELETE | `/api/doctors/{id}` | Delete doctor (Admin) |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get user appointments |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/{id}` | Update appointment |
| DELETE | `/api/appointments/{id}` | Cancel appointment |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-checkout` | Create Stripe session |
| GET | `/api/payments/status/{session_id}` | Get payment status |
| GET | `/api/payments/history` | Get payment history |

### WebSocket Endpoints

| Endpoint | Description |
|----------|-------------|
| WS `/api/ws/{user_id}` | WebSocket connection |

*For complete API documentation, run the backend and visit: `http://localhost:8001/docs`*

---

## 👥 User Roles

### Patient Role
- Browse doctors and departments
- Book and manage appointments
- Access medical records
- Chat with AI assistant
- Request ambulance services
- Purchase health packages
- Make online payments

### Doctor Role
- View appointment schedule
- Access patient records
- Manage consultations
- Generate prescriptions
- Update availability
- Communicate with patients

### Admin Role
- Complete system control
- User management (CRUD)
- Doctor management (CRUD)
- Appointment oversight
- Equipment inventory
- Analytics and reports
- System configuration
- Payment management

---

## 📸 Screenshots

### Homepage
<img width="1880" height="827" alt="image" src="https://github.com/user-attachments/assets/79fa12a2-d26a-450f-b915-c6fa6ce51dea" />


### Patient Dashboard
<img width="1781" height="813" alt="image" src="https://github.com/user-attachments/assets/f83942fc-c032-43d4-b768-19f6d7b44a88" />
<img width="1603" height="570" alt="image" src="https://github.com/user-attachments/assets/1b5a0290-6937-4944-b8f2-dcb21c34a9af" />


### Doctor Portal
<img width="1725" height="815" alt="image" src="https://github.com/user-attachments/assets/4bf0ae3d-7ddc-47b0-ada7-efb555079d03" />


### Admin Panel
<img width="1735" height="826" alt="image" src="https://github.com/user-attachments/assets/165b1722-cf61-4e37-aec4-16d5f67b84b8" />


### Appointment Booking
<img width="1589" height="819" alt="image" src="https://github.com/user-attachments/assets/64bbfb6c-7cbc-46e8-9ad8-6da66bd357f3" />
<img width="1546" height="821" alt="image" src="https://github.com/user-attachments/assets/89589f87-6cf5-47ff-b55f-691946b99bfe" />
<img width="1545" height="821" alt="image" src="https://github.com/user-attachments/assets/46b0aa0f-9884-4b57-8e61-c91073678fc0" />


---

## 🌐 Deployment

### Frontend (Netlify)

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables in Netlify dashboard

### Backend (Cloud Platform)

**Recommended: Railway, Render, or Heroku**

1. **Prepare for deployment**
   - Ensure `requirements.txt` is up to date
   - Configure production environment variables
   - Update CORS origins for production

2. **Deploy**
   - Connect repository to hosting platform
   - Set Python runtime version
   - Configure environment variables
   - Deploy!

### Database (MongoDB Atlas)

- Already cloud-hosted
- Configure IP whitelist
- Enable authentication
- Set up backups

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core hospital management features
- [x] Multi-role authentication
- [x] Appointment booking system
- [x] Payment integration
- [x] AI chatbot
- [x] Real-time notifications

### Phase 2 (Next)
- [ ] Video consultation integration
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Email/SMS notifications
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Prescription management system
- [ ] Lab test result integration
- [ ] Insurance claim processing
- [ ] Telemedicine platform
- [ ] IoT device integration
- [ ] ML-based health predictions

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Rounak Saha**

- GitHub: [@RSaha0507](https://github.com/RSaha0507)
- Email: rs574.cs008@gmail.com
- LinkedIn: [Rounak Saha](https://linkedin.com/in/rounak-saha-932ab0253)

**Project Link:** [https://github.com/RSaha0507/Nirmaya-Health-Services](https://github.com/RSaha0507/Nirmaya-Health-Services)

**Live Demo:** [https://nirmayahealthservices.netlify.app/](https://nirmayahealthservices.netlify.app/)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Stripe](https://stripe.com/) - Payment processing
- [Google Gemini](https://ai.google.dev/) - AI chatbot
- [Lucide](https://lucide.dev/) - Icon library
- [Recharts](https://recharts.org/) - Chart library

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ by Rounak Saha**

</div>

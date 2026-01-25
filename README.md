# Nirmaya Health Services - Smart Hospital Management System

![Nirmaya Health Logo](/public/logo.png)

**Live Demo:** [nirmaya-health-services](https://nirmayahealthservices.netlify.app/)

---

## 🏥 Introduction

Nirmaya Health is a modern, comprehensive, and user-centric web application designed to streamline hospital management and enhance the patient experience. This full-stack project leverages the power of React for a dynamic frontend and Google's Firebase for a robust backend, providing a seamless interface for patients, doctors, and administrators. The integration of Google's Gemini API for an agentic AI chatbot elevates the user experience, offering intelligent, interactive assistance for navigating the hospital's services.

This project was built from the ground up to be a scalable, real-world solution for modern healthcare providers.

---

## ✨ Key Features

The platform is divided into three distinct user experiences with a rich set of features for each:

### 👤 **Patient & Public Portal**
* **Dynamic Homepage:** Features an automated image slider with engaging captions.
* **Detailed Department Pages:** Individual, detailed pages for over 15 medical departments, each with descriptions, specialties, and lists of conditions treated.
* **Doctor Listings:** A comprehensive page to view all doctors.
* **Secure User Authentication:**
    * User Sign-Up and Login using Firebase Authentication.
    * Secure password reset functionality via email.
    * Customizable user dashboard to view bookings and manage account details.
* **Interactive Appointment Booking:**
    * A multi-step booking form that dynamically filters doctors by department and shows real-time available time slots.
* **AI Chatbot:**
    * Powered by the **Google Gemini API** to provide helpful, conversational answers about the hospital's services.
* **Responsive Design:** Fully functional and visually appealing on all devices, from mobile phones to desktops.

### 👨‍⚕️ **Doctor's Portal**
* **Secure Doctor Login:** Doctors have their own credentials, managed by the admin.
* **Appointment Dashboard:** Upon logging in, doctors are taken to a dedicated portal showing a list of their scheduled appointments, grouped by date.
* **Appointment Management:** Doctors have the ability to view patient details for each appointment and cancel appointments if necessary.

### ⚙️ **Admin Dashboard**
* **Full CRUD Functionality:** The admin has complete control over the hospital's core data.
* **Doctor Management:**
    * Add, edit, and delete doctor profiles (name, specialty, department, time slots, etc.).
    * **Note on Doctor Credentials:** For security, after an admin creates a doctor's profile in the dashboard, they must **manually create the doctor's login account** (email and password) in the Firebase Authentication console.
* **User Management:** View a list of all registered users and delete user accounts.
* **Appointment Management:**
    * View a comprehensive list of all appointments booked across the hospital.
    * Edit appointment details, such as changing the doctor or time.
    * Cancel any patient's appointment.

---

## 🛠️ Tech Stack

This project was built using a modern, robust tech stack:

* **Frontend:** React.js
* **Backend & Database:** Google Firebase (Firestore & Firebase Authentication)
* **Styling:** Tailwind CSS
* **AI & Machine Learning:** Google Gemini API (for the agentic chatbot)
* **Icons:** Lucide React
* **Deployment:** Netlify

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js and npm installed on your machine.
* A Firebase project with Firestore and Authentication enabled.
* A Google AI API Key for the Gemini API.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/nirmaya_health.git](https://github.com/your-username/nirmaya_health.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd nirmaya_health
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Set up your environment variables:**
    * Create a `firebase.js` file in the `src/` directory:
        ```javascript
        // src/firebase.js
        import { initializeApp } from "firebase/app";
        import { getFirestore } from "firebase/firestore";
        import { getAuth } from "firebase/auth";

        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          // ... paste the rest of your config keys
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        export { db, auth };
        ```
    * In `src/components/Chatbot.js`, add your Gemini API key:
        ```javascript
        const apiKey = "YOUR_GEMINI_API_KEY";
        ```
5.  **Run the application:**
    ```sh
    npm start
    ```
    The application will be available at `http://localhost:3000`.

---

## 🌐 Deployment

This application is configured for easy deployment on platforms like Netlify or Vercel.

1.  **Build the application:**
    ```sh
    npm run build
    ```
2.  **Deploy:**
    * **Manual:** Drag and drop the generated `build` folder into the Netlify deploy UI.
    * **Automated (Recommended):** Connect your GitHub repository to Netlify for continuous deployment. Netlify will automatically build and deploy your site every time you push a change.

---

## 🔮 Future Scope

* **Implement Two-Factor Authentication (2FA):** Integrate Firebase's phone authentication to add an extra layer of security to the login process.
* **Patient Medical Records:** Add a secure section for patients to view their medical history and test results.
* **Online Payments:** Integrate a payment gateway like Stripe or Razorpay for appointment and health checkup fees.
* **Real-time Notifications:** Use Firebase Cloud Messaging to send real-time appointment reminders to users.

---

## ✍️ Author

* **Rounak Saha** - *Initial work* - [github.com/RSaha0507](https://github.com/RSaha0507)

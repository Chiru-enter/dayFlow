# DayFlow

### Smart Employee Management & HR Platform

DayFlow is a modern employee management platform designed to bring everyday HR operations into one centralized workspace.

Instead of relying on spreadsheets, paperwork, and disconnected tools, DayFlow provides employees and administrators with dedicated dashboards for managing attendance, leave, payroll, announcements, employee information, and workplace requests.

---

##  Features

###  Employee Portal

Employees can:

* View their personalized dashboard
* Check attendance information
* Submit attendance correction requests
* Apply for leave
* Request half-day leave
* Manage overtime requests
* View holidays
* Read company announcements
* Manage personal profile information
* Raise workplace concerns through a dedicated employee feedback system
* View salary information
* Download payslips as PDF
* Receive relevant notifications

###  Admin Portal

Administrators can:

* View the administrative dashboard
* Manage employee information
* View individual employee profiles
* Edit HR-controlled employee details
* Manage attendance correction requests
* Review leave and overtime requests
* Manage holidays
* Publish company announcements
* Review employee concerns
* Receive notifications for important employee requests
* Review payroll information
* Manage employee profiles and employment details

---

##  System Overview

```text
                    ┌─────────────────────┐
                    │       DayFlow       │
                    │   HR Management     │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
        ┌──────▼──────┐                 ┌──────▼──────┐
        │   Employee  │                 │    Admin    │
        │    Portal   │                 │    Portal   │
        └──────┬──────┘                 └──────┬──────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                      ┌────────▼────────┐
                      │    Firebase     │
                      │ Authentication  │
                      │   & Firestore   │
                      └─────────────────┘
```

---

##  Tech Stack

### Frontend

* React
* Vite
* JavaScript
* React Router
* CSS

### Backend / Services

* Firebase Authentication
* Firebase Firestore
* Firebase Cloud Services

### Development Tools

* Git
* GitHub
* VS Code
* npm

---

##  Project Structure

```text
dayFlow/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Loading.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── firebase/
│   │   ├── auth.js
│   │   └── firestore.js
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Announcements.jsx
│   │   │   ├── AttendanceCorrections.jsx
│   │   │   ├── Holidays.jsx
│   │   │   ├── PayrollReview.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   │
│   │   └── employee/
│   │       ├── EmployeeDashboard.jsx
│   │       ├── Announcements.jsx
│   │       ├── AttendanceCorrection.jsx
│   │       ├── Holidays.jsx
│   │       ├── Leave.jsx
│   │       ├── Overtime.jsx
│   │       ├── Payslips.jsx
│   │       ├── Profile.jsx
│   │       └── ...
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── announcementService.js
│   │   ├── correctionService.js
│   │   ├── holidayService.js
│   │   ├── overtimeService.js
│   │   ├── payslipService.js
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── .gitignore
├── package.json
└── README.md
```

---

##  Role-Based Access

DayFlow separates functionality according to user roles.

### Employee

Employees have access to their own:

* Attendance
* Leave
* Overtime
* Payslips
* Announcements
* Holidays
* Profile
* Workplace concerns
* Attendance correction requests

### Administrator

Administrators have access to:

* Employee records
* Employee profiles
* Attendance corrections
* Leave requests
* Overtime requests
* Payroll information
* Announcements
* Holidays
* Employee concerns
* Notifications

HR-controlled information such as **job title, department, and joining date** is managed by administrators rather than employees.

---

##  Payroll & Payslips

DayFlow provides employees with centralized access to payroll information.

Employees can view relevant salary information and generate/download payslips in PDF format.

Administrators can review and manage payroll information from the admin workspace.

---

##  Communication

DayFlow includes an integrated communication system for workplace updates.

Administrators can publish announcements containing:

* Title
* Publication date
* Author
* Message

Employees can view published announcements directly from their dashboard.

---

##  Employee Concerns

DayFlow provides employees with a dedicated channel to privately raise workplace concerns.

Administrators receive these submissions in a separate management section and are notified when a new concern is registered.

This creates a more structured and transparent way for employees to communicate issues with management.

---

##  Attendance & Leave

The attendance module supports:

* Attendance tracking
* Attendance correction requests
* Check-in/check-out information
* Leave requests
* Half-day leave
* Overtime requests

Attendance correction requests allow employees to submit corrected attendance times for administrator review.

Times are handled according to **Indian Standard Time (IST)**.

---

##  Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd dayFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project and configure the required Firebase credentials.

Add the appropriate environment variables according to the project's Firebase configuration.

**Never commit Firebase secrets or private credentials to GitHub.**

### 4. Start the development server

```bash
npm run dev
```

The application will be available through the local development URL shown by Vite.

---

##  Build

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

##  Security Considerations

DayFlow uses Firebase Authentication for user authentication and Firestore for application data.

Role-based access is implemented within the application to separate employee and administrator functionality.

For production deployment, Firestore Security Rules should be configured to enforce role-based permissions at the database level as well.

Sensitive configuration values should be stored using environment variables rather than committed to the repository.

---

##  Project Goal

DayFlow aims to simplify HR management by giving employees and administrators a single platform for everyday workplace operations.

The goal is to reduce manual HR work, improve accessibility of employee information, and create a more transparent workflow for attendance, leave, payroll, communication, and employee requests.

---

##  Future Improvements

Potential future enhancements include:

* Automated payroll calculations
* Advanced attendance analytics
* Employee performance management
* HR reports and dashboards
* Email notifications
* Mobile application
* AI-assisted HR insights
* Automated payslip generation and distribution
* Expanded employee analytics
* More granular role and permission management

---

##  Team

**DayFlow** was developed as a collaborative team project.

Each team member contributed to different areas including:

* Frontend development
* UI/UX
* Authentication
* Firebase integration
* Employee management
* Admin management
* Attendance
* Leave management
* Payroll
* Notifications
* Testing and deployment

---

##  License

This project was created for educational and demonstration purposes.

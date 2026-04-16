# 📅 Reserving System - Frontend

A modern and reactive system for managing room and space reservations, designed with a focus on user experience (UX) and a clean architecture.

This project represents the user interface (Frontend), allowing professors and administrators to manage schedules, view real-time availability through an interactive calendar, and manage halls, groups, and users.

## 🚀 Technologies Used

This project was built using modern tools from the web development ecosystem:

* Framework: Angular (Standalone Components).
* Language: TypeScript.
* Styling: SCSS (CSS Preprocessor) with a 100% responsive design and Custom Properties (CSS Variables).
* Interactive Calendar: FullCalendar (Plugins: dayGrid, timeGrid, interaction).
* Form Handling: Angular Reactive Forms.
* HTTP Requests: Native Angular HttpClient + RxJS.

## 🛠️ How to Run the Project (Local Development)

Follow these steps to set up the development environment on your computer:

### 1. Prerequisites
* Have Node.js installed (Version 18+ recommended).
* Have Angular CLI installed globally: `npm install -g @angular/cli`.
* Have the backend (NestJS) cloned and running on your local machine. (Backend repo: https://github.com/santisilvafont/reserving-system-backend)

### 2. Install Dependencies
Clone this repository and run the following command in the root of the project to download all necessary libraries:
> npm install

### 3. Environment Variables
Go to the `src/environments/` folder and make sure the `environment.development.ts` file points to the correct URL of your local backend (Change apiUrl this if your backend uses a different port or IP).

### 4. Start the Development Server
Run the following command to start the application:
> ng serve

Open your browser and visit `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## ✨ Main Features (How it Works)

* Interactive Calendar View: Weekly and daily visualization of reservations with color coding by status (Approved, Pending).
* Role Management (RBAC): Dynamic views and actions depending on whether the user is a regular Professor or an Administrator.
* Advanced History and Filters: Data table with combined filters (Status, User, Hall) without needing to reload the page.
* Approval Flow: Dynamic modal system to approve, reject (with mandatory reason), or cancel reservations.
* Lazy Loading: Efficient loading of modules and routes for optimal performance.

## 📂 Folder Layout

The project follows a modular architecture based on "Features" to keep the code scalable and organized:

src/
├── app/
│   ├── core/                 # Global elements (Guards, Interceptors, Tokens)
│   │   └── models/           # Centralized Interfaces and Enums (Users, Reservations, etc.)
│   │
│   ├── auth/                 # Authentication Module (Login, Password Recovery)
│   │
│   ├── dashboard/            # Main Layout (Sidebar, Topbar)
│   │   └── pages/            # Main views of the application
│   │       ├── reservations/ # Calendar logic, tables, and modals
│   │       ├── halls/        # Halls CRUD
│   │       ├── groups/       # Groups/Subjects CRUD
│   │       ├── users/        # User Management (Admins only)
│   │       └── profile/      # Current user profile
│   │
│   └── app.routes.ts         # Main route definitions
│
├── environments/             # Environment variables (Development and Production)
├── assets/                   # Images, icons, and static files
└── styles.scss               # Global styles and CSS reset
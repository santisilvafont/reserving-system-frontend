# 📅 Reserving System - Frontend

A modern and reactive system for managing room and space reservations, designed with a focus on user experience (UX) and a clean architecture.

This project represents the user interface (Frontend), allowing professors and administrators to manage schedules, view real-time availability through an interactive calendar, and manage halls, groups, and users.

<p align="center">
  <a href="https://angular.dev/" target="blank">
    <img src="https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png" width="200" alt="Angular Logo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Sass-%23CC6699.svg?style=for-the-badge&logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/RxJS-%23B7178C.svg?style=for-the-badge&logo=reactivex&logoColor=white" alt="RxJS" />
</p>

---

<div align="center">

## 🛠️ Tech Stack

| Category | Technology Used |
| :--- | :--- |
| **Core Framework** | **Angular 18+** (Standalone Components) |
| **Language** | **TypeScript** |
| **Styling** | **SCSS** (Custom Properties & Responsive Design) |
| **State & Async** | **RxJS** & Angular Signals |
| **Forms** | **Reactive Forms** |
| **Interactive Calendar**| **FullCalendar** (dayGrid, timeGrid, interaction) |

</div>
<br>

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

The project follows a modular architecture based on "Features" to keep the code scalable, organized, and easy to maintain. All core logic and features are encapsulated within the `src` directory:

```bash
📂 src/
├── 📂 app/
│   ├── 📂 auth/                 # Authentication Module
│   │   ├── 📂 forgot-password/  # Password recovery flow
│   │   ├── 📂 guards/           # Route protection (e.g., auth.guard)
│   │   ├── 📂 interceptors/     # HTTP request manipulation (token injection)
│   │   ├── 📂 login/            # User authentication and token retrieval
│   │   └── 📂 register/         # New user creation
│   │
│   ├── 📂 core/                 # Global configurations and definitions
│   │   └── 📂 models/           # Centralized Interfaces and Enums
│   │
│   ├── 📂 dashboard/            # Main Layout and Core Features
│   │   └── 📂 pages/            # Application views (each includes its own service)
│   │       ├── 📂 groups/       # Groups/Subjects CRUD operations
│   │       ├── 📂 halls/        # Halls CRUD operations
│   │       ├── 📂 profile/      # Current user profile and settings
│   │       ├── 📂 reservations/ # Calendar logic, tables, and modal interactions
│   │       └── 📂 users/        # User Management (Admins only)
│   │
│   ├── 📄 app.routes.ts         # Main route definitions
│   └── 📄 app.config.ts         # Application global configuration
│
├── 📂 environments/             # Environment variables (Development and Production)
├── 📂 public/                   # Public static assets (favicon.ico)
└── 📄 styles.scss               # Global styles, CSS variables, and resets
```
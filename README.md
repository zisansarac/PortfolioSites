
# Portfolio & Modular Content Platform

This is a modern, full-stack web application designed to serve as a high-performance portfolio and content management system. The platform is built around a robust, secure API layer in C# and a highly responsive single-page application (SPA) using React.

## Key Features

* **Full User Authentication:** Secure registration, login, and authorization using ASP.NET Core Identity/JWT tokens.
* **Profile Management:** Users can update their full name, bio, and upload/manage their profile avatar.
* **Dynamic Content Creation:** Users can create, update, and delete portfolio posts with secure slug generation.
* **Seamless Data Sync:** Real-time synchronization of user profile data (like avatars and bio) between the Auth Context and content views.
* **Responsive UI:** Modern, card-based interface built with **React** and styled with **Tailwind CSS**.

  <br>

## Tech Stack

### Backend (API)
* **Language:** C#
* **Framework:** ASP.NET Core (Web API)
* **ORM/Data:** Entity Framework Core
* **Authentication:** ASP.NET Core Identity with JWT (JSON Web Tokens)
* **Data Transfer:** DTOs (Data Transfer Objects)

### Frontend (Client)
* **Language:** TypeScript
* **Framework:** React
* **Styling:** Tailwind CSS (for rapid, utility-first styling)
* **Routing:** React Router DOM
* **State Management:** React Context API (for global authentication/user state)

<br>

## Getting Started

### Prerequisites

* .NET SDK (v6.0 or newer)
* Node.js (v18 or newer) & npm/yarn

### Backend Setup

1.  Navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
2.  Run migrations to create or update the database schema:
    ```bash
    dotnet ef database update
    ```
3.  Start the API server:
    ```bash
    dotnet run
    ```

### Frontend Setup

1.  Navigate to the `Frontend` directory:
    ```bash
    cd ../Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or yarn install
    ```
3.  Start the React application:
    ```bash
    npm start
    # or yarn start
    ```

# MediBook 

MediBook is a modern, full-stack web application designed for seamless doctor appointment booking and healthcare management. It features a professional patient portal for discovering doctors and booking visits, alongside a robust administrative dashboard for managing the medical directory and overseeing schedules.

## 🌟 Key Features

### For Patients
- **Discover Doctors:** Browse a comprehensive directory of medical professionals filtered by specialty, rating, and experience.
- **Instant Booking:** Pick available time slots and book appointments instantly with no hassle.
- **Patient Dashboard:** Manage upcoming visits, view past appointments, reschedule slots, or cancel bookings.
- **Secure Authentication:** Secure account creation, login, and profile management.

### For Administrators
- **System Overview:** At-a-glance metrics including total doctors, daily bookings, and confirmed appointments.
- **Doctor Management:** Full CRUD (Create, Read, Update, Delete) capabilities to manage the doctor directory.
- **Appointment Tracking:** Filter and view all platform appointments by status (pending, confirmed, cancelled) and by specific doctors.
- **Patient Directory:** View all registered patients and their visit history.

## 🛠️ Technology Stack

**Frontend**
- React 19
- Vite
- TanStack Router (for type-safe routing)
- Tailwind CSS v4 (Styling & Layout)
- UI Components: Radix UI primitives + custom design system
- Icons: Lucide React
- State: Custom Context API with async backend integration

**Backend**
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JSON Web Tokens (JWT) for Authentication
- bcryptjs for password hashing

---

## 🚀 Setup Guidelines

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB Database (Local or MongoDB Atlas cluster)

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd care-connect-main
\`\`\`

### 2. Backend Setup
Navigate to the \`server\` directory and install dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

Create a \`.env\` file in the \`server\` directory with the following variables:
\`\`\`env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
\`\`\`

*(Optional)* Seed the database with demo data (doctors, appointments, admin account):
\`\`\`bash
node seed.js
\`\`\`

Start the backend server:
\`\`\`bash
node index.js
# Or use: npm start
\`\`\`
The backend will run on \`http://localhost:5001\`.

### 3. Frontend Setup
Open a new terminal window, navigate to the project root, and install dependencies:
\`\`\`bash
# From the project root (care-connect-main)
npm install
\`\`\`

Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`
The frontend will run on \`http://localhost:8080\` (or whichever port Vite assigns).

---

## 📖 Architecture & How It Works

### The Data Flow
1. **Frontend Store:** The React frontend uses a centralized context (\`src/lib/store.tsx\`) to manage global state (the authenticated user, loaded doctors, and appointments).
2. **API Communication:** All actions in the frontend store (logging in, booking an appointment, fetching doctors) are translated into asynchronous \`fetch()\` requests to the Express backend.
3. **Authentication:** When a user logs in, the backend returns a JWT. The frontend stores this token in \`localStorage\` and attaches it to the \`Authorization\` header (as a Bearer token) for all subsequent protected API requests.
4. **Backend Processing:** Express routes (\`server/routes/\`) intercept the requests, validate the JWT via middleware (\`server/middleware/auth.js\`), interact with MongoDB using Mongoose models (\`server/models/\`), and return JSON responses.

### Folder Structure
- \`/server\` - The complete Node.js backend application.
  - \`/config\` - Database connection logic.
  - \`/models\` - Mongoose schemas (User, Doctor, Appointment, Contact).
  - \`/routes\` - Express API route definitions.
  - \`/middleware\` - Authentication and role-based access control.
- \`/src\` - The complete React frontend application.
  - \`/components\` - Reusable UI components (buttons, dialogs, avatars, layouts).
  - \`/lib\` - State management (\`store.tsx\`), utilities, and type definitions.
  - \`/routes\` - TanStack file-based routing components (pages).

## 📄 API Documentation
For detailed information on the backend REST API endpoints, request payloads, and responses, please refer to the [API_DOCS.md](./API_DOCS.md) file.

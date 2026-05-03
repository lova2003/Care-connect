# MediBook API Documentation

The MediBook backend exposes a RESTful API running by default on \`http://localhost:5001/api\`. All endpoints that require authentication expect a valid JSON Web Token (JWT) in the \`Authorization\` header.

**Authentication Header Format:**
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

---

## 1. Authentication (\`/api/auth\`)

### Register a new user
- **URL:** \`/api/auth/signup\`
- **Method:** \`POST\`
- **Auth Required:** No
- **Request Body:**
  \`\`\`json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "patient" // Optional, defaults to patient. Only 'patient' or 'admin'.
  }
  \`\`\`
- **Success Response (201 Created):**
  Returns the user profile and a JWT token.

### Log in
- **URL:** \`/api/auth/login\`
- **Method:** \`POST\`
- **Auth Required:** No
- **Request Body:**
  \`\`\`json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  \`\`\`
- **Success Response (200 OK):**
  Returns the user profile and a JWT token.

### Get Current User Profile
- **URL:** \`/api/auth/me\`
- **Method:** \`GET\`
- **Auth Required:** Yes
- **Success Response (200 OK):**
  Returns the user object corresponding to the provided JWT.

### Update User Profile
- **URL:** \`/api/auth/profile\`
- **Method:** \`PUT\`
- **Auth Required:** Yes
- **Request Body:**
  \`\`\`json
  {
    "name": "Johnathan Doe",
    "phone": "+1 555-0198"
  }
  \`\`\`
- **Success Response (200 OK):**
  Returns the updated user object.

---

## 2. Doctors (\`/api/doctors\`)

### Get All Doctors
- **URL:** \`/api/doctors\`
- **Method:** \`GET\`
- **Auth Required:** No
- **Success Response (200 OK):**
  Returns an array of all available doctor objects.

### Create a Doctor
- **URL:** \`/api/doctors\`
- **Method:** \`POST\`
- **Auth Required:** Yes (Admin Only)
- **Request Body:**
  \`\`\`json
  {
    "name": "Dr. Sarah Smith",
    "specialty": "Cardiology",
    "experience": 12,
    "rating": 4.9,
    "bio": "Expert cardiologist specializing in...",
    "qualifications": ["MD", "FACC"],
    "available": true,
    "fee": 150
  }
  \`\`\`

### Update a Doctor
- **URL:** \`/api/doctors/:id\`
- **Method:** \`PUT\`
- **Auth Required:** Yes (Admin Only)
- **Request Body:** Any subset of the Doctor fields.

### Delete a Doctor
- **URL:** \`/api/doctors/:id\`
- **Method:** \`DELETE\`
- **Auth Required:** Yes (Admin Only)

---

## 3. Appointments (\`/api/appointments\`)

### Get Appointments
- **URL:** \`/api/appointments\`
- **Method:** \`GET\`
- **Auth Required:** Yes
- **Description:** 
  - If the user is an **admin**, returns *all* appointments in the system.
  - If the user is a **patient**, returns *only* their own appointments.
- **Success Response (200 OK):** Array of appointment objects.

### Book an Appointment
- **URL:** \`/api/appointments\`
- **Method:** \`POST\`
- **Auth Required:** Yes
- **Request Body:**
  \`\`\`json
  {
    "doctorId": "65ab...cdef",
    "date": "2026-05-15", // Format: YYYY-MM-DD
    "time": "10:00"       // Format: HH:mm
  }
  \`\`\`
- **Logic:** The backend automatically prevents double-booking. If the requested \`doctorId\` already has an appointment at the exact \`date\` and \`time\` (that is not cancelled), it will return a \`400 Bad Request\` error.

### Update Appointment Status (Reschedule/Cancel)
- **URL:** \`/api/appointments/:id\`
- **Method:** \`PUT\`
- **Auth Required:** Yes
- **Description:** Only the patient who owns the appointment, or an admin, can update it.
- **Request Body (To Reschedule):**
  \`\`\`json
  {
    "date": "2026-05-16",
    "time": "14:30"
  }
  \`\`\`
- **Request Body (To Cancel):**
  \`\`\`json
  {
    "status": "cancelled"
  }
  \`\`\`

---

## 4. Contact & Support (\`/api/contact\`)

### Submit Contact Form
- **URL:** \`/api/contact\`
- **Method:** \`POST\`
- **Auth Required:** No
- **Request Body:**
  \`\`\`json
  {
    "name": "Jane Patient",
    "email": "jane@example.com",
    "subject": "Billing Question",
    "message": "I have a question about my recent bill..."
  }
  \`\`\`
- **Success Response (201 Created):**
  Saves the inquiry to the database for administrative review.

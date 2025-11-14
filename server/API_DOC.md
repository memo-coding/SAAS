# School System API Documentation

## Authentication

### POST /api/auth/register
- Register a new user (Users only, or by Admin/SuperAdmin)
- Body: `{ name, email, password, phone, address, role }`
- Returns: JWT token, user info

### POST /api/auth/login
- Login with email and password
- Body: `{ email, password }`
- Returns: JWT token, user info

---

## Users

### GET /api/users/
- Get all users (Admin/SuperAdmin only)

### GET /api/users/:id
- Get specific user (self or Admin/SuperAdmin)

### PUT /api/users/:id
- Update user info

### DELETE /api/users/:id
- Delete user (Admin/SuperAdmin only)

---

## Classes

### GET /api/classes/
- Get all classes

### GET /api/classes/:id
- Get specific class

### POST /api/classes/
- Create class (Admin/SuperAdmin only)
- Body: `{ name, teacher }`

### PUT /api/classes/:id
- Update class (Admin/SuperAdmin/Teacher only)

### DELETE /api/classes/:id
- Delete class (Admin/SuperAdmin only)

---

## Models

### User
- name: String
- email: String
- password: String
- phone: String
- address: String
- subscriptionStatus: 'paid' | 'unpaid' | 'pending'
- role: 'Admin' | 'SuperAdmin' | 'Teacher' | 'User'

### Class
- name: String
- teacher: ObjectId (User)

---

## Notes
- All endpoints (except register/login) require JWT authentication
- Use the `Authorization: Bearer <token>` header
- Role-based access enforced on sensitive endpoints
- Roles and permissions:
  - SuperAdmin: Full system access
  - Admin: System management and user administration
  - Teacher: Class management and student interaction
  - User: Basic access and profile management

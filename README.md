# Customer Support Dashboard

A modern, full-stack customer support ticket management system built with Django REST Framework and React. This application provides role-based access control for customers, agents, and administrators to manage support tickets efficiently.

## 🚀 Features

- **Role-Based Authentication**: Customer, Agent, and Admin roles with specific permissions
- **Modern Dashboard**: Beautiful, responsive dashboard with real-time statistics
- **Ticket Management**: Create, view, update, and resolve support tickets
- **Agent Assignment**: Admins can assign tickets to specific agents
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **JWT Authentication**: Secure token-based authentication with refresh tokens

## 🛠 Tech Stack

### Backend
- **Django 5.1.5** - Web framework
- **Django REST Framework 3.15.2** - API framework
- **Django REST Framework SimpleJWT 5.3.0** - JWT authentication
- **Django CORS Headers 4.6.0** - Cross-origin resource sharing
- **Python Decouple 3.8** - Environment variable management
- **bcrypt 4.2.1** - Password hashing
- **PostgreSQL/SQLite** - Database

### Frontend
- **React 19.2.0** - UI library
- **React Router DOM 7.13.0** - Client-side routing
- **Axios 1.7.9** - HTTP client
- **Vite 7.2.4** - Build tool and dev server
- **Pure CSS** - Modern styling without frameworks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd customer-support-dashboard
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here-make-it-long-and-random
DATABASE_URL=sqlite:///db.sqlite3

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT Configuration
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=1440

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Sample Data (Optional)
```bash
python manage.py create_sample_data
```

This creates:
- **Admin User**: username: `admin`, password: `admin123`
- **Agent User**: username: `agent`, password: `agent123`
- **Customer User**: username: `customer`, password: `customer123`
- Sample tickets with various statuses

#### Start Backend Server
```bash
python manage.py runserver 8001
```

The backend API will be available at `http://localhost:8001/api/`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../frontend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8001/api
```

#### Start Frontend Development Server
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173/`

## 🔐 User Roles & Permissions

### Customer
- Create support tickets
- View their own tickets
- Add responses to their tickets
- Mark their tickets as resolved

### Agent
- View tickets assigned to them
- Add responses to assigned tickets
- Update status of assigned tickets
- Cannot see unassigned or other agents' tickets

### Admin
- View all tickets
- Assign tickets to agents
- Update any ticket status
- Manage user accounts
- Access to admin dashboard with full statistics

## 📚 API Documentation

### Base URL
```
http://localhost:8001/api/
```

### Authentication Endpoints

#### 1. User Registration
**POST** `/auth/register/`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "customer|agent|admin"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "customer",
    "created_at": "2026-02-04T16:12:05.186303Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "username": ["This field is required."],
  "email": ["Enter a valid email address."],
  "password": ["This password is too short."],
  "password_confirm": ["Passwords do not match."]
}
```

#### 2. User Login
**POST** `/auth/login/`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "customer",
    "created_at": "2026-02-04T16:12:05.186303Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "non_field_errors": ["Invalid credentials."]
}
```

#### 3. Token Refresh
**POST** `/auth/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. User Logout
**POST** `/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### 5. Get User Profile
**GET** `/auth/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-02-04T16:12:05.186303Z"
}
```

### Ticket Management Endpoints

#### 1. List/Create Tickets
**GET** `/tickets/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (open, in_progress, resolved, closed)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `page` (optional): Page number for pagination

**Response (200 OK):**
```json
{
  "count": 25,
  "next": "http://localhost:8001/api/tickets/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Login Issue",
      "description": "Cannot login to my account",
      "status": "open",
      "priority": "high",
      "customer": {
        "id": 2,
        "username": "customer",
        "email": "customer@example.com",
        "first_name": "Customer",
        "last_name": "User",
        "full_name": "Customer User"
      },
      "assigned_agent": {
        "id": 3,
        "username": "agent",
        "email": "agent@example.com",
        "first_name": "Agent",
        "last_name": "User",
        "full_name": "Agent User"
      },
      "responses": [
        {
          "id": 1,
          "message": "We're looking into this issue.",
          "user": {
            "id": 3,
            "username": "agent",
            "full_name": "Agent User",
            "role": "agent"
          },
          "created_at": "2026-02-04T16:15:00.000Z"
        }
      ],
      "created_at": "2026-02-04T16:12:05.186303Z",
      "updated_at": "2026-02-04T16:15:00.000Z"
    }
  ]
}
```

**POST** `/tickets/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Only customers can create tickets

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "Cannot login to my account",
  "status": "open",
  "priority": "high",
  "customer": {
    "id": 2,
    "username": "customer",
    "email": "customer@example.com",
    "first_name": "Customer",
    "last_name": "User",
    "full_name": "Customer User"
  },
  "assigned_agent": null,
  "responses": [],
  "created_at": "2026-02-04T16:12:05.186303Z",
  "updated_at": "2026-02-04T16:12:05.186303Z"
}
```

#### 2. Retrieve/Update/Delete Ticket
**GET** `/tickets/{id}/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:**
- Customers: Can only view their own tickets
- Agents: Can only view tickets assigned to them
- Admins: Can view all tickets

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "Cannot login to my account",
  "status": "open",
  "priority": "high",
  "customer": {
    "id": 2,
    "username": "customer",
    "email": "customer@example.com",
    "first_name": "Customer",
    "last_name": "User",
    "full_name": "Customer User"
  },
  "assigned_agent": {
    "id": 3,
    "username": "agent",
    "email": "agent@example.com",
    "first_name": "Agent",
    "last_name": "User",
    "full_name": "Agent User"
  },
  "responses": [
    {
      "id": 1,
      "message": "We're looking into this issue.",
      "user": {
        "id": 3,
        "username": "agent",
        "full_name": "Agent User",
        "role": "agent"
      },
      "created_at": "2026-02-04T16:15:00.000Z"
    }
  ],
  "created_at": "2026-02-04T16:12:05.186303Z",
  "updated_at": "2026-02-04T16:15:00.000Z"
}
```

**PATCH** `/tickets/{id}/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:**
- Customers: Can only mark their own tickets as resolved
- Agents: Can update status of assigned tickets
- Admins: Can update any ticket

**Request Body:**
```json
{
  "status": "open|in_progress|resolved|closed"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "Cannot login to my account",
  "status": "resolved",
  "priority": "high",
  "customer": {...},
  "assigned_agent": {...},
  "responses": [...],
  "created_at": "2026-02-04T16:12:05.186303Z",
  "updated_at": "2026-02-04T16:20:00.000Z"
}
```

#### 3. Add Response to Ticket
**POST** `/tickets/{id}/responses/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:**
- Customers: Can respond to their own tickets
- Agents: Can respond to assigned tickets
- Admins: Can respond to any ticket

**Request Body:**
```json
{
  "message": "string"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "message": "Thank you for looking into this. I've tried the suggested steps.",
  "user": {
    "id": 2,
    "username": "customer",
    "full_name": "Customer User",
    "role": "customer"
  },
  "created_at": "2026-02-04T16:25:00.000Z"
}
```

#### 4. Assign Agent to Ticket (Admin Only)
**POST** `/tickets/{id}/assign/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Admin only

**Request Body:**
```json
{
  "agent_id": 3
}
```

**To unassign:**
```json
{
  "agent_id": null
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "Cannot login to my account",
  "status": "open",
  "priority": "high",
  "customer": {...},
  "assigned_agent": {
    "id": 3,
    "username": "agent",
    "email": "agent@example.com",
    "first_name": "Agent",
    "last_name": "User",
    "full_name": "Agent User"
  },
  "responses": [...],
  "created_at": "2026-02-04T16:12:05.186303Z",
  "updated_at": "2026-02-04T16:30:00.000Z"
}
```

#### 5. Get Available Agents (Admin Only)
**GET** `/tickets/agents/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Admin only

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "first_name": "Agent",
    "last_name": "User",
    "email": "agent@example.com"
  },
  {
    "id": 4,
    "first_name": "Another",
    "last_name": "Agent",
    "email": "agent2@example.com"
  }
]
```

#### 6. Dashboard Statistics
**GET** `/tickets/stats/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Customer Response (200 OK):**
```json
{
  "total_tickets": 5,
  "open_tickets": 2,
  "resolved_tickets": 2,
  "closed_tickets": 1
}
```

**Agent Response (200 OK):**
```json
{
  "total_tickets": 8,
  "open_tickets": 3,
  "in_progress_tickets": 2,
  "resolved_tickets": 3,
  "assigned_to_me": 8
}
```

**Admin Response (200 OK):**
```json
{
  "total_tickets": 25,
  "open_tickets": 10,
  "in_progress_tickets": 8,
  "resolved_tickets": 5,
  "unassigned_tickets": 3
}
```

## 🔒 Authentication & Security

### JWT Token Structure
The application uses JWT tokens for authentication with the following structure:

**Access Token:**
- **Lifetime:** 60 minutes (configurable)
- **Purpose:** API authentication
- **Storage:** Memory/localStorage (frontend)

**Refresh Token:**
- **Lifetime:** 24 hours (configurable)
- **Purpose:** Obtaining new access tokens
- **Storage:** localStorage (frontend)

### Security Headers
All authenticated requests must include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

## 🚨 Error Handling

### HTTP Status Codes
- **200 OK** - Successful GET, PATCH, PUT requests
- **201 Created** - Successful POST requests
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Validation Errors
```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"]
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 🚀 Production Deployment

### Backend Deployment
1. Set `DEBUG=False` in production
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Use environment variables for sensitive data
5. Configure static file serving
6. Set up proper logging

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the `dist` folder using a web server
3. Configure API URL for production environment

## 📁 Project Structure

```
customer-support-dashboard/
├── backend/
│   ├── authentication/          # User authentication app
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── create_sample_data.py
│   │   ├── migrations/
│   │   ├── models.py           # User model
│   │   ├── serializers.py      # API serializers
│   │   ├── views.py           # Authentication views
│   │   └── urls.py            # Authentication URLs
│   ├── tickets/               # Ticket management app
│   │   ├── migrations/
│   │   ├── models.py          # Ticket and Response models
│   │   ├── serializers.py     # Ticket serializers
│   │   ├── views.py          # Ticket views
│   │   ├── permissions.py     # Custom permissions
│   │   └── urls.py           # Ticket URLs
│   ├── config/               # Django configuration
│   │   ├── settings.py       # Django settings
│   │   ├── urls.py          # Main URL configuration
│   │   └── wsgi.py          # WSGI configuration
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py            # Django management script
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Shared components
│   │   │   └── tickets/     # Ticket-related components
│   │   ├── context/         # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.js      # Vite configuration
│   └── .env               # Environment variables
└── README.md              # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Include error messages, screenshots, and steps to reproduce

## 🔄 Version History

- **v1.0.0** - Initial release with full ticket management system
- **v1.1.0** - Added agent assignment functionality
- **v1.2.0** - Modern dashboard redesign and latest software updates

---

**Built with ❤️ using Django and React**
# API Documentation

## Overview

This document provides comprehensive documentation for the Customer Support Dashboard API. The API is built using Django REST Framework and provides endpoints for user authentication, ticket management, and administrative functions.

## Base URL

```
http://localhost:8001/api/
```

## Authentication

The API uses JWT (JSON Web Token) authentication. All protected endpoints require a valid access token in the Authorization header.

### Token Types

1. **Access Token**: Short-lived token (60 minutes) used for API requests
2. **Refresh Token**: Long-lived token (24 hours) used to obtain new access tokens

### Authentication Header Format

```
Authorization: Bearer <access_token>
```

## Content Type

All requests should include the following header:

```
Content-Type: application/json
```

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Validation Error Format

```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"]
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PATCH, PUT requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Validation errors or malformed requests
- `401 Unauthorized` - Authentication required or token invalid
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Authentication Endpoints

### 1. User Registration

Register a new user account.

**Endpoint:** `POST /auth/register/`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer"
}
```

**Field Validations:**
- `username`: Required, unique, 3-150 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `password_confirm`: Required, must match password
- `first_name`: Required, maximum 30 characters
- `last_name`: Required, maximum 30 characters
- `role`: Required, choices: "customer", "agent", "admin"

**Success Response (201 Created):**
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

**Error Response (400 Bad Request):**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["Enter a valid email address."],
  "password": ["This password is too short. It must contain at least 8 characters."],
  "password_confirm": ["Passwords do not match."]
}
```

### 2. User Login

Authenticate user and receive access tokens.

**Endpoint:** `POST /auth/login/`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
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

### 3. Token Refresh

Obtain a new access token using a refresh token.

**Endpoint:** `POST /auth/token/refresh/`

**Authentication:** Not required

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

### 4. User Logout

Invalidate the refresh token (logout).

**Endpoint:** `POST /auth/logout/`

**Authentication:** Required

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

**Success Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

### 5. Get User Profile

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /auth/profile/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
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

## Ticket Management Endpoints

### 1. List Tickets

Retrieve a list of tickets based on user role and permissions.

**Endpoint:** `GET /tickets/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`open`, `in_progress`, `resolved`, `closed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`, `urgent`)
- `page` (optional): Page number for pagination (default: 1)
- `page_size` (optional): Number of items per page (default: 20)

**Permission Rules:**
- **Customers**: See only their own tickets
- **Agents**: See only tickets assigned to them
- **Admins**: See all tickets

**Success Response (200 OK):**
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

### 2. Create Ticket

Create a new support ticket.

**Endpoint:** `POST /tickets/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Customers**: Can create tickets
- **Agents**: Cannot create tickets
- **Admins**: Cannot create tickets

**Request Body:**
```json
{
  "title": "Login Issue",
  "description": "I cannot login to my account. I've tried resetting my password but still can't access my account.",
  "priority": "high"
}
```

**Field Validations:**
- `title`: Required, maximum 200 characters
- `description`: Required, minimum 10 characters
- `priority`: Required, choices: "low", "medium", "high", "urgent"

**Success Response (201 Created):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "I cannot login to my account. I've tried resetting my password but still can't access my account.",
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

**Error Response (403 Forbidden):**
```json
{
  "error": "Permission denied"
}
```

### 3. Retrieve Ticket

Get details of a specific ticket.

**Endpoint:** `GET /tickets/{id}/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Customers**: Can only view their own tickets
- **Agents**: Can only view tickets assigned to them
- **Admins**: Can view all tickets

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "I cannot login to my account. I've tried resetting my password but still can't access my account.",
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

**Error Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

### 4. Update Ticket Status

Update the status of a ticket.

**Endpoint:** `PATCH /tickets/{id}/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Customers**: Can only mark their own tickets as "resolved"
- **Agents**: Can update status of assigned tickets to any valid status
- **Admins**: Can update any ticket to any valid status

**Request Body:**
```json
{
  "status": "resolved"
}
```

**Valid Status Values:**
- `open`: Ticket is newly created or reopened
- `in_progress`: Agent is working on the ticket
- `resolved`: Issue has been resolved
- `closed`: Ticket is closed and archived

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "I cannot login to my account. I've tried resetting my password but still can't access my account.",
  "status": "resolved",
  "priority": "high",
  "customer": {...},
  "assigned_agent": {...},
  "responses": [...],
  "created_at": "2026-02-04T16:12:05.186303Z",
  "updated_at": "2026-02-04T16:20:00.000Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Permission denied"
}
```

### 5. Add Response to Ticket

Add a response/comment to a ticket.

**Endpoint:** `POST /tickets/{id}/responses/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Customers**: Can respond to their own tickets
- **Agents**: Can respond to assigned tickets
- **Admins**: Can respond to any ticket

**Request Body:**
```json
{
  "message": "Thank you for looking into this. I've tried the suggested steps and the issue is now resolved."
}
```

**Field Validations:**
- `message`: Required, minimum 5 characters, maximum 2000 characters

**Success Response (201 Created):**
```json
{
  "id": 2,
  "message": "Thank you for looking into this. I've tried the suggested steps and the issue is now resolved.",
  "user": {
    "id": 2,
    "username": "customer",
    "full_name": "Customer User",
    "role": "customer"
  },
  "created_at": "2026-02-04T16:25:00.000Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Permission denied"
}
```

### 6. Assign Agent to Ticket

Assign or unassign an agent to a ticket.

**Endpoint:** `POST /tickets/{id}/assign/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Admins**: Only admins can assign agents to tickets

**Request Body (Assign Agent):**
```json
{
  "agent_id": 3
}
```

**Request Body (Unassign Agent):**
```json
{
  "agent_id": null
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Login Issue",
  "description": "I cannot login to my account. I've tried resetting my password but still can't access my account.",
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

**Error Response (403 Forbidden):**
```json
{
  "error": "Permission denied"
}
```

**Error Response (404 Not Found - Invalid Agent):**
```json
{
  "error": "Agent not found"
}
```

### 7. Get Available Agents

Retrieve a list of all agents for assignment purposes.

**Endpoint:** `GET /tickets/agents/`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permission Rules:**
- **Admins**: Only admins can view the list of agents

**Success Response (200 OK):**
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

**Error Response (403 Forbidden):**
```json
{
  "error": "Permission denied"
}
```

### 8. Dashboard Statistics

Get dashboard statistics based on user role.

**Endpoint:** `GET /tickets/stats/`

**Authentication:** Required

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

## Data Models

### User Model

```json
{
  "id": "integer",
  "username": "string (unique)",
  "email": "string (unique)",
  "first_name": "string",
  "last_name": "string",
  "full_name": "string (computed)",
  "role": "string (customer|agent|admin)",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### Ticket Model

```json
{
  "id": "integer",
  "title": "string",
  "description": "text",
  "status": "string (open|in_progress|resolved|closed)",
  "priority": "string (low|medium|high|urgent)",
  "customer": "User object",
  "assigned_agent": "User object (nullable)",
  "responses": "array of TicketResponse objects",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### TicketResponse Model

```json
{
  "id": "integer",
  "message": "text",
  "user": "User object",
  "ticket": "integer (ticket ID)",
  "created_at": "datetime"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse:

- Authentication endpoints: 5 requests per minute per IP
- Ticket creation: 10 requests per hour per user
- General API endpoints: 100 requests per minute per user

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Pagination response format:
```json
{
  "count": 100,
  "next": "http://localhost:8001/api/tickets/?page=3",
  "previous": "http://localhost:8001/api/tickets/?page=1",
  "results": [...]
}
```

## Testing the API

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:8001/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

**Create a ticket:**
```bash
curl -X POST http://localhost:8001/api/tickets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Test Issue",
    "description": "This is a test ticket",
    "priority": "medium"
  }'
```

**Get tickets:**
```bash
curl -X GET http://localhost:8001/api/tickets/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Use the authentication endpoints to get tokens
4. Test all endpoints with different user roles

## Security Considerations

1. **Token Security**: Store tokens securely on the client side
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Implement proper token refresh logic
4. **Input Validation**: All inputs are validated on the server side
5. **SQL Injection**: Django ORM provides protection against SQL injection
6. **XSS Protection**: Ensure proper output encoding on the frontend
7. **CORS**: Configure CORS properly for production domains

## Changelog

### Version 1.2.0
- Added agent assignment functionality
- Updated to Django 5.1.5 and latest dependencies
- Improved error handling and validation
- Added comprehensive API documentation

### Version 1.1.0
- Added ticket status update functionality
- Implemented role-based permissions
- Added dashboard statistics endpoint

### Version 1.0.0
- Initial API implementation
- User authentication with JWT
- Basic ticket management
- Role-based access control
# E-commerce API

Welcome to the E-commerce API repository. This API provides a set of endpoints to manage developers, organizations, products, and user authentication for an e-commerce platform. The API is designed to be easy to use and integrate with your existing systems, providing robust functionality for managing various aspects of an e-commerce application.

## Table of Contents

- [Introduction](#introduction)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Key Features](#key-features)
- [Technology Used](#technology-used)
- [Workflow](#workflow)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Developer Management](#developer-management)
  - [App Management](#app-management)
  - [User Management](#user-management)
- [Example Requests](#example-requests)
- [Contact](#contact)

## Introduction

Welcome to the E-commerce API documentation. This API provides a set of endpoints to manage developers, organizations, products, and user authentication for an e-commerce platform. The API is designed to be easy to use and integrate with your existing systems, providing robust functionality for managing various aspects of an e-commerce application.

## Base URL

All API endpoints are prefixed with the base URL:https://commercecore-user-auth-service.onrender.com/api


## Authentication

The API uses API tokens for authentication. Each developer is assigned a unique API token upon registration, which must be included in the headers of each request to authenticate the developer. Additionally, certain endpoints are restricted to specific services (e.g., product management, payment processes) and require a valid service token.

## Getting Started

To get started with the E-commerce API, follow these steps:

1. **Register a Developer**:
   Use the `/register` endpoint to create a new developer account and obtain an API token.

2. **Authenticate and Retrieve API Token**:
   Use the `/retrieve-token` endpoint to log in and retrieve your API token.

3. **Create an App**:
   Use the `/create` endpoint to create a new App.

## Key Features

- **Developer Management**: Register and manage developer accounts.
- **App Management**: Create and manage apps.
- **User Management**: Sign up, sign in, and sign out users.
- **Authentication**: Secure API token-based authentication.
- **Error Handling**: Standard HTTP status codes for error handling.
- **Rate Limiting**: Prevent abuse with rate limiting.

## Technology Used

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for Node.js.
- **Prisma**: ORM for database management.
- **Nodemailer**: Email sending library.
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Password hashing.

## Workflow

1. **Developer Registration**: Developers register and receive an API token.
2. **App Creation**: Developers create apps associated with their accounts.
3. **User Management**: Users sign up, sign in, and sign out.
4. **Authentication**: API tokens are used to authenticate requests.

## Security Features

- **API Token Authentication**: Secure access to endpoints using API tokens.
- **Password Hashing**: Secure storage of user passwords using bcrypt.
- **JWT**: Secure user sessions with JSON Web Tokens.
- **Environment Variables**: Secure configuration using environment variables.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. Common status codes include:
- **200 OK**: The request was successful.
- **201 Created**: The resource was successfully created.
- **400 Bad Request**: The request was invalid or missing required parameters.
- **401 Unauthorized**: Authentication failed or the user does not have permissions for the requested operation.
- **403 Forbidden**: The API token is invalid or inactive.
- **404 Not Found**: The requested resource was not found.
- **500 Internal Server Error**: An error occurred on the server.

## Rate Limiting

To ensure fair usage and prevent abuse, the API enforces rate limits on requests. If you exceed the rate limit, you will receive a **429 Too Many Requests** response. Please refer to the rate limit headers in the response for more details.

## Endpoints

### Developer Management

- **POST /register**: Register a new developer.
- **POST /retrieve-token**: Retrieve the developer's API token (login).
- **GET /validate-token**: Validate the developer's API token.

### App Management

- **POST /create**: Create a single app.
- **POST /create-multiple**: Create multiple apps.

### User Management

- **POST /signup**: Sign up a new user.
- **POST /signin**: Sign in an existing user.
- **POST /logout**: Sign out an existing user.

## Example Requests

Each endpoint in the documentation includes example requests and responses to help you understand how to use the API effectively. You can use tools like Postman to test the endpoints and integrate them into your application.

## Contact

If you have any questions or need further assistance, please contact our support team.

---

By following this overview, you should have a clear understanding of how to get started with the E-commerce API, the available endpoints, and how to authenticate and manage resources. This documentation aims to provide all the necessary information to integrate and use the API effectively.

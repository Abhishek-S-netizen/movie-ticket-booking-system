# Movie Ticket Booking System Web Application

This project involves developing a modern, full-stack Movie Ticket Booking System as outlined in the provided abstract. The system will feature a React frontend for dynamic user interactions and a Node.js backend for robust business logic, database management, and concurrency control.

## User Review Required

> [!IMPORTANT]
> The plan now includes the **MongoDB Database Schema Design**. Please review the collections and fields below. Let me know if you would like to add or change any fields before we begin coding.

**Database:** MongoDB Atlas (Cloud)

### Database Schema Design (MongoDB Collections)

Based on the requirements, I propose the following 6 collections (tables):

#### 1. `Users`
Stores both regular users and administrators.
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique)
- `phoneNumber`: String
- `password`: String (Hashed for security)
- `role`: String (Enum: `'user'`, `'admin'`) - defaults to `'user'`
- `createdAt`/`updatedAt`: Timestamps

#### 2. `Movies`
Stores details about the movies available for booking.
- `_id`: ObjectId
- `title`: String
- `description`: String
- `genre`: Array of Strings (e.g., `["Action", "Sci-Fi"]`)
- `duration`: Number (in minutes)
- `language`: String
- `ageRating`: String (e.g., "PG-13", "R", "U")
- `releaseDate`: Date
- `posterUrl`: String (URL to image)
- `trailerUrl`: String (URL to trailer)
- `createdAt`/`updatedAt`: Timestamps

#### 3. `Theatres`
Stores details about the physical theatres and their screens.
- `_id`: ObjectId
- `name`: String
- `location`: String
- `city`: String
- `screens`: Array of Objects
  - `screenNumber`: Number
  - `seatingCapacity`: Number
  - `seatLayout`: Object (Configuration of rows/columns and seat types like Standard vs Premium)

#### 4. `Shows`
Maps a movie to a specific theatre, screen, and time.
- `_id`: ObjectId
- `movieId`: ObjectId (Reference to `Movies`)
- `theatreId`: ObjectId (Reference to `Theatres`)
- `screenNumber`: Number
- `showTime`: Date (Date and Time of the show)
- `pricing`: Object (e.g., `{ standard: 15, premium: 25 }`)
- `createdAt`/`updatedAt`: Timestamps

#### 5. `SeatLocks` (Concurrency Control)
Handles the real-time seat locking mechanism to prevent double-booking. Uses MongoDB's TTL (Time-To-Live) index to automatically clear expired locks.
- `_id`: ObjectId
- `showId`: ObjectId (Reference to `Shows`)
- `seatNumber`: String (e.g., "A1")
- `userId`: ObjectId (Reference to `Users`)
- `expiresAt`: Date (e.g., 5 minutes after locking. MongoDB will auto-delete the document when this time passes).

#### 6. `Bookings`
Stores confirmed bookings and ticket details.
- `_id`: ObjectId
- `userId`: ObjectId (Reference to `Users`)
- `showId`: ObjectId (Reference to `Shows`)
- `seats`: Array of Strings (e.g., `["A1", "A2"]`)
- `totalAmount`: Number
- `paymentStatus`: String (Enum: `'Pending'`, `'Completed'`, `'Failed'`)
- `bookingStatus`: String (Enum: `'Confirmed'`, `'Cancelled'`)
- `createdAt`: Timestamps

### Role-Based Access Control (RBAC) & User Journeys

To ensure security and a tailored user experience, the application will enforce strictly defined roles:

#### 1. Normal (Unauthenticated) Users
- Can browse the homepage.
- Can view "**Now Showing**" and "**Coming Soon**" movie listings.
- Can click into a movie to view detailed information (synopsis, cast, ratings, trailers).
- *Cannot make bookings or access the seat selection screen.* They will be prompted to log in/register when attempting to book a ticket for a specific showtime.

#### 2. Logged-in Users
- Have all the permissions of a Normal User.
- Can access the seat selection interface and lock seats.
- Can successfully checkout, complete bookings, and view their generated tickets.
- Have a personalized dashboard to track past and upcoming bookings.

#### 3. Administrative Users (Admin Dashboard)
- Have total control over the platform's data.
- **Movie Management:** Tools to add new movies, edit existing details, or remove outdated movies.
- **Theatre Management:** Tools to onboard new theatres, define seat layouts, and remove theatres.
- **Show Timing Management:** Schedule shows linking movies, theatres, and times.
- **Analytics & Reporting:** Can monitor system activity, analyze booking trends across different regions/movies, and generate reports to optimize operational efficiency.

---

## Proposed Tech Stack & Architecture

### 1. User Application (Frontend - React)
- React via Vite with Vanilla CSS (Dark mode, glassmorphism, modern typography).
- Interactive seat selection UI.
- Context API for global state.

### 2. Admin Module (Frontend - React & Backend)
- Management interface for Movies, Theatres, and Shows.

### 3. Backend & Core Logic (Node.js)
- Express.js providing RESTful APIs.
- Mongoose for strict schema validation.
- JWT authentication and bcrypt for password hashing.

---

## Proposed Changes (Directory Structure)

We will structure the monorepo in `C:\Users\Acer\.gemini\antigravity\scratch\movie_booking`.

### `backend/`
- `server.js` - Express application entry point.
- `models/` - Mongoose schemas based on the collections above.
- `controllers/` - Logic for auth, booking operations, and admin actions.
- `routes/` - REST API endpoints.
- `middleware/` - JWT verification and RBAC.

### `frontend/`
- `src/App.jsx` - Main React entry routing.
- `src/pages/` - Home, MovieDetails, SeatSelection, Checkout, Login/Register, AdminDashboard.
- `src/components/` - Navbar, MovieCard, SeatLayout, Ticket.

## Open Questions

> [!WARNING]
> Please verify the Database Schema in the section above.

1. **Schema Approval:** Does the proposed Database Schema cover all the specific fields you need? Should we track any additional data (e.g., a mock "paymentId" or "booking QRCode")?

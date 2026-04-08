// Placeholder for Main App Layout
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import MyBookings from './pages/MyBookings/MyBookings';
import SeatSelection from './pages/SeatSelection/SeatSelection';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import Checkout from './pages/Checkout/Checkout';
import { useAuth } from './context/AuthContext';

// Placeholder pages (to be implemented)
const Placeholder = ({ name }) => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8fa3b8' }}>
        <p>{name} — coming soon</p>
    </div>
);

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="spinner" style={{ marginTop: '30vh' }} />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

/** Admin-only guard */
function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth();
    if (loading) return <div className="spinner" style={{ marginTop: '30vh' }} />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-h)' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Home />} />
                    <Route path="/movies/:id" element={<MovieDetails />} />
                    <Route path="/theatres" element={<Placeholder name="Theatres" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/shows/:id/seats" element={<SeatSelection />} />

                    <Route path="/checkout" element={
                        <ProtectedRoute><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/my-bookings" element={
                        <ProtectedRoute><MyBookings /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <AdminRoute><AdminDashboard /></AdminRoute>
                    } />
                    <Route path="/user-dashboard" element={
                        <ProtectedRoute><UserDashboard /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </>
    );
}

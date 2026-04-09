// Placeholder for Admin Dashboard
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useUIFeedback } from '../../context/UIFeedbackContent';
import {
    FiPieChart, FiFilm, FiMonitor, FiVideo, FiUsers,
    FiEdit2, FiTrash2, FiPlus, FiSettings, FiX, FiTrendingUp
} from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('analytics');

    const { showAlert } = useUIFeedback();

    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-layout fade-in">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Admin Panel</h2>
                    <p>CINEMAX CONTROL</p>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <FiPieChart /> Analytics
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <FiTrendingUp /> Revenue Tracker
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        <FiFilm /> Manage Movies
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'theatres' ? 'active' : ''}`}
                        onClick={() => setActiveTab('theatres')}
                    >
                        <FiMonitor /> Theatres & Screens
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'shows' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shows')}
                    >
                        <FiVideo /> Live Shows
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> User Control
                    </button>
                    <button className="admin-nav-item" onClick={() => showAlert("Settings opening...", "info")}>
                        <FiSettings /> Settings
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'revenue' && <RevenueTab />}
                {activeTab === 'movies' && <MoviesTab />}
                {activeTab === 'theatres' && <TheatresTab />}
                {activeTab === 'shows' && <ShowsTab />}
                {activeTab === 'users' && <UsersTab />}
            </main>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 1. Analytics Tab
 * ───────────────────────────────────────────────────────────────── */
function AnalyticsTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/analytics')
            .then(r => setData(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    const dummyData = { totalBookings: 0, totalRevenue: 0, activeUsers: 0 };
    const d = { ...dummyData, ...data };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <div>
                    <h1 className="admin-title">Cinema Inventory</h1>
                    <p className="admin-subtitle">Manage your digital cinematic library</p>
                </div>
            </header>

            <div className="admin-metrics">
                <div className="metric-card">
                    <h4>TOTAL BOOKINGS</h4>
                    <div className="metric-val">{(d.totalBookings || 0).toLocaleString()}</div>
                    <p className="metric-trend text-green">+ 14% vs last month</p>
                </div>
                <div className="metric-card">
                    <h4>REVENUE</h4>
                    <div className="metric-val text-cyan">${(d.totalRevenue || 0).toLocaleString()}</div>
                    <p className="metric-trend text-cyan">Optimized projection</p>
                </div>
                <div className="metric-card">
                    <h4>ACTIVE USERS</h4>
                    <div className="metric-val text-red">{(d.activeUsers || 0).toLocaleString()}</div>
                    <p className="metric-trend text-red">Live peak traffic</p>
                </div>
                <div className="metric-card">
                    <h4>TOTAL MOVIES</h4>
                    <div className="metric-val text-red">{(d.totalMovies || 0).toLocaleString()}</div>
                    <p className="metric-trend text-red">Movies</p>
                </div>
                <div className="metric-card">
                    <h4>TOTAL SHOWS</h4>
                    <div className="metric-val text-red">{(d.totalShows || 0).toLocaleString()}</div>
                    <p className="metric-trend text-red">Shows</p>
                </div>
                <div className="metric-card">
                    <h4>TOTAL THEATRES</h4>
                    <div className="metric-val text-red">{(d.totalTheatres || 0).toLocaleString()}</div>
                    <p className="metric-trend text-red">Theatres</p>
                </div>
            </div>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 2. Revenue Tracker Tab
 * ───────────────────────────────────────────────────────────────── */
function RevenueTab() {
    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/movies?isAdmin=true').then(r => setMovies(Array.isArray(r.data) ? r.data : []));
    }, []);

    const fetchStats = (id) => {
        if (!id) {
            setStats(null);
            return;
        }
        setLoading(true);
        api.get(`/admin/movies/${id}/stats`)
            .then(r => setStats(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    };

    const handleMovieChange = (e) => {
        const id = e.target.value;
        setSelectedMovieId(id);
        fetchStats(id);
    };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <div>
                    <h1 className="admin-title">Revenue Tracker</h1>
                    <p className="admin-subtitle">Analyze financial performance by movie</p>
                </div>
            </header>

            <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <div className="admin-form" style={{ maxWidth: '400px' }}>
                    <div className="form-group">
                        <label>Select Movie to Analyze</label>
                        <select value={selectedMovieId} onChange={handleMovieChange}>
                            <option value="">Choose a movie...</option>
                            {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="spinner" />
            ) : stats ? (
                <div className="admin-metrics">
                    <div className="metric-card">
                        <h4>CONFIRMED REVENUE</h4>
                        <div className="metric-val text-cyan">${stats.totalRevenue.toFixed(2)}</div>
                        <p className="metric-trend text-cyan">Net earnings</p>
                    </div>
                    <div className="metric-card">
                        <h4>CONFIRMED TICKETS</h4>
                        <div className="metric-val text-teal">{stats.confirmedCount}</div>
                        <p className="metric-trend text-teal">Sold out potential</p>
                    </div>
                    <div className="metric-card">
                        <h4>CANCELLED TICKETS</h4>
                        <div className="metric-val text-red">{stats.cancelledCount}</div>
                        <p className="metric-trend text-red">Released inventory</p>
                    </div>
                </div>
            ) : (
                <div className="mb-empty" style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="mb-empty__icon">📊</div>
                    <h3 className="mb-empty__title">Select a Movie</h3>
                    <p className="mb-empty__sub">Choose a movie from the dropdown to view its financial performance and booking data.</p>
                </div>
            )}
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 3. Movies Tab
 * ───────────────────────────────────────────────────────────────── */
function MoviesTab() {
    const { showAlert, showConfirm } = useUIFeedback();
    const [movies, setMovies] = useState([]);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMovies = () => api.get(`/admin/movies?page=${page}&limit=10`).then(r => {
        setMovies(r.data?.items || []);
        setTotalPages(r.data?.pagination?.pages || 1);
    });
    useEffect(() => { fetchMovies(); }, [page]);

    const handleDelete = async (id) => {
        const ok = await showConfirm({
            title: "Delete Movie",
            message: "Are you sure you want to delete this movie? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Keep it"
        });
        if (!ok) return;

        try {
            await api.delete(`/movies/${id}`);
            showAlert("Movie deleted successfully", "success");
            fetchMovies();
        } catch (e) {
            showAlert("Failed to delete movie.", "error");
        }
    };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <h1 className="admin-title">Movies Catalog</h1>
                <button className="btn-primary" onClick={() => setEditing({})}>
                    <FiPlus /> Add New Movie
                </button>
            </header>

            {editing && (
                <MovieForm
                    movie={editing}
                    onClose={() => setEditing(null)}
                    onSuccess={() => { setEditing(null); fetchMovies(); }}
                />
            )}

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>Poster</th><th>Movie Title</th><th>Genre</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {movies.map(m => (
                            <tr key={m._id}>
                                <td>
                                    <img src={m.posterUrl} alt="Poster" style={{ width: '40px', borderRadius: '4px' }} />
                                </td>
                                <td>
                                    <strong>{m.title}</strong>
                                    <div className="text-muted text-sm">{new Date(m.releaseDate).getFullYear()}</div>
                                </td>
                                <td>{m.genre?.join(', ')}</td>
                                <td>
                                    {m.isArchived ? (
                                        <span className="badge badge--outline">Archived</span>
                                    ) : (new Date(m.releaseDate) <= new Date() ? (
                                        <span className="badge badge--teal">Now Showing</span>
                                    ) : (
                                        <span className="badge badge--orange">Coming Soon</span>
                                    ))}
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => setEditing(m)} className="btn-icon"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(m._id)} className="btn-icon text-red"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingBottom: '1rem' }}>
                <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
}

function MovieForm({ movie, onClose, onSuccess }) {
    const { showAlert } = useUIFeedback();
    const isEdit = !!movie._id;
    const [form, setForm] = useState({
        title: movie.title || '',
        description: movie.description || '',
        language: movie.language || 'English',
        duration: movie.duration || 120,
        genre: movie.genre || [],
        ageRating: movie.ageRating || 'UA',
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl || '',
        trailerUrl: movie.trailerUrl || '',
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        rating: movie.rating || 0,
        isArchived: movie.isArchived || false
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) await api.put(`/movies/${movie._id}`, form);
            else await api.post('/movies', form);
            showAlert(`Movie ${isEdit ? 'updated' : 'added'} successfully`, "success");
            onSuccess();
        } catch (e) {
            const msg = e.response?.data?.message || "Failed to save movie.";
            showAlert(msg, "error");
            console.error(e);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal">
                <h3>{isEdit ? 'Edit Movie' : 'Add Movie'}</h3>
                <form onSubmit={onSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Movie Title</label>
                        <input required placeholder="Enter title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea required placeholder="Brief synopsis" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Language</label>
                            <input required placeholder="e.g. English" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Duration (mins)</label>
                            <input required type="number" placeholder="120" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Genre</label>
                            <input required placeholder="Action, Drama..." value={form.genre.join(', ')} onChange={e => setForm({ ...form, genre: e.target.value.split(',').map(s => s.trim()) })} />
                        </div>
                        <div className="form-group">
                            <label>Age Rating</label>
                            <select value={form.ageRating} onChange={e => setForm({ ...form, ageRating: e.target.value })}>
                                <option value="U">U</option><option value="UA">UA</option><option value="A">A</option><option value="S">S</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Poster URL (Portrait)</label>
                            <input required placeholder="https://..." value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Backdrop URL (Landscape)</label>
                            <input placeholder="https://..." value={form.backdropUrl} onChange={e => setForm({ ...form, backdropUrl: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Trailer URL (Optional)</label>
                        <input placeholder="https://youtube.com/..." value={form.trailerUrl} onChange={e => setForm({ ...form, trailerUrl: e.target.value })} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Release Date</label>
                            <input required type="date" value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Rating (0-10)</label>
                            <input required type="number" step="0.1" min="0" max="10" placeholder="8.5" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })} />
                        </div>
                    </div>
                    <div className="form-group row-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={form.isArchived}
                                onChange={e => setForm({ ...form, isArchived: e.target.checked })}
                            />
                            Archive Movie (Hide from Homepage)
                        </label>
                    </div>

                    <div className="admin-modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Movie</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 3. Theatres Tab
 * ───────────────────────────────────────────────────────────────── */
function TheatresTab() {
    const { showAlert, showConfirm } = useUIFeedback();
    const [theatres, setTheatres] = useState([]);
    const [editing, setEditing] = useState(null);

    const fetchTheatres = () => api.get('/theatres').then(r => setTheatres(r.data));
    useEffect(() => { fetchTheatres(); }, []);

    const handleDelete = async (id) => {
        const ok = await showConfirm({
            title: "Delete Theatre",
            message: "Are you sure you want to delete this theatre? All associated data will be lost.",
            confirmText: "Delete",
            cancelText: "Keep it"
        });
        if (!ok) return;

        try {
            await api.delete(`/theatres/${id}`);
            showAlert("Theatre deleted successfully", "success");
            fetchTheatres();
        }
        catch (e) { showAlert("Failed to delete.", "error"); }
    };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <h1 className="admin-title">Theatres & Screens</h1>
                <button className="btn-primary" onClick={() => setEditing({})}>
                    <FiPlus /> Add Theatre
                </button>
            </header>

            {editing && (
                <TheatreForm
                    theatre={editing}
                    onClose={() => setEditing(null)}
                    onSuccess={() => { setEditing(null); fetchTheatres(); }}
                />
            )}

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>Theatre Name</th><th>City</th><th>Total Screens</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {theatres.map(t => (
                            <tr key={t._id}>
                                <td><strong>{t.name}</strong><div className="text-muted text-sm">{t.location}</div></td>
                                <td>{t.city}</td>
                                <td>{t.screens?.length || 0} Screens</td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => setEditing(t)} className="btn-icon"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(t._id)} className="btn-icon text-red"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Helper for Premium Row Tag Input ── */
function PremiumRowInput({ rows, onChange }) {
    const [val, setVal] = useState('');

    const handleKey = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
            e.preventDefault();
            const num = parseInt(val.trim());
            if (!isNaN(num) && !rows.includes(num)) {
                onChange([...rows, num]);
            }
            setVal('');
        }
    };

    return (
        <div className="tag-input-container">
            {rows.map(r => (
                <span key={r} className="tag-chip">
                    Row {r}
                    <button type="button" className="tag-remove" onClick={() => onChange(rows.filter(x => x !== r))}>
                        <FiX />
                    </button>
                </span>
            ))}
            <input
                className="tag-input-field"
                placeholder={rows.length === 0 ? "Type row index (e.g. 5) and press Enter" : "+ add"}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKey}
            />
        </div>
    );
}

function TheatreForm({ theatre, onClose, onSuccess }) {
    const { showAlert } = useUIFeedback();
    const isEdit = !!theatre._id;
    const [form, setForm] = useState({
        name: theatre.name || '',
        location: theatre.location || '',
        city: theatre.city || '',
        screens: theatre.screens || [{ screenNumber: 1, seatingCapacity: 60, seatLayout: { rows: 6, cols: 10, premiumRows: [5] } }]
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (form.screens.length === 0) {
            showAlert("Must have at least one screen.", "warning");
            return;
        }
        try {
            if (isEdit) await api.put(`/theatres/${theatre._id}`, form);
            else await api.post('/theatres', form);
            showAlert(`Theatre ${isEdit ? 'updated' : 'added'} successfully`, "success");
            onSuccess();
        } catch (e) { showAlert("Failed to save.", "error"); }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal admin-modal--lg">
                <h3>{isEdit ? 'Edit Theatre' : 'Add Theatre'}</h3>
                <form onSubmit={onSubmit} className="admin-form">
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Theatre Name</label>
                            <input required placeholder="e.g. Cineplex" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input required placeholder="e.g. New York" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Location Address</label>
                        <input required placeholder="Full address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>

                    <div className="admin-screens-section">
                        <h4>Screens Configuration (Required)</h4>
                        <div className="admin-screens">
                            {form.screens.map((sc, i) => (
                                <div key={i} className="screen-card">
                                    <h5>Screen {sc.screenNumber}</h5>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label>Rows</label>
                                            <input type="number" placeholder="Rows" value={sc.seatLayout?.rows || 10} onChange={e => {
                                                const newScreens = [...form.screens];
                                                newScreens[i].seatLayout.rows = parseInt(e.target.value) || 0;
                                                newScreens[i].seatingCapacity = (parseInt(e.target.value) || 0) * (sc.seatLayout?.cols || 10);
                                                setForm({ ...form, screens: newScreens });
                                            }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Cols</label>
                                            <input type="number" placeholder="Cols" value={sc.seatLayout?.cols || 10} onChange={e => {
                                                const newScreens = [...form.screens];
                                                newScreens[i].seatLayout.cols = parseInt(e.target.value) || 0;
                                                newScreens[i].seatingCapacity = (parseInt(e.target.value) || 0) * (sc.seatLayout?.rows || 10);
                                                setForm({ ...form, screens: newScreens });
                                            }} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Premium Rows</label>
                                        <PremiumRowInput
                                            rows={sc.seatLayout?.premiumRows || []}
                                            onChange={(newRows) => {
                                                const newScreens = [...form.screens];
                                                newScreens[i].seatLayout.premiumRows = newRows;
                                                setForm({ ...form, screens: newScreens });
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="btn-ghost btn-sm" onClick={() => setForm({
                            ...form,
                            screens: [...form.screens, { screenNumber: form.screens.length + 1, seatingCapacity: 60, seatLayout: { rows: 6, cols: 10, premiumRows: [] } }]
                        })}>+ Add Screen</button>
                    </div>

                    <div className="admin-modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Theatre</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 4. Shows Tab
 * ───────────────────────────────────────────────────────────────── */
function ShowsTab() {
    const { showAlert, showConfirm } = useUIFeedback();
    const [shows, setShows] = useState([]);
    const [editing, setEditing] = useState(null);
    const [filterStatus, setFilterStatus] = useState('upcoming'); // 'all', 'upcoming', 'past'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchShows = () => {
        const query = filterStatus === 'all' ? `?page=${page}&limit=10` : `?status=${filterStatus}&page=${page}&limit=10`;
        api.get(`/admin/shows${query}`).then(r => {
            setShows(r.data?.items || []);
            setTotalPages(r.data?.pagination?.pages || 1);
        });
    };

    useEffect(() => { setPage(1); }, [filterStatus]);
    useEffect(() => { fetchShows(); }, [filterStatus, page]);

    const handleDelete = async (id) => {
        const ok = await showConfirm({
            title: "Delete Show",
            message: "Are you sure you want to delete this show? This will affect any existing bookings.",
            confirmText: "Delete",
            cancelText: "Keep it"
        });
        if (!ok) return;

        try {
            await api.delete(`/admin/shows/${id}`);
            showAlert("Show deleted successfully", "success");
            fetchShows();
        }
        catch (e) { showAlert("Failed to delete.", "error"); }
    };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <div>
                    <h1 className="admin-title">Live Shows</h1>
                    <div className="admin-filter-tabs">
                        <button
                            className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'past' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('past')}
                        >
                            Past History
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            All
                        </button>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => setEditing({})}>
                    <FiPlus /> Schedule Show
                </button>
            </header>


            {editing && <ShowForm show={editing} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); fetchShows(); }} />}

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>Movie</th><th>Theatre</th><th>Screen</th><th>Time</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {shows.map(s => (
                            <tr key={s._id}>
                                <td>{s.movieId?.title}</td>
                                <td>{s.theatreId?.name}</td>
                                <td>{s.screenNumber}</td>
                                <td>{new Date(s.showTime).toLocaleString()}</td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => setEditing(s)} className="btn-icon"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(s._id)} className="btn-icon text-red"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingBottom: '1rem' }}>
                <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
}

function ShowForm({ show, onClose, onSuccess }) {
    const { showAlert } = useUIFeedback();
    const isEdit = !!show._id;
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(true);

    const [form, setForm] = useState({
        movieId: show.movieId?._id || '',
        theatreId: show.theatreId?._id || '',
        screenNumber: show.screenNumber || 1,
        showTime: show.showTime ? new Date(show.showTime).toISOString().slice(0, 16) : '',
        pricing: { standard: show.pricing?.standard || 10, premium: show.pricing?.premium || 15 }
    });

    useEffect(() => {
        Promise.all([api.get('/movies'), api.get('/theatres')]).then(([mRes, tRes]) => {
            setMovies(Array.isArray(mRes.data) ? mRes.data : []);
            setTheatres(tRes.data);
            setLoadingConfig(false);
        });
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();

        const selectedTime = new Date(form.showTime);
        const now = new Date();

        // 1. Check if show is in the past
        if (selectedTime < now) {
            showAlert("Error: Cannot schedule a show in the past.", "error");
            return;
        }

        // 2. Check if show is before movie release
        const selectedMovie = movies.find(m => m._id === form.movieId);
        if (selectedMovie) {
            const releaseDate = new Date(selectedMovie.releaseDate);
            if (selectedTime < releaseDate) {
                showAlert(`Error: Show date is before movie release date (${releaseDate.toLocaleDateString()}).`, "error");
                return;
            }
        }

        try {
            if (isEdit) await api.put(`/admin/shows/${show._id}`, form);
            else await api.post('/admin/shows', form);
            showAlert(`Show ${isEdit ? 'updated' : 'scheduled'} successfully`, "success");
            onSuccess();
        } catch (e) { showAlert("Failed to save show.", "error"); }
    };

    if (loadingConfig) return <div className="spinner context-spinner" />;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal">
                <h3>{isEdit ? 'Edit Show' : 'Schedule Show'}</h3>
                <form onSubmit={onSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Movie</label>
                        <select required value={form.movieId} onChange={e => setForm({ ...form, movieId: e.target.value })}>
                            <option value="">Select Movie...</option>
                            {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Theatre</label>
                        <select required value={form.theatreId} onChange={e => setForm({ ...form, theatreId: e.target.value })}>
                            <option value="">Select Theatre...</option>
                            {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}
                        </select>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Screen Number</label>
                            <input required type="number" placeholder="Enter screen#" value={form.screenNumber} onChange={e => setForm({ ...form, screenNumber: parseInt(e.target.value) })} />
                        </div>
                        <div className="form-group">
                            <label>Show Time</label>
                            <input
                                required
                                type="datetime-local"
                                min={new Date().toISOString().slice(0, 16)}
                                value={form.showTime}
                                onChange={e => setForm({ ...form, showTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Standard Price ($)</label>
                            <input required type="number" step="0.01" placeholder="10.00" value={form.pricing.standard} onChange={e => setForm({ ...form, pricing: { ...form.pricing, standard: parseFloat(e.target.value) } })} />
                        </div>
                        <div className="form-group">
                            <label>Premium Price ($)</label>
                            <input required type="number" step="0.01" placeholder="15.00" value={form.pricing.premium} onChange={e => setForm({ ...form, pricing: { ...form.pricing, premium: parseFloat(e.target.value) } })} />
                        </div>
                    </div>
                    <div className="admin-modal-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Show</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── 
 * 5. Users Tab
 * ───────────────────────────────────────────────────────────────── */
function UsersTab() {
    const { showAlert } = useUIFeedback();
    const [users, setUsers] = useState([]);
    const [viewHistoryToken, setViewHistoryToken] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = () => api.get(`/admin/users?page=${page}&limit=10`).then(r => {
        setUsers(r.data?.items || []);
        setTotalPages(r.data?.pagination?.pages || 1);
    });
    useEffect(() => { fetchUsers(); }, [page]);

    const handleRoleToggle = async (id, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            showAlert(`User successfully ${newRole === 'admin' ? 'promoted' : 'demoted'}`, "success");
            fetchUsers();
        } catch (e) { showAlert("Failed to update role. You cannot demote yourself.", "error"); }
    };

    return (
        <div className="admin-tab">
            <header className="admin-tab-header">
                <h1 className="admin-title">User Control</h1>
            </header>

            {viewHistoryToken && (
                <UserHistoryModal
                    user={viewHistoryToken}
                    onClose={() => setViewHistoryToken(null)}
                />
            )}

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td><span className={`badge ${u.role === 'admin' ? 'badge--outline text-cyan' : ''}`}>{u.role}</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-ghost btn-sm" onClick={() => setViewHistoryToken(u)}>
                                            View History
                                        </button>
                                        <button className="btn-ghost btn-sm" onClick={() => handleRoleToggle(u._id, u.role)}>
                                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingBottom: '1rem' }}>
                <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
}

function UserHistoryModal({ user, onClose }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/user-history/${user._id}`)
            .then(r => setBookings(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [user._id]);

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal" style={{ maxWidth: '1100px', width: '95%' }}>
                <header className="admin-modal-header" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>Booking History</h2>
                        <p style={{ color: 'var(--text-teal)', fontSize: '0.9rem', marginTop: '0.2rem' }}>Customer: {user.name}</p>
                    </div>
                </header>

                <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {loading ? (
                        <div className="spinner" />
                    ) : bookings.length === 0 ? (
                        <div className="mb-empty" style={{ padding: '4rem 0' }}>
                            <div className="mb-empty__icon">🎟️</div>
                            <h3 className="mb-empty__title">No Bookings Found</h3>
                            <p className="mb-empty__sub">This user hasn't made any reservations yet.</p>
                        </div>
                    ) : (
                        <div className="admin-table-wrap" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <table className="admin-table">
                                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <tr>
                                        <th style={{ padding: '1.25rem' }}>Movie & ID</th>
                                        <th>Showtime</th>
                                        <th>Seats</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => {
                                        const showDate = b.showId ? new Date(b.showId.showTime) : null;
                                        return (
                                            <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
                                                        {b.showId?.movieId?.title || 'Deleted Movie'}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                                                        ID: #{b._id.toUpperCase()}
                                                    </div>
                                                </td>
                                                <td>
                                                    {showDate ? (
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            <div style={{ color: '#ebf1f5' }}>{showDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    ) : 'N/A'}
                                                </td>
                                                <td>
                                                    <div className="mb-card__seats" style={{ gap: '0.25rem' }}>
                                                        {b.seats.map(s => (
                                                            <span key={s} style={{
                                                                background: 'rgba(255,255,255,0.05)',
                                                                padding: '0.1rem 0.4rem',
                                                                borderRadius: '4px',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                fontSize: '0.75rem',
                                                                color: 'var(--teal-400)'
                                                            }}>{s}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`mb-status-badge ${b.bookingStatus === 'Confirmed' ? 'mb-status-badge--confirmed' : 'mb-status-badge--cancelled'}`} style={{ fontSize: '0.65rem' }}>
                                                        {b.bookingStatus}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--teal-400)', fontSize: '1.1rem' }}>
                                                    ${b.totalAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <footer style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <button className="btn-primary" onClick={onClose} style={{ minWidth: '120px' }}>Close History</button>
                </footer>
            </div>
        </div>
    );
}

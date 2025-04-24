"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logFilters, setLogFilters] = useState({
    resourceType: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await axios.get('/api/users');
          setUsers(res.data.data);
        } else if (activeTab === 'logs') {
          const fetchLogs = async () => {
            const params = {};
            if (logFilters.resourceType) params.resourceType = logFilters.resourceType;
            if (logFilters.startDate) params.startDate = logFilters.startDate;
            if (logFilters.endDate) params.endDate = logFilters.endDate;

            const res = await axios.get('/api/logs', { params });
            setLogs(res.data.data);
          };

          await fetchLogs();
        }
      } catch (err) {
        setError(`Failed to fetch ${activeTab}. Please try again later.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, logFilters]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`/api/users/${userId}`);
      setSuccess('User deleted successfully.');
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      console.error(err);
    }
  };

  const handleLogFilterChange = (e) => {
    setLogFilters({
      ...logFilters,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogFilterSubmit = (e) => {
    e.preventDefault();

    const fetchLogs = async () => {
      try {
        const params = {};
        if (logFilters.resourceType) params.resourceType = logFilters.resourceType;
        if (logFilters.startDate) params.startDate = logFilters.startDate;
        if (logFilters.endDate) params.endDate = logFilters.endDate;

        const res = await axios.get('/api/logs', { params });
        setLogs(res.data.data);
      } catch (err) {
        setError('Failed to fetch logs. Please try again later.');
        console.error(err);
      }
    };

    fetchLogs();
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : activeTab === 'users' ? (
            <>
              <h2>User Management</h2>
              {users.length === 0 ? (
                <div className="no-data">No users found.</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`user-role role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="user-actions">
                            <button 
                              className="button button-danger button-small"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <h2>Activity Logs</h2>
              <div className="log-filters">
                <form onSubmit={handleLogFilterSubmit} className="filter-form">
                  <div className="form-group">
                    <label htmlFor="resourceType">Resource Type</label>
                    <select
                      id="resourceType"
                      name="resourceType"
                      value={logFilters.resourceType}
                      onChange={handleLogFilterChange}
                      className="form-select"
                    >
                      <option value="">All Types</option>
                      <option value="user">User</option>
                      <option value="car">Car</option>
                      <option value="rental">Rental</option>
                      <option value="sale">Sale</option>
                      <option value="forum">Forum</option>
                      <option value="dealership">Dealership</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={logFilters.startDate}
                      onChange={handleLogFilterChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={logFilters.endDate}
                      onChange={handleLogFilterChange}
                      className="form-input"
                    />
                  </div>
                  <div className="filter-buttons">
                    <button type="submit" className="button button-primary">
                      Apply Filters
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        setLogFilters({
                          resourceType: '',
                          startDate: '',
                          endDate: '',
                        });

                        const fetchLogs = async () => {
                          try {
                            const res = await axios.get('/api/logs');
                            setLogs(res.data.data);
                          } catch (err) {
                            setError('Failed to fetch logs. Please try again later.');
                            console.error(err);
                          }
                        };

                        fetchLogs();
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </form>
              </div>

              {logs.length === 0 ? (
                <div className="no-data">No logs found.</div>
              ) : (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource Type</th>
                      <th>IP Address</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id}>
                        <td>{log.user?.name || 'System'}</td>
                        <td>{log.action}</td>
                        <td>{log.resourceType}</td>
                        <td>{log.ipAddress}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

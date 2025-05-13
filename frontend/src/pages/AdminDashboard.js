"use client"
import api from "../api"
import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [sales, setSales] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logFilters, setLogFilters] = useState({
    resourceType: '',
    startDate: '',
    endDate: '',
  });
  const [dealershipForm, setDealershipForm] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    phone: '',
    email: '',
    description: '',
  });
  const [editingDealership, setEditingDealership] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await api.get('/users');
          setUsers(res.data.data);
        } else if (activeTab === 'logs') {
          const fetchLogs = async () => {
            const params = {};
            if (logFilters.resourceType) params.resourceType = logFilters.resourceType;
            if (logFilters.startDate) params.startDate = logFilters.startDate;
            if (logFilters.endDate) params.endDate = logFilters.endDate;

            const res = await api.get('/logs', { params });
            setLogs(res.data.data);
          };

          await fetchLogs();
        } else if (activeTab === 'dealerships') {
          const res = await api.get('/dealerships');
          setDealerships(res.data.data);
        } else if (activeTab === 'forum') {
          const res = await api.get('/forum');
          setForumPosts(res.data.data);
        } else if (activeTab === 'sales') {
          const res = await api.get('/sales');
          setSales(res.data.data);
        } else if (activeTab === 'rentals') {
          const res = await api.get('/rentals');
          setRentals(res.data.data);
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

  // User management
  const handleDeleteUser = async (userId) => {
    // Prevent deleting the current admin user
    if (currentUser && String(userId) === String(currentUser.id)) {
      setError('You cannot delete your own account.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (response.data.success) {
        setSuccess('User deleted successfully.');
        const res = await api.get('/users');
        setUsers(res.data.data);
      } else {
        setError(response.data.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      console.error('Delete user error:', err);
    }
  };

  // Log management
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

        const res = await api.get('/logs', { params });
        setLogs(res.data.data);
      } catch (err) {
        setError('Failed to fetch logs. Please try again later.');
        console.error(err);
      }
    };

    fetchLogs();
  };

  // Dealership management
  const handleDealershipChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setDealershipForm({
        ...dealershipForm,
        [parent]: {
          ...dealershipForm[parent],
          [child]: value,
        },
      });
    } else {
      setDealershipForm({
        ...dealershipForm,
        [name]: value,
      });
    }
  };

  const handleAddDealership = async (e) => {
    e.preventDefault();
    
    try {
      const res = await api.post('/dealerships', dealershipForm);
      setSuccess('Dealership added successfully.');
      setDealerships([...dealerships, res.data.data]);
      setDealershipForm({
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        phone: '',
        email: '',
        description: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add dealership.');
      console.error(err);
    }
  };

  const handleEditDealership = (dealership) => {
    setEditingDealership(dealership._id);
    setDealershipForm({
      name: dealership.name,
      address: {
        street: dealership.address.street,
        city: dealership.address.city,
        state: dealership.address.state,
        zipCode: dealership.address.zipCode,
        country: dealership.address.country,
      },
      phone: dealership.phone,
      email: dealership.email,
      description: dealership.description || '',
    });
  };

  const handleUpdateDealership = async (e) => {
    e.preventDefault();
    
    try {
      const res = await api.put(`/dealerships/${editingDealership}`, dealershipForm);
      setSuccess('Dealership updated successfully.');
      setDealerships(dealerships.map(d => d._id === editingDealership ? res.data.data : d));
      setEditingDealership(null);
      setDealershipForm({
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        phone: '',
        email: '',
        description: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update dealership.');
      console.error(err);
    }
  };

  const handleDeleteDealership = async (dealershipId) => {
    if (!window.confirm('Are you sure you want to delete this dealership?')) {
      return;
    }

    try {
      const response = await api.delete(`/dealerships/${dealershipId}`);
      
      if (response.data.success) {
        setSuccess('Dealership deleted successfully.');
        setDealerships(dealerships.filter(d => d._id !== dealershipId));
      } else {
        setError(response.data.message || 'Failed to delete dealership.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete dealership.');
      console.error('Delete dealership error:', err);
    }
  };

  // Forum management
  const handleDeleteForumPost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this forum post?')) {
      return;
    }

    try {
      console.log(postId);
      
      const response = await api.delete(`/forum/${postId}`);
      
      if (response.data.success) {
        setSuccess('Forum post deleted successfully.');
        setForumPosts(forumPosts.filter(post => post._id !== postId));
      } else {
        setError(response.data.message || 'Failed to delete forum post.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete forum post.');
      console.error('Delete forum post error:', err);
    }
  };

  // Sales management
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale record?')) {
      return;
    }

    try {
      const response = await api.delete(`/sales/${saleId}`);
      
      if (response.data.success) {
        setSuccess('Sale record deleted successfully.');
        setSales(sales.filter(sale => sale._id !== saleId));
      } else {
        setError(response.data.message || 'Failed to delete sale record.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sale record.');
      console.error('Delete sale error:', err);
    }
  };

  // Rentals management
  const handleDeleteRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to delete this rental record?')) {
      return;
    }

    try {
      const response = await api.delete(`/rentals/${rentalId}`);
      
      if (response.data.success) {
        setSuccess('Rental record deleted successfully.');
        setRentals(rentals.filter(rental => rental._id !== rentalId));
      } else {
        setError(response.data.message || 'Failed to delete rental record.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete rental record.');
      console.error('Delete rental error:', err);
    }
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
            className={`tab-button ${activeTab === 'dealerships' ? 'active' : ''}`}
            onClick={() => setActiveTab('dealerships')}
          >
            Dealerships
          </button>
          <button 
            className={`tab-button ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            Forum Posts
          </button>
          <button 
            className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales
          </button>
          <button 
            className={`tab-button ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            Rentals
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
                      <tr key={user._id} className={currentUser && String(user._id) === String(currentUser.id) ? "current-user-row" : ""}>
                        <td>{user.name} {currentUser && String(user._id) === String(currentUser.id) && <span className="current-user-badge">(You)</span>}</td>
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
                              disabled={currentUser && String(user._id) === String(currentUser.id)}
                              title={currentUser && String(user._id) === String(currentUser.id) ? "You cannot delete your own account" : "Delete this user"}
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
          ) : activeTab === 'dealerships' ? (
            <>
              <h2>Dealership Management</h2>
              
              <div className="dealership-form">
                <h3>{editingDealership ? 'Update Dealership' : 'Add New Dealership'}</h3>
                <form onSubmit={editingDealership ? handleUpdateDealership : handleAddDealership}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Dealership Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={dealershipForm.name}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={dealershipForm.phone}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={dealershipForm.email}
                      onChange={handleDealershipChange}
                      required
                    />
                  </div>
                  
                  <h4>Address</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="street">Street</label>
                      <input
                        type="text"
                        id="street"
                        name="address.street"
                        value={dealershipForm.address.street}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="address.city"
                        value={dealershipForm.address.city}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="address.state"
                        value={dealershipForm.address.state}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zipCode">Zip Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="address.zipCode"
                        value={dealershipForm.address.zipCode}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="address.country"
                        value={dealershipForm.address.country}
                        onChange={handleDealershipChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={dealershipForm.description}
                      onChange={handleDealershipChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="button button-primary">
                      {editingDealership ? 'Update Dealership' : 'Add Dealership'}
                    </button>
                    {editingDealership && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => {
                          setEditingDealership(null);
                          setDealershipForm({
                            name: '',
                            address: {
                              street: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: '',
                            },
                            phone: '',
                            email: '',
                            description: '',
                          });
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="dealerships-list">
                <h3>Existing Dealerships</h3>
                {dealerships.length === 0 ? (
                  <div className="no-data">No dealerships found.</div>
                ) : (
                  <table className="dealerships-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerships.map(dealership => (
                        <tr key={dealership._id}>
                          <td>{dealership.name}</td>
                          <td>
                            {dealership.address.city}, {dealership.address.state}
                          </td>
                          <td>
                            {dealership.phone}<br />
                            {dealership.email}
                          </td>
                          <td>
                            <div className="dealership-actions">
                              <button
                                className="button button-secondary button-small"
                                onClick={() => handleEditDealership(dealership)}
                              >
                                Edit
                              </button>
                              <button
                                className="button button-danger button-small"
                                onClick={() => handleDeleteDealership(dealership._id)}
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
              </div>
            </>
          ) : activeTab === 'forum' ? (
            <>
              <h2>Forum Posts Management</h2>
              {forumPosts.length === 0 ? (
                <div className="no-data">No forum posts found.</div>
              ) : (
                <table className="forum-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Posted</th>
                      <th>Comments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forumPosts.map(post => (
                      <tr key={post._id}>
                        <td>{post.title}</td>
                        <td>{post.category}</td>
                        <td>{post.user?.name || 'Unknown'}</td>
                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td>{post.comments?.length || 0}</td>
                        <td>
                          <div className="post-actions">
                            <button
                              className="button button-danger button-small"
                              onClick={() => handleDeleteForumPost(post._id)}
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
          ) : activeTab === 'sales' ? (
            <>
              <h2>Sales Records</h2>
              {sales.length === 0 ? (
                <div className="no-data">No sales records found.</div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>Customer</th>
                      <th>Price</th>
                      <th>Payment Method</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(sale => (
                      <tr key={sale._id}>
                        <td>
                          {sale.car ? `${sale.car.make} ${sale.car.model} (${sale.car.year})` : 'Unknown Car'}
                        </td>
                        <td>{sale.user?.name || 'Unknown'}</td>
                        <td>${sale.price?.toLocaleString()}</td>
                        <td>{sale.paymentMethod}</td>
                        <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="sale-actions">
                            <button
                              className="button button-danger button-small"
                              onClick={() => handleDeleteSale(sale._id)}
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
          ) : activeTab === 'rentals' ? (
            <>
              <h2>Rental Records</h2>
              {rentals.length === 0 ? (
                <div className="no-data">No rental records found.</div>
              ) : (
                <table className="rentals-table">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>Customer</th>
                      <th>Period</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map(rental => (
                      <tr key={rental._id}>
                        <td>
                          {rental.car ? `${rental.car.make} ${rental.car.model} (${rental.car.year})` : 'Unknown Car'}
                        </td>
                        <td>{rental.user?.name || 'Unknown'}</td>
                        <td>
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </td>
                        <td>${rental.totalPrice?.toLocaleString()}</td>
                        <td>
                          <span className={`rental-status status-${rental.status}`}>
                            {rental.status}
                          </span>
                        </td>
                        <td>
                          <div className="rental-actions">
                            <button
                              className="button button-danger button-small"
                              onClick={() => handleDeleteRental(rental._id)}
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
                            const res = await api.get('/logs');
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
                      <th>Date</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id}>
                        <td>{log.user?.name || 'Unknown'}</td>
                        <td>{log.action}</td>
                        <td>{log.resourceType}</td>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                        <td>{log.ipAddress}</td>
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
  )
}

export default AdminDashboard

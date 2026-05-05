import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('users'); // 'users' or 'user-detail'

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSelectedUser(data);
      setView('user-detail');
    } catch (error) {
      console.error('Error fetching user detail:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setView('users');
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSelectedUser({
          ...selectedUser,
          recipes: selectedUser.recipes.filter(recipe => recipe.id !== recipeId),
        });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        {view === 'user-detail' && (
          <button className="back-btn" onClick={() => setView('users')}>
            ← Back to Users
          </button>
        )}
      </div>

      {view === 'users' ? (
        <div className="users-section">
          <h2>All Users ({users.length})</h2>

          {users.length === 0 ? (
            <p className="no-users">No users found.</p>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Admin</th>
                    <th>Recipes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.full_name || '-'}</td>
                      <td>{user.is_admin ? 'Yes' : 'No'}</td>
                      <td>-</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => fetchUserDetail(user.id)}
                        >
                          View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="user-detail-section">
          <h2>User Details</h2>

          {selectedUser && (
            <div className="user-detail-card">
              <div className="user-info">
                <h3>{selectedUser.username}</h3>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Full Name:</strong> {selectedUser.full_name || 'Not set'}</p>
                <p><strong>Description:</strong> {selectedUser.description || 'Not set'}</p>
                <p><strong>Admin:</strong> {selectedUser.is_admin ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>

              <div className="user-recipes">
                <h3>Recipes ({selectedUser.recipes?.length || 0})</h3>

                {selectedUser.recipes?.length === 0 ? (
                  <p className="no-recipes">No recipes submitted.</p>
                ) : (
                  <div className="recipes-grid">
                    {selectedUser.recipes.map((recipe) => (
                      <div key={recipe.id} className="recipe-card">
                        <h4>{recipe.name}</h4>
                        <p className="recipe-meta">
                          {recipe.category} • {recipe.type} • {recipe.difficulty}
                        </p>
                        <div className="recipe-actions">
                          <button className="edit-btn">Edit</button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCog, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { usersService } from '../../api/usersService';
import defaultProfilePicture from '../../assets/default-avatar.png';

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(null);

  // Role options
  const roleOptions = [
    { value: 0, label: 'User' },
    { value: 1, label: 'Manager' },
    { value: 2, label: 'Admin' }
  ];

  // Get role label by value
  const getRoleLabel = (roleValue) => {
    return roleOptions.find(option => option.value === roleValue)?.label || 'Unknown';
  };

  // Redirect if not admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await usersService.getCurrentUser();
        setCurrentUser(user.data);

        // Redirect if not admin
        if (!user || user.data.role !== 2) {
          console.log("Not an admin, redirecting. Role:", user?.data.role);
          navigate('/');
          return;
        }

        setAuthChecked(true);
      } catch (err) {
        console.error("Error fetching current user:", err);
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Fetch users data
  useEffect(() => {
    if (!authChecked || !currentUser) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await usersService.getAll();
        setUsers(userData.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authChecked, currentUser]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdating(userId);
      await usersService.changeRole(userId, parseInt(newRole));
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => 
        user.userId === userId ? { ...user, role: parseInt(newRole) } : user
      ));

      alert(`User role updated successfully`);
    } catch (err) {
      console.error("Error updating user role:", err);
      alert(err.message || "Failed to update user role");
    } finally {
      setRoleUpdating(null);
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === '' || user.role === parseInt(filterRole);
    
    return matchesSearch && matchesRole;
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Show loading state while checking authentication
  if (!authChecked || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-blue-500 animate-spin"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />
      <div className="ml-16 w-full">
        <Header />
        <main className="pt-20 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/admin')}
                  className="mr-4 p-2 rounded-full hover:bg-gray-200"
                  title="Back to Admin Dashboard"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              </div>
              <div className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                Logged in as Admin
              </div>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by username or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Roles</option>
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-blue-500 animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h2 className="text-lg font-semibold mb-2">User List</h2>
                  <p className="text-gray-600">
                    {users.length} user{users.length !== 1 ? 's' : ''} registered in the system
                  </p>
                </div>
                
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden">
                                <img
                                  src={user.profilePicture || defaultProfilePicture}
                                  alt={user.username}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://i.pravatar.cc/150?img=1'; // Fallback image
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">ID: {user.userId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 2 ? 'bg-purple-100 text-purple-800' :
                              user.role === 1 ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.userId === currentUser.userId ? (
                              <span className="text-sm text-gray-500 italic">Cannot change own role</span>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                                  disabled={roleUpdating === user.userId}
                                  className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                  {roleOptions.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                  ))}
                                </select>
                                {roleUpdating === user.userId && (
                                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No users found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserManagement;
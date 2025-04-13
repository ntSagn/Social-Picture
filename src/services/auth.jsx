// Simple authentication service for demo purposes

// Mock user data
// Simple authentication service for demo purposes

// Mock user data
const MOCK_USERS = [
  {
    id: 1,
    username: 'user1',
    password: 'password123',
    email: 'user1@example.com',
    role: 'USER',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    username: 'admin',
    password: '123',
    email: 'admin@example.com',
    role: 'ADMIN',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    username: 'manager',
    password: '123',
    email: 'manager@example.com',
    role: 'MANAGER',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
  }
];
  
  // Login function
  export const login = (username, password) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );
        
        if (user) {
          // Remove password before storing in localStorage
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500);
    });
  };
  
  // Get current user from localStorage
  export const getCurrentUser = () => {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  };
  
  // Logout function
  export const logout = () => {
    localStorage.removeItem('currentUser');
  };
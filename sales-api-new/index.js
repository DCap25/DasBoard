const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS with specific origins
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://dasboard-app.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Secret for JWT
const JWT_SECRET = 'dashboard-api-secret-key';

// Mock dealerships
const dealerships = [
  {
    id: 1,
    name: 'Auto Haven',
    supabase_url: 'https://dijulexxrgfmaiewtavb.supabase.co',
    supabase_anon_key: 'mock-anon-key-for-dealership-1',
    created_at: new Date().toISOString()
  }
];

// Mock user database
const users = [
  {
    id: '1',
    email: 'testsales@example.com',
    password: 'password',
    profile: {
      id: '1',
      user_id: '1',
      email: 'testsales@example.com',
      role: 'salesperson',
      dealership_id: 1,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    email: 'testfinance@example.com',
    password: 'password',
    profile: {
      id: '2',
      user_id: '2',
      email: 'testfinance@example.com',
      role: 'finance_manager',
      dealership_id: 1,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    email: 'testmanager@example.com',
    password: 'password',
    profile: {
      id: '3',
      user_id: '3',
      email: 'testmanager@example.com',
      role: 'sales_manager',
      dealership_id: 1,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '4',
    email: 'testgm@example.com',
    password: 'password',
    profile: {
      id: '4',
      user_id: '4',
      email: 'testgm@example.com',
      role: 'general_manager',
      dealership_id: 1,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '5',
    email: 'testadmin@example.com',
    password: 'password',
    profile: {
      id: '5',
      user_id: '5',
      email: 'testadmin@example.com',
      role: 'admin',
      dealership_id: 1,
      created_at: new Date().toISOString()
    }
  }
];

// Mock tables
const mockData = {
  profiles: users.map(user => user.profile),
  
  sales: [
    { 
      id: 1, 
      customer_name: 'John Doe', 
      vehicle: '2023 Toyota Camry', 
      sale_date: '2025-04-15', 
      amount: 28500, 
      salesperson_id: '1', 
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    { 
      id: 2, 
      customer_name: 'Jane Smith', 
      vehicle: '2024 Honda Accord', 
      sale_date: '2025-04-16', 
      amount: 32000, 
      salesperson_id: '3', 
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    { 
      id: 3, 
      customer_name: 'Robert Johnson', 
      vehicle: '2023 Ford F-150', 
      sale_date: '2025-04-17', 
      amount: 45000, 
      salesperson_id: '1', 
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    { 
      id: 4, 
      customer_name: 'Michael Brown', 
      vehicle: '2023 Nissan Altima', 
      sale_date: '2025-04-18', 
      amount: 26000, 
      salesperson_id: '3', 
      dealership_id: 2, // Different dealership
      created_at: new Date().toISOString()
    },
  ],
  
  metrics: [
    {
      id: 1,
      name: 'Total Sales',
      value: 105500,
      period: 'April 2025',
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Total Leads',
      value: 43,
      period: 'April 2025',
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Conversion Rate',
      value: 23,
      period: 'April 2025',
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Total Sales',
      value: 82000,
      period: 'April 2025',
      dealership_id: 2, // Different dealership
      created_at: new Date().toISOString()
    },
  ],
  
  fni_details: [
    {
      id: 1,
      sale_id: 1,
      product: 'Extended Warranty',
      amount: 2500,
      commission: 500,
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      sale_id: 1,
      product: 'GAP Insurance',
      amount: 1200,
      commission: 300,
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      sale_id: 2,
      product: 'Extended Warranty',
      amount: 3000,
      commission: 600,
      dealership_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      sale_id: 3,
      product: 'Paint Protection',
      amount: 1500,
      commission: 350,
      dealership_id: 2, // Different dealership
      created_at: new Date().toISOString()
    },
  ],
  
  dealerships: dealerships
};

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: { message: 'Missing authentication token' }
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: { message: 'Invalid or expired token' }
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to check dealership access
const checkDealershipAccess = (tableName) => (req, res, next) => {
  const { id } = req.user;
  const userProfile = mockData.profiles.find(profile => profile.user_id === id);
  
  if (!userProfile) {
    return res.status(404).json({ error: { message: 'User profile not found' } });
  }
  
  // Admin users can see all dealerships
  const isAdmin = userProfile.role === 'admin';
  req.isAdmin = isAdmin;
  req.userDealershipId = userProfile.dealership_id;
  
  next();
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sales API' });
});

// Authentication routes
app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(user => user.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      error: { message: 'Invalid email or password' }
    });
  }
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
  
  res.json({
    data: {
      user: { id: user.id, email: user.email },
      session: { access_token: token, expires_at: new Date(Date.now() + 86400000).toISOString() }
    },
    error: null
  });
});

app.post('/auth/signup', (req, res) => {
  const { email, password, role, dealership_id = 1 } = req.body;
  
  // Check if user exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ 
      error: { message: 'User already exists' }
    });
  }
  
  // Create new user
  const newUserId = String(users.length + 1);
  const newProfileId = String(mockData.profiles.length + 1);
  
  const newUser = {
    id: newUserId,
    email,
    password,
    profile: {
      id: newProfileId,
      user_id: newUserId,
      email,
      role,
      dealership_id,
      created_at: new Date().toISOString()
    }
  };
  
  users.push(newUser);
  mockData.profiles.push(newUser.profile);
  
  const token = jwt.sign({ id: newUserId }, JWT_SECRET, { expiresIn: '1d' });
  
  res.status(201).json({
    data: {
      user: { id: newUserId, email },
      session: { access_token: token, expires_at: new Date(Date.now() + 86400000).toISOString() }
    },
    error: null
  });
});

app.post('/auth/signout', authenticateToken, (req, res) => {
  res.json({ error: null });
});

// Get user profile
app.get('/profiles', authenticateToken, (req, res) => {
  const { id } = req.user;
  const profile = mockData.profiles.find(profile => profile.user_id === id);
  
  if (!profile) {
    return res.status(404).json({ error: { message: 'Profile not found' } });
  }
  
  res.json({ data: profile, error: null });
});

// Generic data access endpoint
app.get('/data/:table', authenticateToken, (req, res) => {
  const { table } = req.params;
  
  if (!mockData[table]) {
    return res.status(404).json({ error: { message: 'Table not found' } });
  }
  
  const { id } = req.user;
  const userProfile = mockData.profiles.find(profile => profile.user_id === id);
  
  if (!userProfile) {
    return res.status(404).json({ error: { message: 'User profile not found' } });
  }
  
  // Apply row-level security (RLS) based on dealership_id
  // Admin users can see all data, other users only see their dealership's data
  const isAdmin = userProfile.role === 'admin';
  const data = isAdmin 
    ? mockData[table] 
    : mockData[table].filter(item => !item.dealership_id || item.dealership_id === userProfile.dealership_id);
  
  res.json({ data, error: null });
});

// Sales endpoints with tenant isolation
app.get('/api/sales', authenticateToken, checkDealershipAccess('sales'), (req, res) => {
  const filteredSales = req.isAdmin
    ? mockData.sales
    : mockData.sales.filter(item => item.dealership_id === req.userDealershipId);
  
  res.json({ data: filteredSales, error: null });
});

app.post('/api/sales', authenticateToken, (req, res) => {
  const { id } = req.user;
  const userProfile = mockData.profiles.find(profile => profile.user_id === id);
  
  if (!userProfile) {
    return res.status(404).json({ error: { message: 'User profile not found' } });
  }

  const newSale = {
    id: mockData.sales.length + 1,
    ...req.body,
    salesperson_id: id,
    dealership_id: userProfile.dealership_id,
    created_at: new Date().toISOString()
  };
  
  mockData.sales.push(newSale);
  res.status(201).json({ data: newSale, error: null });
});

// Metrics endpoint with tenant isolation
app.get('/api/metrics', authenticateToken, checkDealershipAccess('metrics'), (req, res) => {
  const filteredMetrics = req.isAdmin
    ? mockData.metrics
    : mockData.metrics.filter(item => item.dealership_id === req.userDealershipId);
  
  res.json({ data: filteredMetrics, error: null });
});

// F&I details endpoint with tenant isolation
app.get('/api/fni_details', authenticateToken, checkDealershipAccess('fni_details'), (req, res) => {
  const filteredFniDetails = req.isAdmin
    ? mockData.fni_details
    : mockData.fni_details.filter(item => item.dealership_id === req.userDealershipId);
  
  // If sale_id is provided, filter by it
  const saleId = req.query.sale_id ? parseInt(req.query.sale_id, 10) : null;
  const result = saleId 
    ? filteredFniDetails.filter(item => item.sale_id === saleId)
    : filteredFniDetails;
  
  res.json({ data: result, error: null });
});

app.listen(PORT, () => {
  console.log(`Sales API running on port ${PORT}`);
}); 
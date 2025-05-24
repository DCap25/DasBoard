import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import the existing server configuration
const app = express();

// Set up middleware
app.use(
  cors({
    origin: ['https://das-board-app.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic authentication route
app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - implement with Supabase' });
});

// Basic dashboard route
app.get('/api/dashboard', (req, res) => {
  res.json({ message: 'Dashboard data endpoint' });
});

// Basic deals route
app.get('/api/deals', (req, res) => {
  res.json({ message: 'Deals endpoint', data: [] });
});

// Export the handler
export const handler = serverless(app);

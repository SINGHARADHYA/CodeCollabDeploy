const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const codeRoutes = require('./routes/codeRoutes');
const debugRoutes = require('./routes/debugRoutes');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const { initializeSocketHandlers } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', codeRoutes);
app.use('/api', debugRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.io handlers
initializeSocketHandlers(io);

// Start server
server.listen(config.port, () => {
  console.log(`\n  🚀 CodeCollab Server running on http://localhost:${config.port}`);
  console.log(`  📡 Socket.io accepting connections from ${config.clientUrl}`);
  console.log(`  🗄️  Database: Supabase (PostgreSQL)\n`);
});

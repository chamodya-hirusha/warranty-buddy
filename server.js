import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
    }
  });

  // Make io accessible globally or pass it to APIs
  // In a real app, you might use a separate file or a message broker (Redis)
  // For simplicity here, we can attach it to the global object or use a singleton
  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join tenant room
    socket.on('join-tenant', (tenantId) => {
      socket.join(tenantId);
      console.log(`Socket ${socket.id} joined tenant ${tenantId}`);
    });

    // Join branch room
    socket.on('join-branch', ({ tenantId, branchId }) => {
      const room = `${tenantId}:${branchId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined branch room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

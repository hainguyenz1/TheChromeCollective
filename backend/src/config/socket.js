const socketIo = require('socket.io');

let io;

const socketSetup = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:19006'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Join product room for real-time updates
    socket.on('join-product', (productId) => {
      socket.join(`product-${productId}`);
      console.log(`User joined product room: ${productId}`);
    });

    // Handle product updates
    socket.on('product-update', (data) => {
      socket.to(`product-${data.productId}`).emit('product-updated', data);
    });

    // Handle new listings
    socket.on('new-listing', (data) => {
      io.emit('listing-created', data);
    });

    // Handle price changes
    socket.on('price-change', (data) => {
      socket.to(`product-${data.productId}`).emit('price-changed', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io server initialized');
};

// Export io instance for use in other files
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { socketSetup, getIO }; 
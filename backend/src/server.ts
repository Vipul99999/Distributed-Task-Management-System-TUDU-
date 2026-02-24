import app from './app';
import { prisma } from './app';

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  try {
    await prisma.$connect();
    
    app.listen(PORT, () => {

    });
  } catch (err) {
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`📴 Received ${signal}. Closing server...`);
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (err) {
      console.error('❌ Error disconnecting database', err);
    } finally {
      console.log('[Server] Exiting process');
      process.exit(0);
    }
  });
});

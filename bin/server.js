
import { getFastifyApp } from '../api/_lib/fastifyApp.js';
import '../api/_lib/init.js'; // Auto-initialize cache on startup

const start = async () => {
    try {
        const app = await getFastifyApp();
        const port = process.env.PORT || 3000;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📚 API docs available at http://localhost:${port}/documentation`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();

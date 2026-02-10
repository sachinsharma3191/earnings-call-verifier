
import { getFastifyApp } from './_lib/fastifyApp.js';

const start = async () => {
    try {
        const app = await getFastifyApp();
        const port = process.env.PORT || 3001;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();

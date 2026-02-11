// Vercel serverless function entry point
import { getFastifyApp } from '../server/fastifyApp.js';

let app;

export default async function handler(req, res) {
  if (!app) {
    app = await getFastifyApp();
  }
  
  await app.ready();
  app.server.emit('request', req, res);
}

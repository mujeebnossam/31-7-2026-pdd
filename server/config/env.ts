// This module must be the FIRST import in server.ts.
// It loads .env before any other module (including database.ts) reads process.env.
import dotenv from 'dotenv';
dotenv.config();

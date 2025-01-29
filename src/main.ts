import { createServer } from './app';
import dotenv from 'dotenv';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const dbUrl = process.env.MONGODB_URI as string;
createServer(port, dbUrl).then(() => {
    console.log(`Server running on port ${port}`);
});
import express, { Express } from 'express';
import path from 'path';
import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import router from './src/index';
import protectedRouter from './src/KanbanRoute';

dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
});


const app: Express = express();
// Use the environment PORT if available, otherwise default to 3000
const port: number = parseInt(process.env.PORT as string) || 3000;

// Connect to MongoDB
const mongoDB: string = "mongodb://127.0.0.1:27017/KanBanDb";
mongoose.connect(mongoDB);
mongoose.Promise = Promise;
const db: Connection = mongoose.connection;
db.on("error", console.log.bind(console, "MongoDB connection error"));

// In development, enable CORS so requests from the frontend dev server are allowed.
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));
}




app.use(express.json());


app.use('/', router);
app.use('/api', protectedRouter);

// In production, serve the built React app.
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'FrontEndReactKanban', 'dist');
  console.log("Serving frontend from:", clientBuildPath);

  // Serve static files
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

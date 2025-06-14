import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Article } from './entities/Article';
import { Tag } from './entities/Tag';
import { SavedArticle } from './entities/SavedArticle';
import { ArticleTag } from './entities/ArticleTag';
import { UserSource } from './entities/UserSource';
import { ScheduledSummary } from './entities/ScheduledSummary';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import tagRoutes from './routes/tags';
import { authMiddleware } from './middleware/auth';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();

// Basic CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// Database configuration
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Article, Tag, SavedArticle, ArticleTag, UserSource, ScheduledSummary],
  migrations: [],
  subscribers: [],
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tags', tagRoutes);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    
    const port = parseInt(process.env.PORT || '3000');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
    });
  })
  .catch((error) => console.log('Error during Data Source initialization:', error)); 
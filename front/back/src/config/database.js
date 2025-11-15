import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const initDatabase = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserLibraryTable = `
    CREATE TABLE IF NOT EXISTS user_library (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL,
      title VARCHAR(500) NOT NULL,
      author VARCHAR(255),
      cover_image TEXT,
      status VARCHAR(20) DEFAULT 'plan' CHECK (status IN ('reading', 'plan', 'finished', 'favorite')),
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id)
    );
  `;

  const createReadingProgressTable = `
    CREATE TABLE IF NOT EXISTS reading_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL,
      current_page INTEGER DEFAULT 0,
      total_pages INTEGER DEFAULT 0,
      current_chapter INTEGER DEFAULT 1,
      percentage INTEGER DEFAULT 0,
      last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id)
    );
  `;

  const createBookmarksTable = `
    CREATE TABLE IF NOT EXISTS bookmarks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL,
      page INTEGER NOT NULL,
      chapter INTEGER,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_library_status ON user_library(status);
    CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id ON bookmarks(book_id);
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createUserLibraryTable);
    await pool.query(createReadingProgressTable);
    await pool.query(createBookmarksTable);
    await pool.query(createIndexes);
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export default pool;

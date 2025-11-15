import pool from "../config/database.js";

export const updateProgress = async (req, res) => {
  try {
    const { bookId, currentPage, totalPages, currentChapter, percentage } =
      req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, current_chapter, percentage, last_read)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, book_id) 
       DO UPDATE SET 
         current_page = $3,
         total_pages = $4,
         current_chapter = $5,
         percentage = $6,
         last_read = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, bookId, currentPage, totalPages, currentChapter, percentage]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM reading_progress WHERE user_id = $1 AND book_id = $2",
      [userId, bookId]
    );

    if (result.rows.length === 0) {
      return res.json({
        current_page: 0,
        total_pages: 0,
        current_chapter: 1,
        percentage: 0,
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addBookmark = async (req, res) => {
  try {
    const { bookId, page, chapter, note } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO bookmarks (user_id, book_id, page, chapter, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, bookId, page, chapter, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM bookmarks WHERE user_id = $1 AND book_id = $2 ORDER BY created_at DESC",
      [userId, bookId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

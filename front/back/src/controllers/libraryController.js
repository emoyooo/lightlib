import pool from "../config/database.js";

export const addToLibrary = async (req, res) => {
  try {
    const { bookId, title, author, coverImage, status = "plan" } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO user_library (user_id, book_id, title, author, cover_image, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, book_id) DO NOTHING
       RETURNING *`,
      [userId, bookId, title, author, coverImage, status]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Book already in library" });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = "SELECT * FROM user_library WHERE user_id = $1";
    const params = [userId];

    if (status) {
      query += " AND status = $2";
      params.push(status);
    }

    query += " ORDER BY added_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBookStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE user_library 
       SET status = $1 
       WHERE user_id = $2 AND book_id = $3
       RETURNING *`,
      [status, userId, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found in library" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromLibrary = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM user_library WHERE user_id = $1 AND book_id = $2 RETURNING *",
      [userId, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found in library" });
    }

    res.json({ message: "Book removed from library" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

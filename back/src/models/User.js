import pool from "../config/database.js";
import bcrypt from "bcryptjs";

class User {
  static async create(email, password, nickname = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname, created_at";
    const result = await pool.query(query, [email, hashedPassword, nickname]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query =
      "SELECT id, email, nickname, created_at FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query =
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2";
    await pool.query(query, [hashedPassword, userId]);
  }

  static async updateNickname(userId, nickname) {
    const query =
      "UPDATE users SET nickname = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, nickname";
    const result = await pool.query(query, [nickname, userId]);
    return result.rows[0];
  }
}

export default User;

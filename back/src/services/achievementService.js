import pool from "../config/database.js";

class AchievementService {
  // Define all possible achievements
  static ACHIEVEMENTS = [
    {
      id: "bookworm",
      icon: "📖",
      title: "Bookworm",
      description: "Read 50 books",
      category: "books_read",
      target: 50,
      bgColor: "#f5f5f5",
    },
    {
      id: "night_owl",
      icon: "🦉",
      title: "Night Owl",
      description: "Read for 7 days straight",
      category: "streak",
      target: 7,
      bgColor: "#fff9e6",
    },
    {
      id: "genre_explorer",
      icon: "🏆",
      title: "Genre Explorer",
      description: "Read 5 different genres",
      category: "genres",
      target: 5,
      bgColor: "#fff9e6",
    },
    {
      id: "speed_reader",
      icon: "🎯",
      title: "Speed Reader",
      description: "Finish a book in one day",
      category: "speed_read",
      target: 1,
      bgColor: "#f5f5f5",
    },
    {
      id: "dedicated_reader",
      icon: "📚",
      title: "Dedicated Reader",
      description: "Read 10 books",
      category: "books_read",
      target: 10,
      bgColor: "#e8f5e9",
    },
    {
      id: "page_turner",
      icon: "📄",
      title: "Page Turner",
      description: "Read 10,000 pages",
      category: "pages_read",
      target: 10000,
      bgColor: "#f3e5f5",
    },
    {
      id: "consistent_reader",
      icon: "🔥",
      title: "Consistent Reader",
      description: "Read for 30 days straight",
      category: "streak",
      target: 30,
      bgColor: "#fff3e0",
    },
    {
      id: "century_club",
      icon: "💯",
      title: "Century Club",
      description: "Read 100 books",
      category: "books_read",
      target: 100,
      bgColor: "#fce4ec",
    },
  ];

  // Calculate user's reading statistics
  static async getUserStats(userId) {
    try {
      // Get books read count by status
      const booksReadQuery = await pool.query(
        "SELECT COUNT(*) FROM user_library WHERE user_id = $1 AND status = $2",
        [userId, "finished"]
      );
      const booksRead = parseInt(booksReadQuery.rows[0].count);

      // Get total pages read from finished books
      const pagesReadQuery = await pool.query(
        `SELECT COALESCE(SUM(rp.total_pages), 0) as total_pages
         FROM reading_progress rp
         INNER JOIN user_library ul ON rp.book_id = ul.book_id AND rp.user_id = ul.user_id
         WHERE rp.user_id = $1 AND ul.status = $2`,
        [userId, "finished"]
      );
      const pagesRead = parseInt(pagesReadQuery.rows[0].total_pages);

      // Get unique genres (subjects) from finished books
      const genresQuery = await pool.query(
        `SELECT DISTINCT book_id FROM user_library WHERE user_id = $1 AND status = $2`,
        [userId, "finished"]
      );
      const uniqueGenres = genresQuery.rows.length;

      // Calculate reading streak
      const streak = await this.calculateStreak(userId);

      // Check for speed reading (books finished in one day)
      const speedReadQuery = await pool.query(
        `SELECT COUNT(DISTINCT ul.book_id) as speed_reads
         FROM user_library ul
         INNER JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
         WHERE ul.user_id = $1 
         AND ul.status = $2
         AND DATE(ul.added_at) = DATE(rp.last_read)`,
        [userId, "finished"]
      );
      const speedReads = parseInt(speedReadQuery.rows[0].speed_reads);

      return {
        books_read: booksRead,
        pages_read: pagesRead,
        genres: uniqueGenres,
        streak: streak,
        speed_read: speedReads,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }

  // Calculate current reading streak
  static async calculateStreak(userId) {
    try {
      const query = await pool.query(
        `SELECT DISTINCT DATE(last_read) as read_date 
         FROM reading_progress 
         WHERE user_id = $1 
         ORDER BY read_date DESC`,
        [userId]
      );

      if (query.rows.length === 0) return 0;

      let streak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user read today or yesterday
      const lastReadDate = new Date(query.rows[0].read_date);
      lastReadDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today - lastReadDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 1) return 0; // Streak broken

      // Count consecutive days
      for (let i = 1; i < query.rows.length; i++) {
        const currentDate = new Date(query.rows[i - 1].read_date);
        const prevDate = new Date(query.rows[i].read_date);
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);

        const diff = Math.floor(
          (currentDate - prevDate) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error("Error calculating streak:", error);
      return 0;
    }
  }

  // Get user achievements with progress
  static async getUserAchievements(userId) {
    try {
      const stats = await this.getUserStats(userId);

      return this.ACHIEVEMENTS.map((achievement) => {
        const currentValue = stats[achievement.category] || 0;
        const progress = Math.min(
          Math.round((currentValue / achievement.target) * 100),
          100
        );
        const earned = currentValue >= achievement.target;

        return {
          ...achievement,
          progress,
          earned,
          currentValue,
          target: achievement.target,
        };
      });
    } catch (error) {
      console.error("Error getting user achievements:", error);
      throw error;
    }
  }

  // Get newly earned achievements (for notifications)
  static async getNewlyEarnedAchievements(userId, previousStats, currentStats) {
    const newlyEarned = [];

    for (const achievement of this.ACHIEVEMENTS) {
      const prevValue = previousStats[achievement.category] || 0;
      const currValue = currentStats[achievement.category] || 0;

      const wasEarned = prevValue >= achievement.target;
      const isEarned = currValue >= achievement.target;

      if (!wasEarned && isEarned) {
        newlyEarned.push(achievement);
      }
    }

    return newlyEarned;
  }
}

export default AchievementService;

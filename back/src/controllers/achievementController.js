// back/src/controllers/achievementController.js
import AchievementService from "../services/achievementService.js";

export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievements = await AchievementService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch achievements",
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await AchievementService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
};

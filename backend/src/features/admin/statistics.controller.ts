/**
 * Statistics Controller
 * Provides real-time statistics from the change stream system
 */

import { Request, Response } from "express";
import { changeStreamManager } from "../../server";
import { logger } from "../../config/logger";

/**
 * Get current system statistics
 */
export const getStatistics = async (req: Request, res: Response) => {
  try {
    if (!changeStreamManager) {
      return res.status(503).json({
        success: false,
        message:
          "Statistics service not available (change streams not initialized)",
      });
    }

    const stats = changeStreamManager.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
};

/**
 * Get statistics for a specific collection
 */
export const getCollectionStats = async (req: Request, res: Response) => {
  try {
    const { collection } = req.params;

    if (!changeStreamManager) {
      return res.status(503).json({
        success: false,
        message: "Statistics service not available",
      });
    }

    const allStats = changeStreamManager.getStats();
    const collectionStats = (allStats as any)[collection];

    if (!collectionStats) {
      return res.status(404).json({
        success: false,
        message: `Statistics not found for collection: ${collection}`,
      });
    }

    res.json({
      success: true,
      data: {
        collection,
        stats: collectionStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching collection statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collection statistics",
    });
  }
};

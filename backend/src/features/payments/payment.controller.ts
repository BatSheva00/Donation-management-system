import { Request, Response, NextFunction } from "express";
import { getStripe } from "../../config/stripe";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "./transaction.model";
import { SystemBalance } from "./systemBalance.model";
import { AppError } from "../../shared/utils/AppError";
import { calculateStripeFees } from "../../shared/utils/stripe.utils";

/**
 * Create Stripe Payment Intent for donation
 */
export const createDonationIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body; // amount in dollars
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!amount || amount < 1) {
      return next(new AppError("Amount must be at least $1", 400));
    }

    // Create Stripe Payment Intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"], // Only card payments (includes Apple Pay & Google Pay)
      metadata: {
        userId,
        type: "donation",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle successful donation payment
 */
export const confirmDonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return next(new AppError("Payment not succeeded", 400));
    }

    // Check if already processed
    const existingTransaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntentId,
      status: TransactionStatus.COMPLETED,
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Donation already processed",
        data: existingTransaction,
      });
    }

    const grossAmount = paymentIntent.amount / 100; // Convert cents to dollars

    // Calculate Stripe fees
    const { fee, netAmount } = calculateStripeFees(grossAmount);

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: TransactionType.DONATION,
      amount: grossAmount,
      fee,
      netAmount,
      currency: "USD",
      status: TransactionStatus.COMPLETED,
      description: `Donated $${grossAmount.toFixed(
        2
      )} to KindLoop (Fee: $${fee.toFixed(2)}, Net: $${netAmount.toFixed(2)})`,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: paymentIntent.latest_charge as string,
    });

    // Update system balance with NET amounts
    let systemBalance = await SystemBalance.findOne({
      currency: "USD",
    });

    if (!systemBalance) {
      systemBalance = await SystemBalance.create({
        totalBalance: netAmount,
        currency: "USD",
        totalDeposits: grossAmount,
        totalDonations: grossAmount,
        totalFees: fee,
      });
    } else {
      systemBalance.totalBalance += netAmount; // Add NET amount to balance
      systemBalance.totalDeposits += grossAmount; // Track gross deposits
      systemBalance.totalDonations += grossAmount; // Track gross donations
      systemBalance.totalFees += fee; // Track total fees paid
      systemBalance.lastUpdated = new Date();
      await systemBalance.save();
    }

    res.status(200).json({
      success: true,
      message: "Thank you for your donation!",
      data: {
        transaction,
        systemTotalBalance: systemBalance?.totalBalance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's donation history
 */
export const getMyDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments({
      userId,
      type: TransactionType.DONATION,
      status: TransactionStatus.COMPLETED,
    });

    const donations = await Transaction.find({
      userId,
      type: TransactionType.DONATION,
      status: TransactionStatus.COMPLETED,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions (admin only)
 */
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: Record<string, string> = {};
    if (type && type !== "all") filter.type = type as string;
    if (status && status !== "all") filter.status = status as string;

    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all donations (admin only) - Legacy endpoint
 */
export const getAllDonations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments({
      type: TransactionType.DONATION,
      status: TransactionStatus.COMPLETED,
    });

    const donations = await Transaction.find({
      type: TransactionType.DONATION,
      status: TransactionStatus.COMPLETED,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recalculate system balance from transactions (admin only)
 * Also recalculates fees for transactions that don't have them
 */
export const recalculateSystemBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all completed transactions
    const allTransactions = await Transaction.find({
      status: TransactionStatus.COMPLETED,
    });

    let totalDeposits = 0; // Gross
    let totalDonations = 0; // Gross
    let totalWithdrawals = 0;
    const totalTransfers = 0; // Reserved for future use
    let totalFees = 0;
    let totalNet = 0;
    let transactionsUpdated = 0;

    // Process each transaction
    for (const transaction of allTransactions) {
      // Calculate fees if not present
      if (transaction.fee === undefined || transaction.fee === 0) {
        const { fee, netAmount } = calculateStripeFees(transaction.amount);
        transaction.fee = fee;
        transaction.netAmount = netAmount;
        await transaction.save();
        transactionsUpdated++;
      }

      // Calculate totals
      switch (transaction.type) {
        case TransactionType.DONATION:
          totalDeposits += transaction.amount; // Gross
          totalDonations += transaction.amount; // Gross
          totalFees += transaction.fee;
          totalNet += transaction.netAmount;
          break;
        case TransactionType.REFUND:
          totalWithdrawals += transaction.amount;
          break;
      }
    }

    const totalBalance = totalNet - totalWithdrawals;

    // Update or create system balance
    let systemBalance = await SystemBalance.findOne({ currency: "USD" });

    if (!systemBalance) {
      systemBalance = await SystemBalance.create({
        totalBalance,
        currency: "USD",
        totalDeposits,
        totalDonations,
        totalWithdrawals,
        totalTransfers,
        totalFees,
        lastUpdated: new Date(),
      });
    } else {
      systemBalance.totalBalance = totalBalance;
      systemBalance.totalDeposits = totalDeposits;
      systemBalance.totalDonations = totalDonations;
      systemBalance.totalWithdrawals = totalWithdrawals;
      systemBalance.totalTransfers = totalTransfers;
      systemBalance.totalFees = totalFees;
      systemBalance.lastUpdated = new Date();
      await systemBalance.save();
    }

    res.status(200).json({
      success: true,
      message: `System balance recalculated successfully. Updated ${transactionsUpdated} transactions with fees.`,
      data: systemBalance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system balance (admin only)
 */
export const getSystemBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const systemBalance = await SystemBalance.findOne({ currency: "USD" });

    res.status(200).json({
      success: true,
      data: systemBalance || {
        totalBalance: 0,
        currency: "USD",
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalTransfers: 0,
        totalDonations: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

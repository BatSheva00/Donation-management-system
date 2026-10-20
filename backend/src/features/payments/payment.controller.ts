import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { getStripe } from "../../config/stripe";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "./transaction.model";
import { SystemBalance } from "./systemBalance.model";
import { AppError } from "../../shared/utils/AppError";
import { calculateStripeFees } from "../../shared/utils/stripe.utils";
import { logger } from "../../config/logger";

async function persistSuccessfulDonation(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) {
    throw new AppError("Payment is missing user metadata", 400);
  }

  const existingTransaction = await Transaction.findOne({
    stripePaymentIntentId: paymentIntent.id,
    status: TransactionStatus.COMPLETED,
  });

  if (existingTransaction) {
    const systemBalance = await SystemBalance.findOne({ currency: "USD" });
    return {
      transaction: existingTransaction,
      systemBalance,
      alreadyProcessed: true,
    };
  }

  const grossAmount = paymentIntent.amount / 100;
  const { fee, netAmount } = calculateStripeFees(grossAmount);

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
    stripePaymentIntentId: paymentIntent.id,
    stripeChargeId: paymentIntent.latest_charge as string,
  });

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
    systemBalance.totalBalance += netAmount;
    systemBalance.totalDeposits += grossAmount;
    systemBalance.totalDonations += grossAmount;
    systemBalance.totalFees += fee;
    systemBalance.lastUpdated = new Date();
    await systemBalance.save();
  }

  return { transaction, systemBalance, alreadyProcessed: false };
}

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

    if (paymentIntent.metadata?.userId !== userId) {
      return next(new AppError("Payment does not belong to this user", 403));
    }

    const { transaction, systemBalance, alreadyProcessed } =
      await persistSuccessfulDonation(paymentIntent);

    res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? "Donation already processed"
        : "Thank you for your donation!",
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

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      throw new AppError("Stripe webhook is not configured", 503);
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing Stripe signature", 400);
    }

    const event = getStripe().webhooks.constructEvent(
      req.body,
      signature,
      secret
    );

    if (event.type === "payment_intent.succeeded") {
      await persistSuccessfulDonation(
        event.data.object as Stripe.PaymentIntent
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook failed", error);
    next(error);
  }
};

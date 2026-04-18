import "../config/loadEnv";
import mongoose from "mongoose";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../features/payments/transaction.model";
import { SystemBalance } from "../features/payments/systemBalance.model";
import { getMongoConnectionString } from "../config/database";

console.log("🔍 Checking environment:");
console.log(
  "   Mongo:",
  process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_ATLAS_HOST
    ? "✅ Loaded"
    : "❌ Missing"
);

const fixSystemBalance = async () => {
  try {
    await mongoose.connect(getMongoConnectionString());
    console.log("✅ Connected to MongoDB");

    const allTransactions = await Transaction.find({
      status: TransactionStatus.COMPLETED,
    });

    let totalDeposits = 0;
    let totalDonations = 0;
    let totalWithdrawals = 0;
    let totalTransfers = 0;

    allTransactions.forEach((transaction) => {
      switch (transaction.type) {
        case TransactionType.DONATION:
          totalDeposits += transaction.amount;
          totalDonations += transaction.amount;
          break;
        case TransactionType.REFUND:
          totalWithdrawals += transaction.amount;
          break;
      }
    });

    const totalBalance = totalDeposits - totalWithdrawals;

    console.log("\n📊 Calculated from transactions:");
    console.log(`   Total Balance: $${totalBalance.toFixed(2)}`);
    console.log(`   Total Deposits: $${totalDeposits.toFixed(2)}`);
    console.log(`   Total Donations: $${totalDonations.toFixed(2)}`);
    console.log(`   Total Withdrawals: $${totalWithdrawals.toFixed(2)}`);
    console.log(`   Total Transfers: $${totalTransfers.toFixed(2)}`);

    let systemBalance = await SystemBalance.findOne({ currency: "USD" });

    if (!systemBalance) {
      systemBalance = await SystemBalance.create({
        totalBalance,
        currency: "USD",
        totalDeposits,
        totalDonations,
        totalWithdrawals,
        totalTransfers,
        lastUpdated: new Date(),
      });
      console.log("\n✅ Created new system balance record");
    } else {
      systemBalance.totalBalance = totalBalance;
      systemBalance.totalDeposits = totalDeposits;
      systemBalance.totalDonations = totalDonations;
      systemBalance.totalWithdrawals = totalWithdrawals;
      systemBalance.totalTransfers = totalTransfers;
      systemBalance.lastUpdated = new Date();
      await systemBalance.save();
      console.log("\n✅ Updated system balance record");
    }

    console.log("\n🎉 System balance fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixSystemBalance();

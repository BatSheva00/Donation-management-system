import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Pagination,
  Grid,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  AccountBalance,
  Receipt,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios";
import {
  Transaction,
  SystemBalance,
  TransactionType,
  TransactionStatus,
} from "../types/payment.types";

export const TransactionManagement = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch system balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery<{
    success: boolean;
    data: SystemBalance;
  }>({
    queryKey: ["systemBalance"],
    queryFn: async () => {
      const response = await api.get("/payments/system-balance");
      return response.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0, // Always fetch fresh data
  });

  // Fetch all transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<{
    success: boolean;
    data: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: ["allTransactions", page],
    queryFn: async () => {
      const response = await api.get("/payments/transactions", {
        params: {
          page,
          limit,
        },
      });
      return response.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0, // Always fetch fresh data
  });

  const systemBalance = balanceData?.data;
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return "success";
      case TransactionStatus.PENDING:
        return "warning";
      case TransactionStatus.FAILED:
        return "error";
      case TransactionStatus.CANCELLED:
        return "default";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DONATION:
        return "Donation";
      case TransactionType.REFUND:
        return "Refund";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (balanceLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Transaction Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Monitor all donations and system balance
      </Typography>

      {/* System Balance Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Net Balance
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(systemBalance?.totalBalance || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Donations
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(systemBalance?.totalDonations || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Fees
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(systemBalance?.totalFees || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 56,
                    height: 56,
                  }}
                >
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Transactions
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {pagination?.total || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            All Transactions
          </Typography>

          {transactionsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Alert severity="info">No transactions found</Alert>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell>Date</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Gross Amount</TableCell>
                      <TableCell>Fee</TableCell>
                      <TableCell>Net Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Stripe ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id} hover>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          {transaction.userId &&
                          typeof transaction.userId === "object" ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {(transaction.userId as any).firstName}{" "}
                                {(transaction.userId as any).lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(transaction.userId as any).email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2">Unknown</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTypeLabel(transaction.type)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {formatCurrency(transaction.fee || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            {formatCurrency(
                              transaction.netAmount || transaction.amount
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={getStatusColor(transaction.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "monospace" }}
                            noWrap
                          >
                            {transaction.stripePaymentIntentId?.substring(
                              0,
                              20
                            )}
                            ...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {pagination && pagination.pages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.pages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

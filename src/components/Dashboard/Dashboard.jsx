import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Receipt as InvoiceIcon,
  People as CustomerIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useStripe } from "../../context/StripeContext";
import { useStripeService } from "../../services/stripeService";

const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  loading = false,
}) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {loading ? <CircularProgress size={24} /> : value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { isConnected } = useStripe();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalCustomers: 0,
    loading: true,
  });

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  useEffect(() => {
    if (isConnected && stripeService) {
      loadDashboardStats();
    } else {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [isConnected]); // Only depend on isConnected, not stripeService

  const loadDashboardStats = async () => {
    if (stats.loading) return;

    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Load invoices
      const invoicesResponse = await stripeService.getInvoices({ limit: 100 });
      const invoices = invoicesResponse.data;

      // Load customers
      const customersResponse = await stripeService.getCustomers({
        limit: 100,
      });
      const customers = customersResponse.data;

      // Calculate stats
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(
        (inv) => inv.status === "paid"
      ).length;
      const pendingInvoices = invoices.filter(
        (inv) => inv.status === "open"
      ).length;
      const totalCustomers = customers.length;

      setStats({
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalCustomers,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please configure your Stripe API key in Settings to view dashboard
          statistics.
        </Alert>
        <Button variant="contained" href="/settings">
          Go to Settings
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<InvoiceIcon sx={{ fontSize: 40 }} />}
            color="primary"
            loading={stats.loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid Invoices"
            value={stats.paidInvoices}
            icon={<MoneyIcon sx={{ fontSize: 40 }} />}
            color="success"
            loading={stats.loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            icon={<TrendingIcon sx={{ fontSize: 40 }} />}
            color="warning"
            loading={stats.loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<CustomerIcon sx={{ fontSize: 40 }} />}
            color="info"
            loading={stats.loading}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" href="/invoices/create">
              Create Invoice
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" href="/customers/create">
              Add Customer
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" href="/invoices">
              View All Invoices
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;

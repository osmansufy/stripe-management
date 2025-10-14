import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useStripe } from "../../context/StripeContext";
import { useStripeService } from "../../services/stripeService";

const CustomerList = () => {
  const navigate = useNavigate();
  const { isConnected } = useStripe();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  useEffect(() => {
    if (isConnected && stripeService) {
      loadCustomers();
    }
  }, [isConnected, page]); // Only depend on isConnected and page, not stripeService

  const loadCustomers = async () => {
    if (!stripeService || loading) return;

    try {
      setLoading(true);
      const response = await stripeService.getCustomers({
        limit: 20,
        starting_after:
          page > 1 ? customers[customers.length - 1]?.id : undefined,
      });

      if (page === 1) {
        setCustomers(response.data);
      } else {
        setCustomers((prev) => [...prev, ...response.data]);
      }
      setHasMore(response.has_more);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!stripeService || !searchTerm.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await stripeService.searchCustomers(
        `name:"${searchTerm}" OR email:"${searchTerm}"`
      );
      setCustomers(response.data);
      setHasMore(false);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleViewCustomer = () => {
    if (selectedCustomer) {
      navigate(`/customers/${selectedCustomer.id}`);
    }
    handleMenuClose();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Customers
        </Typography>
        <Alert severity="warning">
          Please configure your Stripe API key in Settings to view customers.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/customers/create")}
        >
          Add Customer
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
            <IconButton onClick={loadCustomers} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading && customers.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {customer.name || "No name"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{formatDate(customer.created)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`$${(customer.balance / 100).toFixed(2)}`}
                            color={customer.balance < 0 ? "error" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, customer)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {customers.length === 0 && !loading && (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No customers found
                  </Typography>
                </Box>
              )}

              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}
                  >
                    Load More
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewCustomer}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Customer</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Invoices</MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomerList;

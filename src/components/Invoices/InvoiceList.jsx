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
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useStripe } from "../../context/StripeContext";
import { useStripeService } from "../../services/stripeService";

const InvoiceList = () => {
  const navigate = useNavigate();
  const { isConnected } = useStripe();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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
      loadInvoices();
    }
  }, [isConnected, statusFilter, page]); // Only depend on isConnected, not stripeService

  const loadInvoices = async () => {
    if (!stripeService || loading) return;

    try {
      setLoading(true);
      const params = {
        limit: 20,
        starting_after:
          page > 1 ? invoices[invoices.length - 1]?.id : undefined,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await stripeService.getInvoices(params);

      if (page === 1) {
        setInvoices(response.data);
      } else {
        setInvoices((prev) => [...prev, ...response.data]);
      }
      setHasMore(response.has_more);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!stripeService || !searchTerm.trim()) {
      loadInvoices();
      return;
    }

    try {
      setLoading(true);
      const response = await stripeService.searchInvoices(
        `number:"${searchTerm}" OR customer:"${searchTerm}"`
      );
      setInvoices(response.data);
      setHasMore(false);
    } catch (error) {
      console.error("Error searching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleViewInvoice = () => {
    if (selectedInvoice) {
      navigate(`/invoices/${selectedInvoice.id}`);
    }
    handleMenuClose();
  };

  const handleEditInvoice = () => {
    if (selectedInvoice && selectedInvoice.status === "draft") {
      navigate(`/invoices/${selectedInvoice.id}/edit`);
    }
    handleMenuClose();
  };

  const handleInvoiceAction = async (action) => {
    if (!selectedInvoice || !stripeService) return;

    try {
      setLoading(true);
      switch (action) {
        case "finalize":
          await stripeService.finalizeInvoice(selectedInvoice.id);
          break;
        case "send":
          {
            const result = await stripeService.sendInvoiceWithChecks(
              selectedInvoice.id
            );
            if (!result.sent) {
              console.warn(
                "Invoice sent call succeeded but last_send_at is empty; check email settings."
              );
            }
          }
          break;
        case "pay":
          await stripeService.payInvoice(selectedInvoice.id);
          break;
        case "void":
          await stripeService.voidInvoice(selectedInvoice.id);
          break;
        case "uncollectible":
          await stripeService.markInvoiceUncollectible(selectedInvoice.id);
          break;
        default:
          break;
      }
      loadInvoices(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action} invoice:`, error);
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "open":
        return "warning";
      case "draft":
        return "info";
      case "void":
        return "error";
      case "uncollectible":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Invoices
        </Typography>
        <Alert severity="warning">
          Please configure your Stripe API key in Settings to view invoices.
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
        <Typography variant="h4">Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/invoices/create")}
        >
          Create Invoice
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Search invoices by number or customer..."
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
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectMenuItem value="all">All</SelectMenuItem>
                <SelectMenuItem value="draft">Draft</SelectMenuItem>
                <SelectMenuItem value="open">Open</SelectMenuItem>
                <SelectMenuItem value="paid">Paid</SelectMenuItem>
                <SelectMenuItem value="void">Void</SelectMenuItem>
                <SelectMenuItem value="uncollectible">
                  Uncollectible
                </SelectMenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
            <IconButton onClick={loadInvoices} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading && invoices.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {invoice.number || invoice.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoice.customer_name || "No customer"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.customer_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(invoice.total, invoice.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {invoice.due_date
                            ? formatDate(invoice.due_date)
                            : "-"}
                        </TableCell>
                        <TableCell>{formatDate(invoice.created)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, invoice)}
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

              {invoices.length === 0 && !loading && (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No invoices found
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
        <MenuItem onClick={handleViewInvoice}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedInvoice?.status === "draft" && (
          <MenuItem onClick={handleEditInvoice}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Invoice
          </MenuItem>
        )}
        {selectedInvoice?.status === "draft" && (
          <MenuItem onClick={() => handleInvoiceAction("finalize")}>
            Finalize Invoice
          </MenuItem>
        )}
        {selectedInvoice?.status === "open" && (
          <MenuItem onClick={() => handleInvoiceAction("send")}>
            <SendIcon sx={{ mr: 1 }} />
            Send Invoice
          </MenuItem>
        )}
        {selectedInvoice?.status === "open" && (
          <MenuItem onClick={() => handleInvoiceAction("pay")}>
            <PaymentIcon sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}
        {(selectedInvoice?.status === "open" ||
          selectedInvoice?.status === "draft") && (
          <MenuItem onClick={() => handleInvoiceAction("void")}>
            <CancelIcon sx={{ mr: 1 }} />
            Void Invoice
          </MenuItem>
        )}
        {selectedInvoice?.status === "open" && (
          <MenuItem onClick={() => handleInvoiceAction("uncollectible")}>
            Mark as Uncollectible
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default InvoiceList;

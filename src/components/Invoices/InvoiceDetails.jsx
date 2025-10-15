import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Send as SendIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useStripe } from "../../context/StripeContext";
import { useStripeService } from "../../services/stripeService";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useStripe();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
    title: "",
    message: "",
  });

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  useEffect(() => {
    if (isConnected && stripeService && id) {
      loadInvoice();
    }
  }, [isConnected, stripeService, id]);

  const loadInvoice = async () => {
    if (!stripeService) return;

    try {
      setLoading(true);
      const invoiceData = await stripeService.getInvoice(id);
      setInvoice(invoiceData);
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceAction = async (action) => {
    if (!invoice || !stripeService) return;

    try {
      setActionLoading(true);
      switch (action) {
        case "finalize":
          await stripeService.finalizeInvoice(invoice.id);
          break;
        case "send":
          // run preflight checks before sending
          const result = await stripeService.sendInvoiceWithChecks(invoice.id);
          if (!result.sent) {
            console.warn(
              "Invoice sent call succeeded but last_send_at is empty; check email settings."
            );
          }
          break;
        case "pay":
          await stripeService.payInvoice(invoice.id);
          break;
        case "void":
          await stripeService.voidInvoice(invoice.id);
          break;
        case "uncollectible":
          await stripeService.markInvoiceUncollectible(invoice.id);
          break;
        default:
          break;
      }
      await loadInvoice(); // Refresh the invoice data
    } catch (error) {
      console.error(`Error ${action} invoice:`, error);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "", title: "", message: "" });
    }
  };

  const openConfirmDialog = (action, title, message) => {
    setConfirmDialog({ open: true, action, title, message });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: "", title: "", message: "" });
  };

  const copyInvoiceLink = async () => {
    if (!invoice?.hosted_invoice_url) return;
    try {
      await navigator.clipboard.writeText(invoice.hosted_invoice_url);
      // Provide lightweight UX feedback
      alert("Invoice link copied to clipboard");
    } catch (_) {
      // Fallback for environments without Clipboard API permissions
      const textarea = document.createElement("textarea");
      textarea.value = invoice.hosted_invoice_url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Invoice link copied to clipboard");
    }
  };

  const emailInvoiceLink = () => {
    if (!invoice?.hosted_invoice_url) return;
    const subject = encodeURIComponent(
      `Invoice ${invoice.number || invoice.id}`
    );
    const body = encodeURIComponent(
      `Hi,\n\nPlease view and pay your invoice here: ${invoice.hosted_invoice_url}\n\nThank you.`
    );
    const to = encodeURIComponent(invoice.customer_email || "");
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
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

  const formatDateTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Invoice Details
        </Typography>
        <Alert severity="warning">
          Please configure your Stripe API key in Settings to view invoice
          details.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Invoice Details
        </Typography>
        <Alert severity="error">Invoice not found.</Alert>
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
        <Typography variant="h4">
          Invoice {invoice.number || invoice.id}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {invoice.status === "draft" && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            >
              Edit
            </Button>
          )}
          {invoice.status === "draft" && (
            <Button
              variant="contained"
              onClick={() =>
                openConfirmDialog(
                  "finalize",
                  "Finalize Invoice",
                  "Are you sure you want to finalize this invoice? This action cannot be undone."
                )
              }
              disabled={actionLoading}
            >
              Finalize
            </Button>
          )}
          {invoice.status === "open" && (
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() =>
                openConfirmDialog(
                  "send",
                  "Send Invoice",
                  "Are you sure you want to send this invoice to the customer?"
                )
              }
              disabled={actionLoading}
            >
              Send
            </Button>
          )}
          {invoice.status === "open" && (
            <Button
              variant="outlined"
              startIcon={<PaymentIcon />}
              onClick={() =>
                openConfirmDialog(
                  "pay",
                  "Mark as Paid",
                  "Are you sure you want to mark this invoice as paid?"
                )
              }
              disabled={actionLoading}
            >
              Mark Paid
            </Button>
          )}
          {(invoice.status === "open" || invoice.status === "draft") && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() =>
                openConfirmDialog(
                  "void",
                  "Void Invoice",
                  "Are you sure you want to void this invoice? This action cannot be undone."
                )
              }
              disabled={actionLoading}
            >
              Void
            </Button>
          )}
          {invoice.status === "open" && (
            <Button
              variant="outlined"
              color="error"
              onClick={() =>
                openConfirmDialog(
                  "uncollectible",
                  "Mark as Uncollectible",
                  "Are you sure you want to mark this invoice as uncollectible?"
                )
              }
              disabled={actionLoading}
            >
              Uncollectible
            </Button>
          )}
          {invoice.hosted_invoice_url && (
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => window.open(invoice.hosted_invoice_url, "_blank")}
            >
              View PDF
            </Button>
          )}
          {invoice.hosted_invoice_url && (
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={copyInvoiceLink}
            >
              Copy Link
            </Button>
          )}
          {invoice.hosted_invoice_url && (
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={emailInvoiceLink}
            >
              Email Link
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice ID
                  </Typography>
                  <Typography variant="body1">{invoice.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(invoice.created)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {invoice.due_date ? formatDate(invoice.due_date) : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {invoice.description || "No description"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Collection Method
                  </Typography>
                  <Typography variant="body1">
                    {invoice.collection_method}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Line Items
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.lines.data.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {line.description || "No description"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {line.quantity || 1}
                        </TableCell>
                        <TableCell align="right">
                          {(() => {
                            const unitAmount =
                              (line.price && line.price.unit_amount) ??
                              line.unit_amount ??
                              (line.amount && line.quantity
                                ? Math.round(line.amount / (line.quantity || 1))
                                : null);
                            const currency =
                              (line.price && line.price.currency) ??
                              line.currency ??
                              invoice.currency;
                            return unitAmount != null
                              ? formatCurrency(unitAmount, currency)
                              : "-";
                          })()}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            line.amount ?? 0,
                            line.currency ?? invoice.currency
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {invoice.customer_name || "No name"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {invoice.customer_email || "No email"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Customer ID
              </Typography>
              <Typography variant="body1">{invoice.customer}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Summary
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Tax</Typography>
                <Typography variant="body2">
                  {formatCurrency(
                    invoice.total_tax_amount || 0,
                    invoice.currency
                  )}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {formatCurrency(invoice.total, invoice.currency)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography variant="body2">Amount Due</Typography>
                <Typography variant="body2">
                  {formatCurrency(invoice.amount_due, invoice.currency)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleInvoiceAction(confirmDialog.action)}
            color="primary"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceDetails;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useStripe } from "../../context/StripeContext";
import { useStripeService } from "../../services/stripeService";
import CustomerSelect from "../Customers/CustomerSelect";

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const { isConnected } = useStripe();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: null,
    description: "",
    collection_method: "send_invoice",
    days_until_due: 30,
    currency: "gbp",
    metadata: {},
  });
  const [lineItems, setLineItems] = useState([
    {
      mode: "custom", // "custom" | "price"
      description: "",
      amount: "",
      quantity: 1,
      price: null, // Stripe price object when mode === "price"
    },
  ]);

  const [prices, setPrices] = useState([]);

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  useEffect(() => {
    const loadPrices = async () => {
      if (!stripeService) return;
      try {
        const res = await stripeService.getPrices({
          active: true,
          limit: 100,
          expand: ["data.product"],
        });
        setPrices(res.data || []);
      } catch (e) {
        // Ignore
      }
    };
    loadPrices();
  }, [stripeService]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        mode: "custom",
        description: "",
        amount: "",
        quantity: 1,
        price: null,
      },
    ]);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripeService || !formData.customer) return;

    try {
      setLoading(true);

      // Determine invoice currency: if any existing Price is used, force that currency
      const priceItems = lineItems.filter(
        (li) => li.mode === "price" && li.price?.currency
      );
      const priceCurrency = priceItems[0]?.price?.currency;
      if (
        priceCurrency &&
        priceItems.some((li) => li.price?.currency !== priceCurrency)
      ) {
        alert(
          "Selected prices have mixed currencies. Please choose prices with the same currency."
        );
        setLoading(false);
        return;
      }

      const invoiceCurrency = priceCurrency || formData.currency;

      // Create the invoice
      const invoiceData = {
        customer: formData.customer.id,
        description: formData.description,
        collection_method: formData.collection_method,
        currency: invoiceCurrency,
        days_until_due:
          formData.collection_method === "send_invoice"
            ? formData.days_until_due
            : undefined,
        metadata: formData.metadata,
        auto_advance: true,
      };

      const invoice = await stripeService.createInvoice(invoiceData);

      // Add line items
      for (const item of lineItems) {
        const quantity = parseInt(item.quantity) || 1;

        try {
          if (item.mode === "price") {
            // Require a selected price id
            if (!item.price?.id) continue;
            if (
              item.price?.currency &&
              item.price.currency !== invoiceCurrency
            ) {
              alert(
                `Price currency (${item.price.currency}) does not match invoice currency (${invoiceCurrency}).`
              );
              continue;
            }
            await stripeService.createInvoiceItem({
              customer: formData.customer.id,
              invoice: invoice.id,
              pricing: { price: item.price.id },
              quantity: quantity,
              description: item.description || undefined,
            });
          } else {
            // Custom ad-hoc amount: require positive amount and description is optional
            const amountNum = parseFloat(item.amount);
            if (!(amountNum > 0)) continue;
            const unitAmount = Math.round(amountNum * 100);
            await stripeService.createInvoiceItem({
              customer: formData.customer.id,
              invoice: invoice.id,
              description: item.description || undefined,
              unit_amount_decimal: String(unitAmount),
              currency: invoiceCurrency,
              quantity: quantity,
            });
          }
        } catch (itemError) {
          console.error("Error creating invoice item:", itemError);
        }
      }

      navigate(`/invoices/${invoice.id}`, {
        state: { message: "Invoice created successfully!" },
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      // You could add a notification here to show the error to the user
      alert(`Error creating invoice: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      cad: "C$",
      aud: "A$",
      jpy: "¥",
    };
    return symbols[currency] || "£";
  };

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + amount * quantity;
    }, 0);
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Create Invoice
        </Typography>
        <Alert severity="warning">
          Please configure your Stripe API key in Settings to create invoices.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Invoice
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <CustomerSelect
                      value={formData.customer}
                      onChange={(customer) =>
                        handleInputChange("customer", customer)
                      }
                      error={!formData.customer}
                      helperText={
                        !formData.customer ? "Please select a customer" : ""
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Collection Method</InputLabel>
                      <Select
                        value={formData.collection_method}
                        label="Collection Method"
                        onChange={(e) =>
                          handleInputChange("collection_method", e.target.value)
                        }
                      >
                        <MenuItem value="charge_automatically">
                          Charge Automatically
                        </MenuItem>
                        <MenuItem value="send_invoice">Send Invoice</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={formData.currency}
                        label="Currency"
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                      >
                        <MenuItem value="usd">USD</MenuItem>
                        <MenuItem value="eur">EUR</MenuItem>
                        <MenuItem value="gbp">GBP</MenuItem>
                        <MenuItem value="cad">CAD</MenuItem>
                        <MenuItem value="aud">AUD</MenuItem>
                        <MenuItem value="jpy">JPY</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.collection_method === "send_invoice" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Days Until Due"
                        type="number"
                        value={formData.days_until_due}
                        onChange={(e) =>
                          handleInputChange(
                            "days_until_due",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">Line Items</Typography>
                    <Typography variant="caption" color="text.secondary">
                      All items will use {formData.currency.toUpperCase()}{" "}
                      currency
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addLineItem}
                  >
                    Add Item
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.mode === "price" ? (
                              <Autocomplete
                                size="small"
                                options={prices}
                                value={item.price}
                                onChange={(e, value) =>
                                  handleLineItemChange(index, "price", value)
                                }
                                getOptionLabel={(opt) =>
                                  opt
                                    ? `${
                                        opt.nickname ||
                                        opt.product?.name ||
                                        opt.id
                                      } (${
                                        (opt.unit_amount ?? 0) / 100
                                      } ${opt.currency?.toUpperCase()})`
                                    : ""
                                }
                                renderInput={(params) => (
                                  <TextField {...params} label="Price" />
                                )}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                value={item.description}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Item description"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <FormControl size="small">
                              <Select
                                value={item.mode}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    "mode",
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="custom">Custom</MenuItem>
                                <MenuItem value="price">
                                  Existing price
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              label="Unit Price"
                              inputProps={{ step: "0.01" }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              label="Quantity"
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            {getCurrencySymbol(formData.currency)}
                            {(
                              (item.mode === "price"
                                ? (item.price?.unit_amount ?? 0) / 100
                                : parseFloat(item.amount) || 0) *
                              (parseInt(item.quantity) || 1)
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => removeLineItem(index)}
                              disabled={lineItems.length === 1}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Summary
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="h6">
                    {getCurrencySymbol(formData.currency)}
                    {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tax
                  </Typography>
                  <Typography variant="h6">
                    {getCurrencySymbol(formData.currency)}0.00
                  </Typography>
                </Box>

                <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {getCurrencySymbol(formData.currency)}
                    {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Box
              sx={{ mt: 3, display: "flex", gap: 2, flexDirection: "column" }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={
                  loading ||
                  !formData.customer ||
                  lineItems.length === 0 ||
                  lineItems.every((li) =>
                    li.mode === "price"
                      ? !li.price?.id
                      : !(parseFloat(li.amount) > 0)
                  )
                }
                startIcon={loading ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {loading ? "Creating..." : "Create Invoice"}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/invoices")}
                disabled={loading}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default InvoiceCreate;

import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Send as SendIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  CheckCircle as FinalizeIcon,
  Error as UncollectibleIcon,
} from "@mui/icons-material";

const InvoiceActions = ({ invoice, onAction, loading = false }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
    title: "",
    message: "",
  });

  const openConfirmDialog = (action, title, message) => {
    setConfirmDialog({ open: true, action, title, message });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: "", title: "", message: "" });
  };

  const handleConfirmAction = () => {
    onAction(confirmDialog.action);
    closeConfirmDialog();
  };

  const getActionButton = (
    action,
    icon,
    label,
    color = "primary",
    variant = "contained"
  ) => {
    return (
      <Button
        variant={variant}
        color={color}
        startIcon={icon}
        onClick={() => {
          const dialogs = {
            finalize: {
              title: "Finalize Invoice",
              message:
                "Are you sure you want to finalize this invoice? This action cannot be undone and will make the invoice ready for payment.",
            },
            send: {
              title: "Send Invoice",
              message:
                "Are you sure you want to send this invoice to the customer? An email will be sent to the customer with payment instructions.",
            },
            pay: {
              title: "Mark as Paid",
              message:
                "Are you sure you want to mark this invoice as paid? This will record the payment and update the invoice status.",
            },
            void: {
              title: "Void Invoice",
              message:
                "Are you sure you want to void this invoice? This action cannot be undone and will cancel the invoice.",
            },
            uncollectible: {
              title: "Mark as Uncollectible",
              message:
                "Are you sure you want to mark this invoice as uncollectible? This indicates that payment is unlikely to be received.",
            },
          };

          const dialog = dialogs[action];
          if (dialog) {
            openConfirmDialog(action, dialog.title, dialog.message);
          } else {
            onAction(action);
          }
        }}
        disabled={loading}
        size="small"
      >
        {label}
      </Button>
    );
  };

  const renderActions = () => {
    if (!invoice) return null;

    const actions = [];

    switch (invoice.status) {
      case "draft":
        actions.push(
          getActionButton("finalize", <FinalizeIcon />, "Finalize", "success")
        );
        actions.push(
          getActionButton("void", <CancelIcon />, "Void", "error", "outlined")
        );
        break;

      case "open":
        actions.push(
          getActionButton("send", <SendIcon />, "Send Invoice", "primary")
        );
        actions.push(
          getActionButton(
            "pay",
            <PaymentIcon />,
            "Mark Paid",
            "success",
            "outlined"
          )
        );
        actions.push(
          getActionButton("void", <CancelIcon />, "Void", "error", "outlined")
        );
        actions.push(
          getActionButton(
            "uncollectible",
            <UncollectibleIcon />,
            "Uncollectible",
            "error",
            "outlined"
          )
        );
        break;

      case "paid":
        // No actions available for paid invoices
        break;

      case "void":
        // No actions available for void invoices
        break;

      case "uncollectible":
        // No actions available for uncollectible invoices
        break;

      default:
        break;
    }

    return actions;
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {renderActions()}

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {confirmDialog.message}
          </Typography>
          {loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                Processing...
              </Box>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceActions;

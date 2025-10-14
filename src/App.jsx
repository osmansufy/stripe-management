import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Container, Snackbar, Alert } from "@mui/material";
import { StripeProvider } from "./context/StripeContext";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import InvoiceList from "./components/Invoices/InvoiceList";
import InvoiceCreate from "./components/Invoices/InvoiceCreate";
import InvoiceDetails from "./components/Invoices/InvoiceDetails";
import CustomerList from "./components/Customers/CustomerList";
import CustomerCreate from "./components/Customers/CustomerCreate";
import Settings from "./components/Settings/Settings";

function App() {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <StripeProvider onNotification={showNotification}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Layout />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/create" element={<InvoiceCreate />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/create" element={<CustomerCreate />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Container>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </StripeProvider>
  );
}

export default App;

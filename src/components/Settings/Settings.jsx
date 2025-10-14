import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useStripe } from "../../context/StripeContext";

const Settings = () => {
  const {
    apiKey,
    isConnected,
    loading,
    setApiKey,
    disconnect,
    testConnection,
  } = useStripe();
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      return;
    }
    await setApiKey(newApiKey.trim());
    setNewApiKey("");
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      await testConnection();
    } finally {
      setTestLoading(false);
    }
  };

  const maskApiKey = (key) => {
    if (!key) return "";
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stripe API Configuration
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Connection Status
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isConnected ? (
                    <>
                      <CheckCircle color="success" />
                      <Chip label="Connected" color="success" size="small" />
                    </>
                  ) : (
                    <>
                      <Error color="error" />
                      <Chip label="Not Connected" color="error" size="small" />
                    </>
                  )}
                </Box>
              </Box>

              {apiKey && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Current API Key
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      value={maskApiKey(apiKey)}
                      disabled
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleTestConnection}
                      disabled={testLoading}
                      size="small"
                    >
                      {testLoading ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={disconnect}
                      size="small"
                    >
                      Disconnect
                    </Button>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {apiKey ? "Update API Key" : "Enter Stripe API Key"}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <TextField
                  fullWidth
                  type={showApiKey ? "text" : "password"}
                  label="Stripe Secret Key"
                  placeholder="sk_test_..."
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowApiKey(!showApiKey)}
                          edge="end"
                        >
                          {showApiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveApiKey}
                  disabled={loading || !newApiKey.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Security Note:</strong> Your API key is encrypted and
                  stored securely on your device. Make sure you're using a test
                  key (sk_test_...) for development and a live key (sk_live_...)
                  only for production use.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Get your Stripe API key from the Stripe Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Enter your secret key (starts with sk_test_ or sk_live_)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. Test the connection to verify it works
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Start managing your invoices and customers!
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Create and manage invoices
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Customer management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Invoice search and filtering
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • PDF generation and viewing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Real-time invoice status updates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;

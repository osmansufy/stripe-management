import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '../../context/StripeContext';
import { useStripeService } from '../../services/stripeService';

const CustomerCreate = () => {
  const navigate = useNavigate();
  const { isConnected } = useStripe();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    metadata: {},
  });

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripeService) return;

    try {
      setLoading(true);
      
      // Clean up empty fields
      const cleanedData = { ...formData };
      if (!cleanedData.name.trim()) delete cleanedData.name;
      if (!cleanedData.email.trim()) delete cleanedData.email;
      if (!cleanedData.phone.trim()) delete cleanedData.phone;
      if (!cleanedData.description.trim()) delete cleanedData.description;
      
      // Clean up address
      const cleanedAddress = {};
      Object.entries(cleanedData.address).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedAddress[key] = value.trim();
        }
      });
      if (Object.keys(cleanedAddress).length > 0) {
        cleanedData.address = cleanedAddress;
      } else {
        delete cleanedData.address;
      }

      const customer = await stripeService.createCustomer(cleanedData);
      navigate('/customers', { state: { message: 'Customer created successfully!' } });
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Create Customer
        </Typography>
        <Alert severity="warning">
          Please configure your Stripe API key in Settings to create customers.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Customer
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Address (Optional)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={formData.address.line1}
                  onChange={(e) => handleInputChange('address.line1', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={formData.address.line2}
                  onChange={(e) => handleInputChange('address.line2', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.address.postal_code}
                  onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/customers')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Customer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerCreate;

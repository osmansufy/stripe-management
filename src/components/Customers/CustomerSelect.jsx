import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import { useStripeService } from "../../services/stripeService";

const CustomerSelect = ({
  value,
  onChange,
  error,
  helperText,
  disabled = false,
}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  let stripeService;
  try {
    stripeService = useStripeService();
  } catch (error) {
    // Stripe not initialized
  }

  useEffect(() => {
    if (stripeService) {
      loadCustomers();
    }
  }, []); // Only run once on mount, not when stripeService changes

  const loadCustomers = async () => {
    if (!stripeService || loading) return;

    try {
      setLoading(true);
      const response = await stripeService.getCustomers({ limit: 100 });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const getOptionLabel = (option) => {
    if (typeof option === "string") return option;
    return option.name
      ? `${option.name} (${option.email || option.id})`
      : option.id;
  };

  const isOptionEqualToValue = (option, value) => {
    if (!option || !value) return false;
    return option.id === value.id;
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={customers}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer"
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Box>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </Box>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Box sx={{ fontWeight: "medium" }}>{option.name || "No name"}</Box>
            <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
              {option.email || option.id}
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default CustomerSelect;

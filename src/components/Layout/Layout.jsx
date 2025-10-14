import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Receipt as InvoiceIcon,
  People as CustomerIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Invoices", icon: <InvoiceIcon />, path: "/invoices" },
  { text: "Create Invoice", icon: <AddIcon />, path: "/invoices/create" },
  { text: "Customers", icon: <CustomerIcon />, path: "/customers" },
  { text: "Create Customer", icon: <AddIcon />, path: "/customers/create" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1e293b",
            color: "white",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            Stripe Manager
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "#334155" }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  color: "white",
                  "&.Mui-selected": {
                    backgroundColor: "#3b82f6",
                    "&:hover": {
                      backgroundColor: "#2563eb",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#334155",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

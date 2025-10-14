# Stripe Invoice Management Desktop App

A comprehensive desktop application built with Electron and React for managing Stripe invoices and customers. This app provides a user-friendly interface for your marketing team to create, view, and manage invoices without needing to access the Stripe Dashboard.

## Features

### 🧾 Invoice Management
- **Create Invoices**: Build invoices with line items, customer selection, and custom descriptions
- **View & Edit**: Detailed invoice view with full editing capabilities for draft invoices
- **Invoice Actions**: Finalize, send, pay, void, and mark invoices as uncollectible
- **Search & Filter**: Advanced search by invoice number, customer, or status
- **PDF Generation**: View and download invoice PDFs
- **Status Tracking**: Real-time status updates (draft, open, paid, void, uncollectible)

### 👥 Customer Management
- **Customer List**: View all customers with search and pagination
- **Create Customers**: Add new customers with complete contact information
- **Customer Details**: View customer information and associated invoices
- **Customer Selection**: Easy customer selection when creating invoices

### 📊 Dashboard
- **Overview Statistics**: Total invoices, paid invoices, pending invoices, and customer count
- **Quick Actions**: Fast access to common tasks
- **Real-time Updates**: Live data from your Stripe account

### ⚙️ Settings & Security
- **API Key Management**: Secure storage of Stripe API keys
- **Connection Testing**: Verify API key validity
- **Encrypted Storage**: Uses Electron's secure storage for API keys

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Stripe account with API keys

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stripe-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run the Electron app**
   ```bash
   npm run electron-dev
   ```

### Building for Production

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Package the Electron app**
   ```bash
   npm run electron-pack
   ```

The packaged app will be available in the `dist` folder.

## Usage

### First Time Setup

1. **Launch the application**
2. **Navigate to Settings** (gear icon in the sidebar)
3. **Enter your Stripe API key**:
   - For testing: Use a key starting with `sk_test_`
   - For production: Use a key starting with `sk_live_`
4. **Test the connection** to verify your API key works
5. **Start managing your invoices!**

### Creating an Invoice

1. **Go to "Create Invoice"** from the sidebar
2. **Select a customer** from the dropdown (or create a new one)
3. **Add line items** with descriptions, amounts, and quantities
4. **Set collection method** (charge automatically or send invoice)
5. **Review the summary** and click "Create Invoice"

### Managing Invoices

- **View all invoices** in the Invoices section
- **Filter by status** (draft, open, paid, void, uncollectible)
- **Search invoices** by number or customer
- **Perform actions** using the menu button (⋮) on each invoice
- **View detailed information** by clicking on an invoice

### Customer Management

- **View customers** in the Customers section
- **Create new customers** with complete contact information
- **Search customers** by name or email
- **View customer details** and associated invoices

## API Key Security

- API keys are encrypted and stored securely on your device
- Keys are never transmitted or stored in the cloud
- Use test keys (`sk_test_`) for development and live keys (`sk_live_`) only for production
- The app supports both test and live Stripe accounts

## Supported Stripe Features

### Invoice Operations
- ✅ Create invoices
- ✅ Update draft invoices
- ✅ Delete draft invoices
- ✅ Finalize invoices
- ✅ Send invoices via email
- ✅ Mark invoices as paid
- ✅ Void invoices
- ✅ Mark invoices as uncollectible
- ✅ Search invoices
- ✅ Preview invoices
- ✅ View hosted invoice PDFs

### Customer Operations
- ✅ List customers
- ✅ Create customers
- ✅ Update customers
- ✅ View customer details
- ✅ Search customers

### Additional Features
- ✅ Balance retrieval
- ✅ Account information
- ✅ Metadata support
- ✅ Custom fields
- ✅ Tax calculations
- ✅ Multiple currencies

## Development

### Project Structure
```
stripe-management/
├── electron/           # Electron main process
├── src/
│   ├── components/     # React components
│   │   ├── Invoices/   # Invoice-related components
│   │   ├── Customers/  # Customer-related components
│   │   ├── Settings/   # Settings components
│   │   └── Layout/     # Layout components
│   ├── context/        # React context providers
│   ├── services/       # API service layers
│   └── App.jsx         # Main React app
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

### Available Scripts

- `npm start` - Start React development server
- `npm run electron-dev` - Run Electron in development mode
- `npm run build` - Build React app for production
- `npm run electron-pack` - Package Electron app for distribution
- `npm test` - Run tests

### Technology Stack

- **Frontend**: React 18 with Material-UI
- **Desktop**: Electron
- **API**: Stripe Node.js SDK
- **State Management**: React Context and Hooks
- **Build Tool**: Create React App
- **Styling**: Material-UI with custom theme

## Troubleshooting

### Common Issues

1. **"Stripe not initialized" error**
   - Make sure you've entered a valid API key in Settings
   - Test the connection to verify the key works

2. **"Connection test failed"**
   - Check that your API key is correct
   - Ensure you have internet connectivity
   - Verify your Stripe account is active

3. **App won't start**
   - Make sure all dependencies are installed: `npm install`
   - Check that Node.js version is 16 or higher

4. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for any TypeScript or linting errors

### Getting Help

- Check the Stripe API documentation: https://stripe.com/docs/api
- Review the console for error messages
- Ensure your Stripe account has the necessary permissions

## License

This project is for internal use only. Please ensure compliance with Stripe's terms of service when using their API.

## Contributing

This is an internal tool. For updates or improvements, please contact the development team.

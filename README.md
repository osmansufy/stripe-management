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

## Download & Installation

### 📥 Download Pre-built Applications

Download the latest version for your platform from [GitHub Releases](https://github.com/osmansufy/stripe-management/releases/latest):

| Platform | Download | Size |
|----------|----------|------|
| **Windows** | [Windows Installer (.exe)](https://github.com/osmansufy/stripe-management/releases/latest) | ~80 MB |
| **macOS** | [macOS DMG (.dmg)](https://github.com/osmansufy/stripe-management/releases/latest) | ~96 MB |
| **Linux** | [AppImage (.AppImage)](https://github.com/osmansufy/stripe-management/releases/latest) | ~107 MB |

### 🔧 Installation Instructions

#### Windows
1. Download `Stripe Invoice Manager Setup 1.0.0.exe`
2. Double-click the installer
3. Follow the installation wizard
4. Launch from Start Menu

#### macOS
1. Download `Stripe Invoice Manager-1.0.0-arm64.dmg`
2. Open the DMG file
3. Drag "Stripe Invoice Manager" to Applications folder
4. Launch from Applications
5. If you see a security warning, go to System Preferences → Security & Privacy and click "Open Anyway"

#### Linux
1. Download `Stripe Invoice Manager-1.0.0-arm64.AppImage`
2. Make it executable:
   ```bash
   chmod +x "Stripe Invoice Manager-1.0.0-arm64.AppImage"
   ```
3. Run it:
   ```bash
   ./Stripe\ Invoice\ Manager-1.0.0-arm64.AppImage
   ```

---

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Stripe account with API keys

### Setup from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/osmansufy/stripe-management.git
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

4. **Run the Electron app (in another terminal)**
   ```bash
   npm run electron-dev
   ```

### Building for Production

1. **Build for current platform**
   ```bash
   npm run electron-pack
   ```

2. **Build for specific platforms**
   ```bash
   # Windows and Linux
   npm run build
   npx electron-builder --win --linux

   # macOS only
   npx electron-builder --mac

   # All platforms
   npx electron-builder --win --linux --mac
   ```

The packaged apps will be available in the `dist` folder.

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

## System Requirements

**Minimum Requirements:**
- **RAM**: 4 GB
- **Disk Space**: 200 MB
- **OS**: 
  - Windows 10/11 (ARM64)
  - macOS 10.12+ (Apple Silicon)
  - Linux (ARM64)

**Recommended:**
- **RAM**: 8 GB or more
- Active internet connection for Stripe API access

## Author

**Osman Goni Sufy**
- GitHub: [@osmansufy](https://github.com/osmansufy)
- Repository: [stripe-management](https://github.com/osmansufy/stripe-management)

## Support

For bug reports and feature requests, please create an issue on [GitHub Issues](https://github.com/osmansufy/stripe-management/issues).

## License

This project is for internal use. Please ensure compliance with Stripe's terms of service when using their API.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [Material-UI](https://mui.com/)
- Stripe integration via [Stripe Node.js SDK](https://github.com/stripe/stripe-node)

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025

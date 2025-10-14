import { useMemo } from "react";
import { useStripe } from "../context/StripeContext";

export const useStripeService = () => {
  const { stripe } = useStripe();

  return useMemo(() => {
    if (!stripe) {
      throw new Error(
        "Stripe not initialized. Please configure your API key in Settings."
      );
    }

    // Customer operations
    const getCustomers = async (params = {}) => {
      return await stripe.customers.list(params);
    };

    const getCustomer = async (customerId) => {
      return await stripe.customers.retrieve(customerId);
    };

    const createCustomer = async (customerData) => {
      return await stripe.customers.create(customerData);
    };

    const updateCustomer = async (customerId, customerData) => {
      return await stripe.customers.update(customerId, customerData);
    };

    const deleteCustomer = async (customerId) => {
      return await stripe.customers.del(customerId);
    };

    const searchCustomers = async (query) => {
      return await stripe.customers.search({ query });
    };

    // Invoice operations
    const getInvoices = async (params = {}) => {
      return await stripe.invoices.list(params);
    };

    const getInvoice = async (invoiceId) => {
      return await stripe.invoices.retrieve(invoiceId);
    };

    const createInvoice = async (invoiceData) => {
      return await stripe.invoices.create(invoiceData);
    };

    const createPreviewInvoice = async (params) => {
      return await stripe.invoices.createPreview(params);
    };

    const updateInvoice = async (invoiceId, invoiceData) => {
      return await stripe.invoices.update(invoiceId, invoiceData);
    };

    const deleteInvoice = async (invoiceId) => {
      return await stripe.invoices.del(invoiceId);
    };

    const finalizeInvoice = async (invoiceId) => {
      return await stripe.invoices.finalizeInvoice(invoiceId);
    };

    const sendInvoice = async (invoiceId) => {
      return await stripe.invoices.sendInvoice(invoiceId);
    };

    const payInvoice = async (invoiceId) => {
      return await stripe.invoices.pay(invoiceId);
    };

    const voidInvoice = async (invoiceId) => {
      return await stripe.invoices.voidInvoice(invoiceId);
    };

    const markInvoiceUncollectible = async (invoiceId) => {
      return await stripe.invoices.markUncollectible(invoiceId);
    };

    const searchInvoices = async (query) => {
      return await stripe.invoices.search({ query });
    };

    // Invoice Items operations
    const getInvoiceItems = async (params = {}) => {
      return await stripe.invoiceItems.list(params);
    };

    const createInvoiceItem = async (itemData) => {
      return await stripe.invoiceItems.create(itemData);
    };

    const updateInvoiceItem = async (itemId, itemData) => {
      return await stripe.invoiceItems.update(itemId, itemData);
    };

    const deleteInvoiceItem = async (itemId) => {
      return await stripe.invoiceItems.del(itemId);
    };

    // Balance and account info
    const getBalance = async () => {
      return await stripe.balance.retrieve();
    };

    const getAccount = async () => {
      return await stripe.accounts.retrieve();
    };

    // Catalog (Prices/Products)
    const getPrices = async (params = {}) => {
      return await stripe.prices.list(params);
    };

    // Utility: Validate prerequisites and send invoice
    const sendInvoiceWithChecks = async (invoiceId) => {
      // Fetch latest invoice data
      const invoice = await getInvoice(invoiceId);

      // Ensure invoice has a customer
      if (!invoice.customer) {
        throw new Error("Invoice has no customer attached.");
      }

      // Ensure customer has an email
      let customerEmail = invoice.customer_email;
      if (!customerEmail) {
        const customer = await getCustomer(invoice.customer);
        customerEmail = customer?.email;
      }
      if (!customerEmail) {
        throw new Error(
          "Customer has no email. Add an email to the customer before sending."
        );
      }

      // Ensure collection_method is send_invoice. If draft we can update, otherwise block
      if (invoice.collection_method !== "send_invoice") {
        if (invoice.status === "draft") {
          await updateInvoice(invoiceId, { collection_method: "send_invoice" });
        } else {
          throw new Error(
            "Invoice is not configured for email (collection_method is charge_automatically). Duplicate the invoice as draft and set collection method to send_invoice."
          );
        }
      }

      // Send the invoice
      await sendInvoice(invoiceId);

      // Re-fetch to check last_send_at (helps detect account email settings issues)
      const updated = await getInvoice(invoiceId);
      return {
        sent: Boolean(updated.last_send_at),
        invoice: updated,
      };
    };

    return {
      // Customer methods
      getCustomers,
      getCustomer,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      searchCustomers,

      // Invoice methods
      getInvoices,
      getInvoice,
      createInvoice,
      createPreviewInvoice,
      updateInvoice,
      deleteInvoice,
      finalizeInvoice,
      sendInvoice,
      sendInvoiceWithChecks,
      payInvoice,
      voidInvoice,
      markInvoiceUncollectible,
      searchInvoices,

      // Invoice Items methods
      getInvoiceItems,
      createInvoiceItem,
      updateInvoiceItem,
      deleteInvoiceItem,

      // Account methods
      getBalance,
      getAccount,

      // Catalog methods
      getPrices,
    };
  }, [stripe]);
};

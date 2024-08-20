import { sql } from "@vercel/postgres";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";

export const fetchRevenue = async () => {
  try {
    // uncomment for testing loading skeleton
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
};

export const fetchLatestInvoices = async () => {
  // uncomment for testing loading skeleton
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
};

interface QueryResult {
  invoice_count: number;
  customer_count: number;
  paidInvoices_count: number;
  pendingInvoices_count: number;
}

export const fetchCardData = async () => {
  try {
    const data = await sql<QueryResult>`
      SELECT
        (SELECT COUNT(*) FROM invoices) AS "invoice_count",
        (SELECT COUNT(*) FROM customers) AS "customer_count",
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paidInvoices_count",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pendingInvoices_count"
      FROM invoices
    `;

    const numberOfInvoices = Number(data.rows[0].invoice_count ?? "0");
    const numberOfCustomers = Number(data.rows[0].customer_count ?? "0");
    const totalPaidInvoices = formatCurrency(
      data.rows[0].paidInvoices_count ?? "0"
    );
    const totalPendingInvoices = formatCurrency(
      data.rows[0].pendingInvoices_count ?? "0"
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
};

const ITEMS_PER_PAGE = 6;

export const fetchFilteredInvoices = async (
  query: string,
  currentPage: number
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
      ORDER BY i.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
};

export const fetchInvoicesPages = async (query: string) => {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    WHERE
      c.name ILIKE ${`%${query}%`} OR
      c.email ILIKE ${`%${query}%`} OR
      i.amount::text ILIKE ${`%${query}%`} OR
      i.date::text ILIKE ${`%${query}%`} OR
      i.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
};

export const fetchInvoiceById = async (id: string) => {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        id,
        customer_id,
        amount,
        status
      FROM invoices
      WHERE id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
};

export const fetchCustomers = async () => {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
};

export const fetchFilteredCustomers = async (query: string) => {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  c.id,
		  c.name,
		  c.email,
		  c.image_url,
		  COUNT(i.id) AS total_invoices,
		  SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid
		FROM customers c
		LEFT JOIN invoices i ON c.id = i.customer_id
		WHERE
		  c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`}
		GROUP BY c.id, c.name, c.email, c.image_url
		ORDER BY c.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
};

/**
 * Backend API client. Uses NEXT_PUBLIC_BACKEND_URL so it works in the browser.
 */
const getBaseUrl = () =>
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "")
    : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const api = {
  /** POST /api/login */
  async login(email: string, password: string) {
    const res = await fetch(`${getBaseUrl()}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data as { success: boolean; user_id?: number };
  },

  /** POST /api/users - create user (register) */
  async createUser(body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    stripeCustomerId?: string;
    interests?: string[];
    locations?: string[];
  }) {
    const res = await fetch(`${getBaseUrl()}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data as { user_id: number };
  },

  /** GET /api/users/:email */
  async getUserByEmail(email: string) {
    const res = await fetch(`${getBaseUrl()}/api/users/${encodeURIComponent(email)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load user");
    return data as {
      user_id: number;
      first_name: string;
      last_name: string;
      email: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country?: string;
      stripe_customer_id?: string;
      interests: string[];
      locations: string[];
    };
  },

  /** PUT /api/users/:email */
  async updateUser(email: string, body: Record<string, unknown>) {
    const res = await fetch(`${getBaseUrl()}/api/users/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update user");
    return data as { updated: boolean };
  },

  /** POST /api/donations */
  async createDonation(body: { user_id: number; campaign_url?: string; amount: number; currency: string }) {
    const res = await fetch(`${getBaseUrl()}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create donation");
    return data as { donation_id: number };
  },

  /** GET /api/users/:userId/donations */
  async getDonationsByUser(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/donations`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load donations");
    return data as Array<{
      donation_id: number;
      user_id: number;
      campaign_url?: string;
      amount: number;
      currency: string;
      created_at?: string;
    }>;
  },

  /** GET /api/donations/:id */
  async getDonationById(id: number) {
    const res = await fetch(`${getBaseUrl()}/api/donations/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load donation");
    return data;
  },

  /** GET /model/test - model health check */
  async modelTest() {
    const res = await fetch(`${getBaseUrl()}/model/test`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Model endpoint failed");
    return data as { message: string };
  },

  /** GET /api/users/:userId/impact */
  async getImpactStats(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/impact`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load impact stats");
    return data as { totalDonated: number; peopleHelped: number; countriesSupported: number };
  },

  /** GET /api/opportunities */
  async getOpportunities(params?: { urgency?: string; country?: string; issue_id?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${getBaseUrl()}/api/opportunities${q ? `?${q}` : ""}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load opportunities");
    return data;
  },

  /** GET /api/opportunities/featured */
  async getFeaturedOpportunity() {
    const res = await fetch(`${getBaseUrl()}/api/opportunities/featured`);
    if (res.status === 404) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load featured opportunity");
    return data;
  },

  /** GET /api/opportunities/:id */
  async getOpportunityById(id: number | string) {
    const res = await fetch(`${getBaseUrl()}/api/opportunities/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load opportunity");
    return data;
  },

  /** GET /api/global-issues */
  async getGlobalIssues() {
    const res = await fetch(`${getBaseUrl()}/api/global-issues`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load global issues");
    return data as Array<{ name: string; icon: string; count: number }>;
  },

  /** GET /api/users/:userId/notifications */
  async getNotifications(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/notifications`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load notifications");
    return data;
  },

  /** PATCH /api/users/:userId/notifications/read-all */
  async markAllNotificationsRead(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/notifications/read-all`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update notifications");
    return data as { updated: boolean };
  },

  /** PATCH /api/users/:userId/notifications/:id/read */
  async markNotificationRead(userId: number, notificationId: string | number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update notification");
    return data as { updated: boolean };
  },

  /** POST /api/users/:userId/notifications */
  async createNotification(userId: number, body: Record<string, unknown>) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create notification");
    return data as { notification_id: number };
  },

  /** DELETE /api/users/:userId/notifications/:id */
  async deleteNotification(userId: number, notificationId: string | number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/notifications/${notificationId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete notification");
    return data as { deleted: boolean };
  },

  /** GET /api/users/:userId/wallet */
  async getWallet(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/wallet`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load wallet");
    return data as { balance_cents: number; balance: string; currency: string };
  },

  /** GET /api/users/:userId/payment-methods */
  async getPaymentMethods(userId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/payment-methods`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load payment methods");
    return data as Array<{ id: number; lastFour: string; expMonth: number; expYear: number }>;
  },

  /** POST /api/users/:userId/payment-methods */
  async addPaymentMethod(userId: number, body: { last_four?: string; lastFour?: string; exp_month?: number; expMonth?: number; exp_year?: number; expYear?: number }) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/payment-methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add payment method");
    return data as { payment_method_id: number };
  },

  /** DELETE /api/users/:userId/payment-methods/:id */
  async deletePaymentMethod(userId: number, paymentMethodId: number) {
    const res = await fetch(`${getBaseUrl()}/api/users/${userId}/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to remove payment method");
    return data as { deleted: boolean };
  },

  /** GET /model/donation_url - backend expects GET with body (non-standard); use for payment URL when needed */
  async getDonationUrl(params: {
    amount: number;
    currency: string;
    user_id: number;
    donation_id: number;
    donation_date?: string;
    donation_status?: string;
    donation_amount?: number;
  }) {
    const res = await fetch(`${getBaseUrl()}/model/donation_url`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get donation URL");
    return data as { message: string; user: unknown };
  },
};

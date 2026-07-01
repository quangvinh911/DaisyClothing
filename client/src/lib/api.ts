export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAssetUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const root = API_BASE.replace(/\/api$/, '');
  return `${root}${path}`;
};

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Public API Methods ────────────────────────────────────

export const api = {
  // Posts
  getPosts: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi(`/posts${query}`, { next: { revalidate: 60 } });
  },

  getPostBySlug: (slug: string) =>
    fetchApi(`/posts/by-slug/${slug}`, { next: { revalidate: 3600 } }),

  getPostSlugs: () =>
    fetchApi<string[]>('/posts/slugs', { next: { revalidate: 60 } }),

  getLatestPosts: (count: number = 6) =>
    fetchApi(`/posts/latest?count=${count}`, { next: { revalidate: 60 } }),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi(`/products${query}`, { cache: 'no-store' });
  },

  getFeaturedProducts: (count: number = 8) =>
    fetchApi(`/products/featured?count=${count}`, { cache: 'no-store' }),

  getProductBySlug: (slug: string) =>
    fetchApi(`/products/by-slug/${slug}`, { cache: 'no-store' }),

  // Categories
  getCategories: () =>
    fetchApi('/categories', { next: { revalidate: 300 } }),

  getCategoryBySlug: (slug: string) =>
    fetchApi(`/categories/${slug}`, { next: { revalidate: 300 } }),

  // Tags
  getTags: () => fetchApi('/tags', { next: { revalidate: 300 } }),

  // Social Links
  getSocialLinks: () =>
    fetchApi('/social-links', { next: { revalidate: 300 } }),

  // Settings
  getSettings: () =>
    fetchApi('/settings', { next: { revalidate: 300 } }),

  // Analytics (public)
  trackPageView: (data: {
    pageUrl: string;
    pageType: string;
    referenceId?: string;
    referrerUrl?: string;
  }) =>
    fetchApi('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
      cache: 'no-store',
    }),
};

// ─── Admin API Methods ─────────────────────────────────────

export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    }),

  getProfile: (token: string) =>
    fetchApi('/auth/profile', { token, cache: 'no-store' }),

  changePassword: (token: string, data: unknown) =>
    fetchApi('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  // Posts
  getPosts: (token: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi(`/posts/admin/list${query}`, { token, cache: 'no-store' });
  },

  getPostById: (token: string, id: string) =>
    fetchApi(`/posts/admin/${id}`, { token, cache: 'no-store' }),

  createPost: (token: string, data: unknown) =>
    fetchApi('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  updatePost: (token: string, id: string, data: unknown) =>
    fetchApi(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  deletePost: (token: string, id: string) =>
    fetchApi(`/posts/${id}`, { method: 'DELETE', token, cache: 'no-store' }),

  // Products
  getProducts: (token: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi(`/products/admin/list${query}`, { token, cache: 'no-store' });
  },

  createProduct: (token: string, data: unknown) =>
    fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  updateProduct: (token: string, id: string, data: unknown) =>
    fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  deleteProduct: (token: string, id: string) =>
    fetchApi(`/products/${id}`, { method: 'DELETE', token, cache: 'no-store' }),

  scanProducts: (token: string, data: unknown) =>
    fetchApi('/products/admin/scan', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  bulkDeleteProducts: (token: string, ids: string[]) =>
    fetchApi('/products/admin/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
      token,
      cache: 'no-store',
    }),

  // Categories
  createCategory: (token: string, data: unknown) =>
    fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  updateCategory: (token: string, id: string, data: unknown) =>
    fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  deleteCategory: (token: string, id: string) =>
    fetchApi(`/categories/${id}`, { method: 'DELETE', token, cache: 'no-store' }),

  // Analytics
  getDashboardStats: (token: string) =>
    fetchApi('/analytics/dashboard', { token, cache: 'no-store' }),

  getTopProducts: (token: string, days: number = 30) =>
    fetchApi(`/analytics/top-products?days=${days}`, { token, cache: 'no-store' }),

  getClicksByDay: (token: string, days: number = 30) =>
    fetchApi(`/analytics/clicks-by-day?days=${days}`, { token, cache: 'no-store' }),

  getViewsByDay: (token: string, days: number = 30) =>
    fetchApi(`/analytics/views-by-day?days=${days}`, { token, cache: 'no-store' }),

  getClicksByPlatform: (token: string, days: number = 30) =>
    fetchApi(`/analytics/clicks-by-platform?days=${days}`, { token, cache: 'no-store' }),

  getTopReferrers: (token: string, days: number = 30) =>
    fetchApi(`/analytics/top-referrers?days=${days}`, { token, cache: 'no-store' }),

  // Upload
  uploadImage: async (token: string, file: File, subfolder: string = 'images') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE}/upload/image?subfolder=${subfolder}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // Settings
  updateSetting: (token: string, key: string, value: string) =>
    fetchApi(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
      token,
      cache: 'no-store',
    }),

  // Social Links
  getSocialLinks: (token: string) =>
    fetchApi('/social-links/admin/list', { token, cache: 'no-store' }),

  createSocialLink: (token: string, data: unknown) =>
    fetchApi('/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  updateSocialLink: (token: string, id: string, data: unknown) =>
    fetchApi(`/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
      cache: 'no-store',
    }),

  deleteSocialLink: (token: string, id: string) =>
    fetchApi(`/social-links/${id}`, { method: 'DELETE', token, cache: 'no-store' }),
};

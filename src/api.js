// DesignerSale.com.au — Central API Client (api.js)
// Wraps fetch calls to the real Node.js backend.

(function () {
    const isLocalStatic = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
    const API_BASE = isLocalStatic ? 'https://designer-sale.vercel.app/api' : '/api';

    function getAuthToken() {
        try {
            return localStorage.getItem('ds_admin_token');
        } catch (e) { return null; }
    }

    async function fetchAPI(endpoint, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = { ...options, headers };
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        const res = await fetch(`${API_BASE}${endpoint}`, config);
        
        // Handle non-JSON responses gracefully (like 401/403)
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch(e) { data = { error: text || res.statusText }; }

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                try { localStorage.removeItem('ds_admin_token'); localStorage.removeItem('ds_admin_auth'); } catch(e){}
                window.location.reload();
                return;
            }
            throw new Error(data.error || `HTTP Error ${res.status}`);
        }
        return data;
    }

    const API = {
        // ---- Auth ----
        auth: {
            async login(username, password) {
                const data = await fetchAPI('/login', { method: 'POST', body: { username, password } });
                try { localStorage.setItem('ds_admin_token', data.token); localStorage.setItem('ds_admin_auth', '1'); } catch(e){}
                return data;
            },
            logout() {
                try { localStorage.removeItem('ds_admin_token'); localStorage.removeItem('ds_admin_auth'); } catch(e){}
            },
            isLoggedIn() {
                try { return !!localStorage.getItem('ds_admin_token'); } catch(e) { return false; }
            }
        },

        // ---- Looks ----
        looks: {
            getAll: () => fetchAPI('/looks'),
            create: (data) => fetchAPI('/looks', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/looks/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/looks/${id}`, { method: 'DELETE' }),
        },

        // ---- Collections ----
        collections: {
            getAll: () => fetchAPI('/collections'),
            create: (data) => fetchAPI('/collections', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/collections/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/collections/${id}`, { method: 'DELETE' }),
            updateProducts: (id, product_ids) => fetchAPI(`/collections/${id}/products`, { method: 'PUT', body: { product_ids } }),
        },

        // ---- Categories ----
        categories: {
            getAll: () => fetchAPI('/categories')
        },

        landingPages: {
            getAll: () => fetchAPI('/landing-pages'),
            create: (data) => fetchAPI('/landing-pages', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/landing-pages/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/landing-pages/${id}`, { method: 'DELETE' }),
        },

        // ---- Settings ----
        settings: {
            getAll: () => fetchAPI('/settings'),
            update: (updates) => fetchAPI('/settings', { method: 'PUT', body: updates }),
        },

        // ---- Merchants ----
        merchants: {
            getAll: () => fetchAPI('/merchants'),
            create: (data) => fetchAPI('/merchants', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/merchants/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/merchants/${id}`, { method: 'DELETE' }),
        },

        // ---- Brands ----
        brands: {
            getAll: () => fetchAPI('/brands'),
            create: (data) => fetchAPI('/brands', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/brands/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/brands/${id}`, { method: 'DELETE' }),
        },

        // ---- Blogs ----
        blogs: {
            getAll: () => fetchAPI('/blogs'),
            create: (data) => fetchAPI('/blogs', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/blogs/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/blogs/${id}`, { method: 'DELETE' }),
        },

        // ---- Products ----
        products: {
            getAll: () => fetchAPI('/products'),
            create: (data) => fetchAPI('/products', { method: 'POST', body: data }),
            update: (id, data) => fetchAPI(`/products/${id}`, { method: 'PUT', body: data }),
            delete: (id) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
            bulkUpload: async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                
                const token = getAuthToken();
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${API_BASE}/products/bulk`, {
                    method: 'POST',
                    headers, // Don't set Content-Type here, browser sets it for FormData with boundary
                    body: formData
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Upload failed');
                return data;
            }
        },

        // ---- Stats ----
        stats: {
            get: () => fetchAPI('/stats')
        }
    };

    window.API = API;

})();

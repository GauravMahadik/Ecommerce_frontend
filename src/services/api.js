import axios from 'axios';

const BASE = 'https://ecommerce-backend-cmd8.onrender.com/api';

export const getProducts = (params) => axios.get(`${BASE}/products`, { params });
export const getFeaturedProducts = () => axios.get(`${BASE}/products/featured`);
export const getProduct = (id) => axios.get(`${BASE}/products/${id}`);
export const createProduct = (data) => axios.post(`${BASE}/products`, data);
export const updateProduct = (id, data) => axios.put(`${BASE}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${BASE}/products/${id}`);

export const getCart = () => axios.get(`${BASE}/cart`);
export const addToCart = (data) => axios.post(`${BASE}/cart`, data);
export const updateCartItem = (id, data) => axios.put(`${BASE}/cart/${id}`, data);
export const removeCartItem = (id) => axios.delete(`${BASE}/cart/${id}`);

export const placeOrder = (data) => axios.post(`${BASE}/orders`, data);
export const getMyOrders = () => axios.get(`${BASE}/orders/my`);
export const getOrderById = (id) => axios.get(`${BASE}/orders/${id}`);
export const getAllOrders = () => axios.get(`${BASE}/orders`);
export const updateOrderStatus = (id, data) => axios.put(`${BASE}/orders/${id}/status`, data);
export const cancelOrder = (id) => axios.put(`${BASE}/orders/${id}/cancel`);

export const getReviews = (productId) => axios.get(`${BASE}/reviews/${productId}`);
export const addReview = (productId, data) => axios.post(`${BASE}/reviews/${productId}`, data);
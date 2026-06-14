import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lumina-palette.onrender.com/api',
});

export default api;
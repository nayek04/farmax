import axios from 'axios'
import { getToken } from './storage.js'

export const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


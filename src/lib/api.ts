import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginEndpoint = err.config?.url?.includes("/api/auth/login");
    if (err.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  telefono: string;
  dataDiNascita: string;
  ruolo: "USER" | "ADMIN";
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  ruolo: "USER" | "ADMIN";
}

export interface RegisterRequest {
  username: string;
  email: string;
  telefono: string;
  dataDiNascita: string;
  password: string;
  ruolo: "USER" | "ADMIN";
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  telefono?: string;
  dataDiNascita?: string;
  password?: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/api/auth/login", data),
};

export const usersApi = {
  register: (data: RegisterRequest) =>
    api.post<User>("/api/utenti/registrazione", data),
  getAll: () => api.get<User[]>("/api/utenti"),
  getById: (id: number) => api.get<User>(`/api/utenti/${id}`),
  update: (id: number, data: UpdateUserRequest) =>
    api.put<User>(`/api/utenti/${id}`, data),
  delete: (id: number) => api.delete(`/api/utenti/${id}`),
};

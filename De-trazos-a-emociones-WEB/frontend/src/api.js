const API_URL = "http://localhost:3000";

export const api = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al registrarse");
    }

    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al iniciar sesión");
    }

    return data;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getAnalisis: async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/analisis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener análisis");
    }

    return data;
  },

  analizarImagen: async (formData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/analizar-imagen`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al analizar la imagen");
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
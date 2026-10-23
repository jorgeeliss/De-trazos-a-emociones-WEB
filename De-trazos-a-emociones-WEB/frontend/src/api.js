const API_URL = "http://localhost:3000";

/* =========================
   MANEJO DE SESIÓN
========================= */

const limpiarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// La sesión dejó de ser válida: limpiamos y mandamos al login obligatorio.
const forzarLogin = () => {
  limpiarSesion();
  if (window.location.pathname !== "/login") {
    window.location.replace("/login?expirado=1");
  }
};

// Decodifica el payload del JWT y comprueba que exista y no haya expirado.
export const tokenVigente = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true; // sin exp lo tratamos como vigente
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// fetch autenticado: agrega el Bearer y, ante un 401/403, cierra la sesión.
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    forzarLogin();
    throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  return response;
};

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
    const response = await authFetch(`${API_URL}/analisis`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener análisis");
    }

    return data;
  },

  analizarImagen: async (formData) => {
    const response = await authFetch(`${API_URL}/analizar-imagen`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al analizar la imagen");
    }

    return data;
  },

  eliminarAnalisis: async (id) => {
    const response = await authFetch(`${API_URL}/analisis/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar el análisis");
    }

    return data;
  },

  guardarAnalisis: async (payload) => {
    const response = await authFetch(`${API_URL}/analisis/guardar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al guardar el análisis");
    }

    return data;
  },

  asignarAnalisis: async (id, contexto_nino) => {
    const response = await authFetch(`${API_URL}/analisis/${id}/asignar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contexto_nino }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al asignar el análisis");
    }

    return data;
  },

  reanalizar: async (id) => {
    const response = await authFetch(`${API_URL}/analisis/${id}/reanalizar`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al reanalizar");
    }

    return data;
  },

  descartarAnalisis: async (imagen) => {
    await authFetch(`${API_URL}/analisis/descartar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imagen }),
    });
  },

  eliminarNino: async (ids) => {
    const response = await authFetch(`${API_URL}/analisis/eliminar-varios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar el niño");
    }

    return data;
  },

  // --- Administración (solo admin) ---

  getSolicitudes: async (estado = "pendiente") => {
    const response = await authFetch(`${API_URL}/admin/usuarios?estado=${estado}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener las solicitudes");
    }

    return data;
  },

  resolverSolicitud: async (id, accion) => {
    const response = await authFetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accion }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al actualizar la solicitud");
    }

    return data;
  },

  // --- Perfil / cuenta ---

  getPerfil: async () => {
    const response = await authFetch(`${API_URL}/perfil/me`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener el perfil");
    }

    return data;
  },

  subirFotoPerfil: async (file) => {
    const formData = new FormData();
    formData.append("foto", file);

    const response = await authFetch(`${API_URL}/perfil/foto`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al subir la foto");
    }

    return data;
  },

  // Descarga la foto como blob (un <img> no puede mandar el token). Un 404
  // (sin foto) devuelve null; no fuerza el cierre de sesión como authFetch.
  fetchFotoPerfil: async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/perfil/foto`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  },

  eliminarCuenta: async () => {
    const response = await authFetch(`${API_URL}/perfil`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al eliminar la cuenta");
    }

    return data;
  },

  logout: () => {
    limpiarSesion();
  },
};

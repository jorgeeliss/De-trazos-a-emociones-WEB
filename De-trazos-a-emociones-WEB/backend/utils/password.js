// Política de contraseña segura. Devuelve un mensaje de error si no cumple,
// o null si es válida. Se usa en el registro y al cambiar la contraseña.
function validarPassword(pw) {
    if (!pw || pw.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/[A-Z]/.test(pw)) {
        return "La contraseña debe incluir al menos una letra mayúscula";
    }
    if (!/[a-z]/.test(pw)) {
        return "La contraseña debe incluir al menos una letra minúscula";
    }
    if (!/[0-9]/.test(pw)) {
        return "La contraseña debe incluir al menos un número";
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
        return "La contraseña debe incluir al menos un símbolo (por ejemplo: ! @ # $ %)";
    }
    return null;
}

module.exports = { validarPassword };

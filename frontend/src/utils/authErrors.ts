export const mapAuthError = (error: any): string => {
    if (!error?.message) {
        return 'Error inesperado'
    }

    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
        return 'Email o contraseña incorrectos'
    }
    
    if (message.includes('email not confirmed')) {
        return 'Por favor confirma tu email antes de iniciar sesión'
    }
    
    if (message.includes('too many requests')) {
        return 'Demasiados intentos. Inténtalo de nuevo más tarde'
    }
    
    if (message.includes('invalid email')) {
        return 'El email no es válido'
    }
    
    if (message.includes('user not found')) {
        return 'Usuario no encontrado'
    }

    if (message.includes('already registered')) {
        return 'Este email ya está registrado'
    }
    
    if (message.includes('password should be')) {
        return 'La contraseña no cumple con los requisitos'
    }

    if (message.includes('session not found')) {
        return 'Sesión expirada. Inicia sesión nuevamente'
    }

    return error.message
}
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error } = await signIn(email, password)
            if (error) {
                // Manejo específico de errores de Supabase
                switch (error.message) {
                    case 'Invalid login credentials':
                        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
                        break
                    case 'Email not confirmed':
                        setError('Por favor, confirma tu email antes de iniciar sesión.')
                        break
                    case 'Invalid email':
                        setError('El formato del email no es válido.')
                        break
                    case 'User not found':
                        setError('No existe una cuenta con este email. ¿Quieres registrarte?')
                        break
                    case 'Too many requests':
                        setError('Demasiados intentos. Espera unos minutos antes de intentar de nuevo.')
                        break
                    default:
                        // Si contiene "Invalid" probablemente son credenciales incorrectas
                        if (error.message.toLowerCase().includes('invalid')) {
                            setError('Email o contraseña incorrectos. Verifica tus credenciales.')
                        } else {
                            setError(error.message || 'Error al iniciar sesión')
                        }
                        break
                }
            } else {
                navigate('/picks')
            }
        } catch (err) {
            setError('Error inesperado. Por favor, inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                className="max-w-md w-full space-y-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Or{' '}
                        <Link
                            to="/register"
                            className="font-medium text-red-700 hover:text-red-600"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="
                                    appearance-none rounded-none relative block w-full 
                                    px-3 py-2 border border-gray-600 placeholder-gray-400 
                                    text-white bg-gray-800 rounded-t-md focus:outline-none 
                                    focus:ring-red-700 focus:border-red-700 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="
                                    appearance-none rounded-none relative 
                                    block w-full px-3 py-2 border border-gray-600 
                                    placeholder-gray-400 text-white bg-gray-800 
                                    rounded-b-md focus:outline-none focus:ring-red-700 
                                    focus:border-red-700 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-400 text-sm font-medium">
                                    {error}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="
                            group relative w-full 
                            flex justify-center py-2 
                            px-4 border border-transparent 
                            text-sm font-medium rounded-md 
                            text-white bg-red-700 
                            hover:bg-red-800 hover:cursor-pointer 
                            focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-red-500 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default Login
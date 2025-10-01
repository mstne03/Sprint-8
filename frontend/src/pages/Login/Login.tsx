import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import CustomButton from '@/components/ui/CustomButton/CustomButton'
import { mapAuthError } from '@/utils/authErrors'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    
    const { signIn, loading, signInError } = useAuth()
    const navigate = useNavigate()

    // Mostrar errores de React Query
    useEffect(() => {
        if (signInError) {
            setError(mapAuthError(signInError))
        }
    }, [signInError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await signIn(email, password)
            navigate('/picks')
        } catch (err: any) {
            setError(mapAuthError(err))
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
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <CustomButton
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </CustomButton>
                </form>
            </motion.div>
        </div>
    )
}

export default Login
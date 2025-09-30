import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { motion } from 'framer-motion'

const EmailConfirmation = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Parse hash parameters as well (Supabase sometimes uses hash)
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                
                // Combine both search and hash parameters
                const getParam = (key: string) => {
                    return searchParams.get(key) || hashParams.get(key)
                }
                
                // Get all possible parameters that Supabase might send
                const token = getParam('token')
                const tokenHash = getParam('token_hash')
                const type = getParam('type')
                const access_token = getParam('access_token')
                const refresh_token = getParam('refresh_token')
                const error_code = getParam('error_code')
                const error_description = getParam('error_description')

                // Check if there's an error in the URL
                if (error_code || error_description) {
                    setStatus('error')
                    setMessage(error_description || `Error code: ${error_code}`)
                    return
                }

                // If we have access_token and refresh_token, the user is already authenticated
                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token
                    })
                    
                    if (error) {
                        setStatus('error')
                        setMessage(error.message)
                    } else {
                        setStatus('success')
                        setMessage('Email confirmed successfully! Redirecting to home...')
                        setTimeout(() => {
                            navigate('/')
                        }, 2000)
                    }
                } 
                // If we have token_hash, try to verify it
                else if (tokenHash && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: type as any
                    })

                    if (error) {
                        setStatus('error')
                        setMessage(`OTP verification failed: ${error.message}`)
                    } else {
                        setStatus('success')
                        setMessage('Email confirmed successfully! Redirecting to home...')
                        setTimeout(() => {
                            navigate('/')
                        }, 2000)
                    }
                }
                // Legacy token parameter
                else if (token && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash: token,
                        type: type as any
                    })

                    if (error) {
                        setStatus('error')
                        setMessage(`Legacy token verification failed: ${error.message}`)
                    } else {
                        setStatus('success')
                        setMessage('Email confirmed successfully! Redirecting to home...')
                        setTimeout(() => {
                            navigate('/')
                        }, 2000)
                    }
                } else {
                    setStatus('error')
                    setMessage(`Invalid confirmation link - No valid parameters found.`)
                }
            } catch (error) {
                setStatus('error')
                setMessage(`An error occurred during confirmation: ${error}`)
            }
        }

        handleEmailConfirmation()
    }, [searchParams, navigate])

    const getIcon = () => {
        switch (status) {
            case 'loading':
                return <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-700 border-solid mx-auto"></div>
            case 'success':
                return <div className="text-green-500 text-6xl mb-4">✅</div>
            case 'error':
                return <div className="text-red-500 text-6xl mb-4">❌</div>
        }
    }

    const getTitle = () => {
        switch (status) {
            case 'loading':
                return 'Confirming your email...'
            case 'success':
                return 'Email Confirmed!'
            case 'error':
                return 'Confirmation Failed'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <motion.div 
                className="text-center max-w-md"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {getIcon()}
                <h2 className="text-3xl font-bold text-white mb-4">{getTitle()}</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                
                {status === 'error' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="block w-full py-3 px-4 text-center font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors duration-200"
                        >
                            Go to Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="block w-full py-3 px-4 text-center font-medium text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            Register Again
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default EmailConfirmation
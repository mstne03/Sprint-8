import { supabase } from "@/config/supabase"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const useEmailConfirmation = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                
                const getParam = (key: string) => {
                    return searchParams.get(key) || hashParams.get(key)
                }
                
                const token = getParam('token')
                const tokenHash = getParam('token_hash')
                const type = getParam('type')
                const access_token = getParam('access_token')
                const refresh_token = getParam('refresh_token')
                const error_code = getParam('error_code')
                const error_description = getParam('error_description')

                if (error_code || error_description) {
                    setStatus('error')
                    setMessage(error_description || `Error code: ${error_code}`)
                    return
                }

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
                        setMessage('Email confirmed successfully! Redirecting...')
                        setTimeout(() => {
                            navigate(isAuthenticated ? '/picks' : '/')
                        }, 2000)
                    }
                } 
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
                        setMessage('Email confirmed successfully! Redirecting...')
                        setTimeout(() => {
                            navigate(isAuthenticated ? '/picks' : '/')
                        }, 2000)
                    }
                }
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
                        setMessage('Email confirmed successfully! Redirecting...')
                        setTimeout(() => {
                            navigate(isAuthenticated ? '/picks' : '/')
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

    return {
        status,
        setStatus,
        message,
        navigate,
        searchParams,
        isAuthenticated,
    }
}

export default useEmailConfirmation

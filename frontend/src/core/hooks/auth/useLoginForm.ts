import { useAuth } from "@/core/contexts/AuthContext"
import { mapAuthError } from "@/features/Auth/utils/authErrors"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export const useLoginForm = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    
    const { 
        signIn, 
        signInWithGoogle, 
        loading, 
        isSigningInWithGoogle,
        signInError, 
        signInWithGoogleError 
    } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (signInError) {
            setError(mapAuthError(signInError))
        } else if (signInWithGoogleError) {
            setError(mapAuthError(signInWithGoogleError))
        }
    }, [signInError, signInWithGoogleError])

    useEffect(() => {
        if (error) {
            setError('')
        }
    }, [email, password])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await signIn(email, password)
            navigate('/leagues')
        } catch (err: any) {
            setError(mapAuthError(err))
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        try {
            await signInWithGoogle()
        } catch (err: any) {
            setError(mapAuthError(err))
        }
    }

    return {
        handleSubmit,
        email,
        setEmail,
        password,
        setPassword,
        error,
        loading,
        isSigningInWithGoogle,
        handleGoogleSignIn,
    }
}

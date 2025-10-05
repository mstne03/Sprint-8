import { Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner/LoadingSpinner'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-700 border-solid mx-auto"></div>
                    <p className="mt-4 text-white text-lg font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}

export const PublicRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <LoadingSpinner />
            </div>
        )
    }

    if (user) {
        return <Navigate to="/leagues" replace />
    }

    return <>{children}</>
}
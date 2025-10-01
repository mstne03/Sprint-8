import useEmailConfirmation from '@/hooks/useEmailConfirmation';
import { motion } from 'framer-motion'

const EmailConfirmation = () => {
    const {
        status,
        message,
        navigate,
    } = useEmailConfirmation();

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
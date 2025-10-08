import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth'

const Login = () => {

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
                <LoginForm />
            </motion.div>
        </div>
    )
}

export default Login
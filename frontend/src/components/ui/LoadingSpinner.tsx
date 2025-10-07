type LoadingSpinnerProps = {
    message?: string;
    className?: string;
}

const LoadingSpinner = ({ 
    message = "Loading...", 
    className = "" 
}: LoadingSpinnerProps) => {
    return (
        <div className={`flex flex-col items-center justify-center w-full py-16 ${className}`}>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 border-solid"></div>
            <p className="mt-4 text-white text-lg font-medium">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
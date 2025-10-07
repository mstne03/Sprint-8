type ErrorMessageProps = {
    error: Error;
    title?: string;
    className?: string;
}

const ErrorMessage = ({ 
    error, 
    title = "Error loading data",
    className = ""
}: ErrorMessageProps) => {
    return (
        <div className={`flex flex-col items-center justify-center w-full py-16 ${className}`}>
            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
            <p className="text-red-500 text-center max-w-md">
                {error.message || "Something went wrong while fetching data."}
            </p>
        </div>
    );
};

export default ErrorMessage;
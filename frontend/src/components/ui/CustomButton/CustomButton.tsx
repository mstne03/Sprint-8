import { motion } from 'framer-motion'

type CustomButtonProps = {
    text: string;
    setState?: (arg:boolean) => void;
    onClick?: () => void;
    disabled?: boolean;
}

const CustomButton = ({ text, setState, onClick, disabled = false }: CustomButtonProps) => {
    const handleClick = () => {
        if (disabled) return;
        
        if (onClick) {
            onClick();
        } else if (setState) {
            setState(false);
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <button
                className="
                        group relative w-full 
                        flex justify-center py-3
                        px-7 border-2 border-transparent 
                        text-sm font-bold rounded-2xl 
                        text-white bg-red-700 
                        hover:bg-red-800 hover:cursor-pointer 
                        focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-red-500 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleClick}
                disabled={disabled}
            >
                {text}
            </button>
        </motion.div>
    )
}

export default CustomButton

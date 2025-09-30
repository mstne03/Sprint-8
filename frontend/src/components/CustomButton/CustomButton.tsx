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
        <motion.button
            className={`p-1 border-4 rounded-2xl block text-white font-bold px-10 py-3.5 shadow-lg ${
                disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'bg-black/30 border-white hover:cursor-pointer'
            }`}
            style={{
                backgroundColor: disabled ? '#4B5563' : undefined, // gray-600
                borderColor: disabled ? '#9CA3AF' : '#FFFFFF', // gray-400 : white
            }}
            initial={{ opacity: 1, scale: 1 }}
            whileHover={!disabled ? { scale: 1.1, backgroundColor: "#000" } : {}}
            whileTap={!disabled ? { scale: 0.95, opacity: 0.6 } : {}}
            onClick={handleClick}
            disabled={disabled}
        >
            {text}
        </motion.button>
    )
}

export default CustomButton

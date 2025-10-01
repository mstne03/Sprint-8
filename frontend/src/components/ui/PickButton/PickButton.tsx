import { motion } from 'framer-motion'

type PickButtonProps = {
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

const PickButton = ({ isSelected, onClick, disabled = false, className = "" }: PickButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-12 h-12 rounded-full flex items-center justify-center
                text-white font-bold text-xl shadow-lg border-2
                ${isSelected 
                    ? 'bg-red-600/90 border-red-400/50' 
                    : 'bg-blue-600/90 border-blue-400/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                backdrop-blur-sm
                ${className}
            `}
            whileHover={disabled ? {} : { 
                scale: 1.15,
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
            whileTap={disabled ? {} : { 
                scale: 0.9,
            }}
            animate={{
                backgroundColor: isSelected 
                    ? "rgba(220, 38, 38, 0.9)" 
                    : "rgba(37, 99, 235, 0.9)",
                borderColor: isSelected 
                    ? "rgba(248, 113, 113, 0.5)" 
                    : "rgba(96, 165, 250, 0.5)",
                transition: { duration: 0.3, ease: "easeInOut" }
            }}
            initial={false}
        >
            <motion.span
                key={isSelected ? 'remove' : 'pick'}
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
            >
                {isSelected ? '−' : '+'}
            </motion.span>
        </motion.button>
    );
};

export default PickButton;
import { motion } from 'framer-motion'

type ExpandButtonProps = {
    onClick: () => void;
    className?: string;
}

const ExpandButton = ({ onClick, className = "" }: ExpandButtonProps) => {
    return (
        <motion.button
            onClick={onClick}
            className={`
                text-lg bg-red-700 backdrop-blur-lg border-red-500 border-2
                p-2 rounded-xl hover:cursor-pointer shadow-lg
                ${className}
            `}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
        >
            insights
        </motion.button>
    );
};

export default ExpandButton;
import { motion } from 'framer-motion'

type CustomButtonProps = {
    text: string;
    setState?: (arg:boolean) => void
}

const CustomButton = ({ text, setState }: CustomButtonProps) => {
    return (
        <motion.button
            className="p-1 border-4 border-red-900 rounded-2xl bg-black/80 block text-white font-bold px-10 py-3.5 shadow-lg hover:cursor-pointer"
            initial={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={setState ? () => setState(false) : () => {}}
        >
            {text}
        </motion.button>
    )
}

export default CustomButton

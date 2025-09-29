import { PerspectiveCamera, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import MclarenModel from "../Models/mclaren";
import { motion } from 'framer-motion';
import CustomButton from "../CustomButton/CustomButton";

type HeroSectionProps = {
    setHeroSection: (arg: boolean) => void;
}

const HeroSection = ({ setHeroSection }: HeroSectionProps) => {
    return (
        <motion.div
            className="flex flex-col justify-center items-center gap-0 relative text-red-800 "
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            <div className="absolute top-[10%] z-1">
                <h1 
                    className="text-center font-black text-6xl"
                >
                    WELCOME TO GRIDFANS CLUB
                </h1>
            </div>
            <div className="flex flex-col gap-5 absolute bottom-[0%] z-1">
                <h1 
                    className="text-center text-white font-medium text-2xl"
                >
                    READY TO RACE?
                </h1>
                <CustomButton 
                    text={"BEGIN"}
                    setState={setHeroSection}
                />
            </div>
            <div className="w-[100%]">
                <Canvas
                    className="inset-0 p-10"
                    style={{ width: "100%", height: "70vh" }}
                >
                    <PerspectiveCamera 
                        makeDefault
                        fov={60}
                        position={[0,0,4]}
                        resolution={1048}
                    />
                    <MclarenModel />
                    <ambientLight intensity={2.5}/>
                    <Preload all />
                </Canvas>
            </div>
        </motion.div>
    )
}

export default HeroSection

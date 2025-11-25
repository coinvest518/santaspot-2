import { motion } from 'framer-motion';
// Import your image directly
import christmasPot from '/images/christmas-pot.png'; // Make sure this path is correct relative to your public directory

const AnimatedPotCSS = () => {
  return (
    <motion.div
      className="relative w-64 h-64"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ willChange: 'transform' }}
      >
        <img
          src={christmasPot}
          alt="Animated Pot"
          className="w-full h-full object-contain drop-shadow-2xl"
          loading="lazy"
        />
      </motion.div>
      
      {/* Reduced sparkles for performance */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
          style={{
            top: `${20 + i * 30}%`,
            left: `${20 + i * 30}%`,
            willChange: 'transform, opacity'
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glow effect */}
      <div 
        className="absolute inset-0 blur-xl opacity-20"
        style={{
          background: 'radial-gradient(circle at center, #ffd700 0%, transparent 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
};

export default AnimatedPotCSS;
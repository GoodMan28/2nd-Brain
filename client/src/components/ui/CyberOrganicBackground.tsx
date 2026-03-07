import { motion } from 'framer-motion';

export function CyberOrganicBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            style={{
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)'
            }}
        >
            {/* Deep base gradient */}
            <div className="absolute inset-0 bg-[#0F172A]" />

            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-40">
                <defs>
                    {/* Grid Pattern for the Right (Technical) Side */}
                    <pattern id="tech-grid" width="100" height="100" patternUnits="userSpaceOnUse" x="50%">
                        <path d="M 0 100 L 100 100 M 100 0 L 100 100" stroke="#1E293B" strokeWidth="1" fill="none" />
                    </pattern>
                </defs>

                {/* Right Side: Technical Grid Base */}
                <rect x="50%" width="50%" height="100%" fill="url(#tech-grid)" />

                {/* Left Side: Organic Neural Net (Static Base) */}
                <g stroke="#1E293B" strokeWidth="2" fill="none" className="translate-x-[-10%] sm:translate-x-0">
                    <path d="M -100 200 Q 100 250 200 150 T 400 300" />
                    <path d="M 0 500 Q 150 450 250 550 T 500 400" />
                    <path d="M 100 800 Q 200 700 300 850 T 600 600" />
                    <path d="M -50 100 Q 50 50 150 200 T 350 100" />
                    <path d="M 50 600 Q 200 750 350 600 T 550 700" />
                    <path d="M -200 350 Q -50 400 50 300 T 250 400" />
                    {/* Synaptic nodes */}
                    <circle cx="200" cy="150" r="4" fill="#1E293B" />
                    <circle cx="400" cy="300" r="5" fill="#1E293B" />
                    <circle cx="250" cy="550" r="4" fill="#1E293B" />
                    <circle cx="500" cy="400" r="6" fill="#1E293B" />
                    <circle cx="300" cy="850" r="5" fill="#1E293B" />
                    <circle cx="600" cy="600" r="4" fill="#1E293B" />
                    <circle cx="150" cy="200" r="4" fill="#1E293B" />
                    <circle cx="350" cy="100" r="5" fill="#1E293B" />
                </g>

                {/* Right Side: Technical Circuits (Static Base) */}
                <g stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="square" strokeLinejoin="miter" className="translate-x-[50%]">
                    {/* Vertical / Horizontal / 45deg traces */}
                    <path d="M 100 100 L 150 100 L 200 150 L 200 300 L 300 300" />
                    <path d="M 50 400 L 150 400 L 200 450 L 250 450 L 300 500 L 400 500" />
                    <path d="M 250 200 L 350 200 L 400 150 L 500 150" />
                    <path d="M 150 600 L 250 600 L 300 650 L 300 750" />
                    <path d="M 50 800 L 150 800 L 200 750 L 350 750" />
                    <path d="M 350 400 L 450 400 L 500 350 L 600 350" />

                    {/* Hexagonal Nodes and Microchips */}
                    {/* Core Microchip 1 */}
                    <rect x="230" y="280" width="40" height="40" rx="4" fill="#0F172A" />
                    {/* Pins */}
                    <line x1="225" y1="290" x2="230" y2="290" />
                    <line x1="225" y1="300" x2="230" y2="300" />
                    <line x1="225" y1="310" x2="230" y2="310" />
                    <line x1="270" y1="290" x2="275" y2="290" />
                    <line x1="270" y1="300" x2="275" y2="300" />
                    <line x1="270" y1="310" x2="275" y2="310" />

                    {/* Nodes */}
                    <circle cx="100" cy="100" r="3" fill="#1E293B" />
                    <circle cx="50" cy="400" r="4" fill="#1E293B" />
                    <circle cx="400" cy="500" r="3" fill="#1E293B" />
                    <circle cx="250" cy="200" r="4" fill="#1E293B" />
                    <circle cx="500" cy="150" r="3" fill="#1E293B" />
                    <circle cx="150" cy="600" r="4" fill="#1E293B" />
                    <circle cx="300" cy="750" r="3" fill="#1E293B" />
                    <circle cx="600" cy="350" r="4" fill="#1E293B" />
                </g>

                {/* THE GLOWING ANIMATIONS */}
                {/* Left Side: Animated Biological Pulses (Sky Blue to Indigo) */}
                <g fill="none" strokeWidth="3" strokeLinecap="round" className="opacity-80 translate-x-[-10%] sm:translate-x-0">
                    <motion.path
                        d="M -100 200 Q 100 250 200 150 T 400 300"
                        stroke="url(#bio-grad-1)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    />
                    <motion.path
                        d="M 0 500 Q 150 450 250 550 T 500 400"
                        stroke="#38BDF8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                    />
                    <motion.path
                        d="M -50 100 Q 50 50 150 200 T 350 100"
                        stroke="#6366F1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                    />
                    <motion.path
                        d="M 100 800 Q 200 700 300 850 T 600 600"
                        stroke="url(#bio-grad-1)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    />
                    <motion.circle cx="400" cy="300" r="6" fill="#6366F1" stroke="none" className="animate-pulse shadow-xl shadow-[#6366F1]" />
                    <motion.circle cx="500" cy="400" r="8" fill="#38BDF8" stroke="none" className="animate-pulse shadow-xl shadow-[#38BDF8]" />
                    <motion.circle cx="350" cy="100" r="6" fill="#6366F1" stroke="none" className="animate-pulse shadow-xl shadow-[#6366F1]" />
                </g>

                {/* Right Side: Animated Data Packets (Indigo to Sky Blue) */}
                <g fill="none" strokeWidth="3" strokeLinecap="round" className="opacity-90 translate-x-[50%]">
                    <motion.path
                        d="M 100 100 L 150 100 L 200 150 L 200 300 L 300 300"
                        stroke="#6366F1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                    />
                    <motion.path
                        d="M 50 400 L 150 400 L 200 450 L 250 450 L 300 500 L 400 500"
                        stroke="#38BDF8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                    <motion.path
                        d="M 250 200 L 350 200 L 400 150 L 500 150"
                        stroke="#6366F1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />
                    <motion.path
                        d="M 150 600 L 250 600 L 300 650 L 300 750"
                        stroke="#38BDF8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                    />

                    {/* Animated Nodes */}
                    <circle cx="100" cy="100" r="4" fill="#6366F1" stroke="none" className="animate-pulse" />
                    <circle cx="50" cy="400" r="4" fill="#38BDF8" stroke="none" className="animate-pulse" />
                    <circle cx="500" cy="150" r="4" fill="#6366F1" stroke="none" className="animate-pulse" />
                    <circle cx="300" cy="750" r="4" fill="#38BDF8" stroke="none" className="animate-pulse" />
                </g>

                {/* Definitions for Gradients */}
                <defs>
                    <linearGradient id="bio-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Glowing Core Intersection (The "Interface") */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
    );
}

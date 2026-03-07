import { motion } from 'framer-motion';

export function CircuitBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            style={{
                maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
            }}
        >
            {/* Base gradient layer to give depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-transparent to-[#0F172A] opacity-80" />

            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-40 relative">
                <defs>
                    <pattern id="clerk-circuit" width="800" height="800" patternUnits="userSpaceOnUse">
                        {/* Static faint grid lines */}
                        <path d="M 0 100 L 800 100 M 0 300 L 800 300 M 0 500 L 800 500 M 0 700 L 800 700" stroke="#1E293B" strokeWidth="1" fill="none" />
                        <path d="M 100 0 L 100 800 M 300 0 L 300 800 M 500 0 L 500 800 M 700 0 L 700 800" stroke="#1E293B" strokeWidth="1" fill="none" />

                        {/* Intricate Static Traces */}
                        <g stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="square" strokeLinejoin="miter">
                            <path d="M 100 100 L 150 100 L 150 200 L 250 200 L 250 150 L 300 150" />
                            <path d="M 300 300 L 350 350 L 350 450 L 400 450 L 400 500 L 550 500" />
                            <path d="M 500 100 L 500 250 L 550 250 L 600 300 L 600 400" />
                            <path d="M 100 500 L 200 500 L 200 400 L 150 350 L 100 350" />
                            <path d="M 700 500 L 650 500 L 650 600 L 550 600 L 550 700" />
                            <path d="M 200 700 L 300 700 L 300 650 L 400 650 L 450 700 L 500 700" />
                            <path d="M 400 100 L 400 150 L 350 150 L 350 250 L 450 250 L 450 350" />
                            <path d="M 700 100 L 600 100 L 600 200 L 750 200" />
                            <path d="M 250 300 L 200 300 L 200 250 L 100 250" />
                            <path d="M 600 700 L 600 650 L 700 650 L 700 550 L 750 550" />

                            {/* Connectors to grid */}
                            <path d="M 0 400 L 100 400" />
                            <path d="M 400 0 L 400 100" />
                            <path d="M 800 350 L 700 350 L 700 450" />
                        </g>

                        {/* Nodes and Microchips */}
                        <g stroke="#475569" strokeWidth="2" fill="#0F172A">
                            {/* Microchip 1 */}
                            <rect x="230" y="180" width="40" height="40" rx="4" />
                            {/* Pins */}
                            <line x1="225" y1="190" x2="230" y2="190" strokeWidth="2" />
                            <line x1="225" y1="200" x2="230" y2="200" strokeWidth="2" />
                            <line x1="225" y1="210" x2="230" y2="210" strokeWidth="2" />
                            <line x1="270" y1="190" x2="275" y2="190" strokeWidth="2" />
                            <line x1="270" y1="200" x2="275" y2="200" strokeWidth="2" />
                            <line x1="270" y1="210" x2="275" y2="210" strokeWidth="2" />

                            {/* Microchip 2 */}
                            <rect x="530" y="480" width="40" height="40" rx="4" />
                            {/* Pins */}
                            <line x1="540" y1="475" x2="540" y2="480" strokeWidth="2" />
                            <line x1="550" y1="475" x2="550" y2="480" strokeWidth="2" />
                            <line x1="560" y1="475" x2="560" y2="480" strokeWidth="2" />
                            <line x1="540" y1="520" x2="540" y2="525" strokeWidth="2" />
                            <line x1="550" y1="520" x2="550" y2="525" strokeWidth="2" />
                            <line x1="560" y1="520" x2="560" y2="525" strokeWidth="2" />

                            {/* Solid Dot Nodes */}
                            <circle cx="100" cy="100" r="4" fill="#6366F1" stroke="none" />
                            <circle cx="300" cy="150" r="4" fill="#38BDF8" stroke="none" />
                            <circle cx="300" cy="300" r="4" fill="#6366F1" stroke="none" />
                            <circle cx="550" cy="500" r="4" fill="#38BDF8" stroke="none" />
                            <circle cx="500" cy="100" r="4" fill="#6366F1" stroke="none" />
                            <circle cx="600" cy="400" r="4" fill="#38BDF8" stroke="none" />
                            <circle cx="100" cy="500" r="4" fill="#6366F1" stroke="none" />
                            <circle cx="550" cy="700" r="4" fill="#38BDF8" stroke="none" />
                            <circle cx="750" cy="200" r="4" fill="#6366F1" stroke="none" />
                            <circle cx="100" cy="250" r="4" fill="#38BDF8" stroke="none" />
                            <circle cx="750" cy="550" r="4" fill="#6366F1" stroke="none" />

                            {/* Large concentric nodes */}
                            <circle cx="150" cy="350" r="14" fill="none" stroke="#475569" strokeWidth="2" />
                            <circle cx="150" cy="350" r="6" fill="#6366F1" stroke="none" className="animate-pulse" />

                            <circle cx="650" cy="500" r="14" fill="none" stroke="#475569" strokeWidth="2" />
                            <circle cx="650" cy="500" r="6" fill="#38BDF8" stroke="none" className="animate-pulse shadow-xl" />

                            <circle cx="450" cy="350" r="14" fill="none" stroke="#475569" strokeWidth="2" />
                            <circle cx="450" cy="350" r="6" fill="#6366F1" stroke="none" className="animate-pulse shadow-[#6366F1]" />

                            <circle cx="600" cy="200" r="14" fill="none" stroke="#475569" strokeWidth="2" />
                            <circle cx="600" cy="200" r="6" fill="#38BDF8" stroke="none" className="animate-pulse shadow-[#38BDF8]" />
                        </g>

                        {/* Glowing Animated Traces layer */}
                        <g fill="none" strokeWidth="3" strokeLinecap="round" className="opacity-90">
                            <motion.path
                                d="M 100 100 L 150 100 L 150 200 L 250 200 L 250 150 L 300 150"
                                stroke="#6366F1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                            />
                            <motion.path
                                d="M 300 300 L 350 350 L 350 450 L 400 450 L 400 500 L 550 500"
                                stroke="#38BDF8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                            />
                            <motion.path
                                d="M 500 100 L 500 250 L 550 250 L 600 300 L 600 400"
                                stroke="#6366F1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                            />
                            <motion.path
                                d="M 100 500 L 200 500 L 200 400 L 150 350 L 100 350"
                                stroke="#38BDF8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                            />
                            <motion.path
                                d="M 700 500 L 650 500 L 650 600 L 550 600 L 550 700"
                                stroke="#6366F1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                            />
                            <motion.path
                                d="M 400 100 L 400 150 L 350 150 L 350 250 L 450 250 L 450 350"
                                stroke="#38BDF8"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
                            />
                            <motion.path
                                d="M 250 300 L 200 300 L 200 250 L 100 250"
                                stroke="#6366F1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                            />
                        </g>

                    </pattern>
                </defs>
                {/* Fill slightly larger than 100% to ensure coverage across any viewport */}
                <rect width="200%" height="200%" fill="url(#clerk-circuit)" transform="translate(-100, -100)" />
            </svg>
        </div>
    );
}

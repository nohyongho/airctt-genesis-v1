'use client';

import React from 'react';
import { Home, Phone, User, Wallet, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BottomNav() {
    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl">
                <Link href="/consumer">
                    <NavItem icon={<Home className="w-6 h-6" />} active />
                </Link>
                <Link href="/consumer/market">
                    <NavItem icon={<ShoppingBag className="w-6 h-6" />} />
                </Link>

                {/* Center Action Button (3D Rabbit) */}
                <div className="relative -top-8 mx-2">
                    <motion.div
                        className="w-20 h-20 bg-gradient-to-b from-[#2962FF] to-[#0039CB] rounded-full border-4 border-[#f0f4f8] flex items-center justify-center shadow-[0_8px_25px_rgba(41,98,255,0.4)] cursor-pointer overflow-hidden"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            y: [0, -5, 0],
                            boxShadow: [
                                "0 8px 25px rgba(41,98,255,0.4)",
                                "0 15px 35px rgba(41,98,255,0.6)",
                                "0 8px 25px rgba(41,98,255,0.4)"
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.img
                            src="/cute_3d_rabbit_standing.png"
                            alt="Rabbit"
                            className="w-full h-full object-cover scale-125 translate-y-2"
                            animate={{
                                rotate: [0, -5, 5, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00C853] rounded-full border-2 border-white animate-pulse" />
                    </motion.div>
                </div>

                <NavItem icon={<Wallet className="w-6 h-6" />} />
                <NavItem icon={<User className="w-6 h-6" />} />
            </div>
        </motion.div>
    );
}

function NavItem({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`p-3 rounded-full transition-colors ${active ? 'text-[#00C853]' : 'text-white/40 hover:text-white'}`}>
            {icon}
            {active && <div className="w-1 h-1 bg-[#00C853] rounded-full mx-auto mt-1" />}
        </button>
    );
}

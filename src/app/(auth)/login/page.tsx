"use client";

import { signIn } from "next-auth/react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { GitBranch } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // parallax up to 2px based on screen size
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg">
      {/* Background Dot Grid */}
      <motion.div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          x: mouseX,
          y: mouseY,
          backgroundImage: "radial-gradient(circle at 2px 2px, var(--border2) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent pointer-events-none z-0" />

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center justify-center space-x-1"
        >
          <h1 className="text-6xl font-syne font-extrabold text-white tracking-tight">FLOW</h1>
          <h1 className="text-6xl font-syne font-extrabold text-accent2 tracking-tight">DESK</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="mt-4 text-muted font-mono text-lg"
        >
          Stop switching. Start shipping.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full font-syne font-bold text-lg shadow-[0_0_32px_var(--glow)] hover:shadow-[0_0_48px_var(--glow)] transition-shadow border border-accent/50"
          >
            <GitBranch className="w-6 h-6" />
            Connect with GitHub
          </motion.button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 text-xs text-muted font-mono"
      >
        Your focus data stays yours.
      </motion.p>
    </div>
  );
}

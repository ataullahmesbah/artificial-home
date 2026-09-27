"use client";
import { motion } from "framer-motion";

/** Every page fades in softly when you move between pages (opacity only, so fixed pop-ups keep working). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

"use client";
import { motion, type Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades + lifts content into view once. Disabled automatically under reduced motion. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </Comp>
  );
}

const wordParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const wordChild: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.8, ease } },
};

/** Split-word mask reveal used for large headings. */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={className}
      variants={wordParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      aria-label={text}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span className="inline-block" variants={wordChild}>
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Image clip reveal with a subtle scale settle (1.03 → 1). */
export function ClipReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 0px)", scale: 1.03, opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1, ease }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/** Parent that reveals its <StaggerItem> children one after another. */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

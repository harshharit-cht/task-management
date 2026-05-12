"use client";

import { motion } from "framer-motion";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,

    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${
      216 - i * 6
    } ${152 - i * 5 * position} ${343 - i * 6}C${
      616 - i * 5 * position
    } ${470 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6}`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
      >
        {/* <title>Background Paths</title> */}

        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.5 + path.id * 0.03}
            initial={{
              pathLength: 0.3,
              opacity: 0.8,
            }}
            animate={{
              pathLength: 1,
             opacity: [0.4, 0.9, 0.4],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 25 + Math.random() * 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)",
        }}
      />

      {/* Top Glow */}
      <div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.22), transparent 70%)",
        }}
      />

      {/* Bottom Glow */}
      <div
        className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)",
        }}
      />

      {/* Center Glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)",
        }}
      />

      {/* Grid Overlay */}
      {/* <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      /> */}

      {/* Animated Paths */}
      <div className="">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Noise Texture */}
      {/* <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      /> */}
    </div>
  );
}
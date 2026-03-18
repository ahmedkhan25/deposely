"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useTransform, motion, animate } from "framer-motion";

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    if (target >= 100) return Math.round(v).toLocaleString();
    return v.toFixed(1);
  });

  useEffect(() => {
    if (isInView) {
      animate(motionVal, target, { duration, ease: "easeOut" });
    }
  }, [isInView, motionVal, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

import { useEffect, useState } from "react";

export default function AnimatedEllipsis() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
}

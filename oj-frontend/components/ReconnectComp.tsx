import { useEffect, useState } from "react";

export default function ReconnectTimer() {
  const [time, setTime] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-orange-400/80 tabular-nums">
      {time}s to reconnect
    </span>
  );
}

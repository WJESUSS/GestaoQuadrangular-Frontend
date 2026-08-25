import { useEffect, useRef } from "react";
import api from "../services/api";

export default function usePresence(intervalMs = 30000) {
  const sentRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const sendHeartbeat = () => {
      api.post("presenca/heartbeat").catch(() => {});
    };

    sendHeartbeat();

    const id = setInterval(sendHeartbeat, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
}

"use client";

import { useEffect } from "react";

export function RequireSession() {
  useEffect(() => {
    if (!window.localStorage.getItem("benzo.session")) {
      window.location.replace("/auth/login");
    }
  }, []);

  return null;
}

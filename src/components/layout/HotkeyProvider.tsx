"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useUIStore } from "@/store/useUIStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const { toggleCommandPalette, toggleContextPanel } = useUIStore();
  const { status, pauseResume } = useSessionStore();
  const router = useRouter();

  const isFocusing = status === "focusing";

  useHotkeys("meta+k, ctrl+k", (e) => {
    e.preventDefault();
    toggleCommandPalette();
  });

  useHotkeys("meta+n, ctrl+n", (e) => {
    e.preventDefault();
    toggleContextPanel();
  });

  useHotkeys("space", (e) => {
    if (isFocusing) {
      e.preventDefault();
      pauseResume();
    }
  }, { enableOnFormTags: false });

  useHotkeys("meta+enter, ctrl+enter", (e) => {
    if (!isFocusing) {
      e.preventDefault();
      router.push("/focus");
    }
  }, { enableOnFormTags: false });

  return <>{children}</>;
}

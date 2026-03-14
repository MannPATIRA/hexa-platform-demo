"use client";

import { useState, useCallback } from "react";

export type DemoScreen = 1 | 2 | 3 | 4 | 5;

export type Screen5State = "live" | "ended" | "review" | "edit";

export function useDemoFlow() {
  const [screen, setScreen] = useState<DemoScreen>(1);
  const [callAccepted, setCallAccepted] = useState(false);
  const [hexaToggled, setHexaToggled] = useState(false);
  const [screen5State, setScreen5State] = useState<Screen5State>("live");
  const [callCompleted, setCallCompleted] = useState(false);

  const goToScreen = useCallback((s: DemoScreen) => setScreen(s), []);

  return {
    screen,
    goToScreen,
    callAccepted,
    setCallAccepted,
    hexaToggled,
    setHexaToggled,
    screen5State,
    setScreen5State,
    callCompleted,
    setCallCompleted,
  };
}

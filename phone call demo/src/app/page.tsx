"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpeedProvider, useSpeed } from "@/hooks/useSpeedControl";
import { useCallTimer } from "@/hooks/useCallTimer";
import { useDemoFlow } from "@/hooks/useDemoFlow";
import SpeedControl from "@/components/shared/SpeedControl";
import PhoneFrame from "@/components/phone/PhoneFrame";
import HomeScreen from "@/components/phone/HomeScreen";
import IncomingCall from "@/components/phone/IncomingCall";
import MiniPhone from "@/components/phone/MiniPhone";
import BrowserChrome from "@/components/webapp/BrowserChrome";
import Sidebar from "@/components/webapp/Sidebar";
import CallList from "@/components/webapp/CallList";
import CallDetail from "@/components/webapp/CallDetail";

function useWindowSize() {
  const [size, setSize] = useState({ width: 1280, height: 800 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function DemoApp() {
  const {
    screen, goToScreen,
    callAccepted, setCallAccepted,
    hexaToggled, setHexaToggled,
    screen5State, setScreen5State,
    callCompleted, setCallCompleted,
  } = useDemoFlow();

  const timer = useCallTimer();
  const { speed } = useSpeed();
  const windowSize = useWindowSize();
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [phonePhase, setPhonePhase] = useState<"centered" | "shrinking" | "mini">("centered");
  const [showWebApp, setShowWebApp] = useState(false);
  const [webAppView, setWebAppView] = useState<"list" | "detail">("list");

  const [hexaNotificationVisible, setHexaNotificationVisible] = useState(false);
  const [hexaNotificationResponded, setHexaNotificationResponded] = useState(false);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && screen === 1 && !showIncomingCall) {
        e.preventDefault();
        setShowIncomingCall(true);
        goToScreen(3);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, showIncomingCall, goToScreen]);

  useEffect(() => {
    if (showIncomingCall && !hexaNotificationResponded) {
      notificationTimerRef.current = setTimeout(() => {
        setHexaNotificationVisible(true);
      }, 800 / speed);
    }
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, [showIncomingCall, hexaNotificationResponded, speed]);

  const handleAccept = useCallback(() => {
    setCallAccepted(true);
    timer.start();
    setTimeout(() => {
      setPhonePhase("shrinking");
      setShowWebApp(true);
      setTimeout(() => {
        setPhonePhase("mini");
        goToScreen(4);
      }, 1000 / speed);
    }, 500 / speed);
  }, [setCallAccepted, timer, goToScreen, speed]);

  const handleTrackChoice = useCallback(
    (choice: "yes" | "no") => {
      if (choice === "yes") setHexaToggled(true);
      setHexaNotificationResponded(true);
      setTimeout(() => {
        setHexaNotificationVisible(false);
      }, 300);
    },
    [setHexaToggled]
  );

  const handleSelectLive = useCallback(() => {
    setWebAppView("detail");
    goToScreen(5);
  }, [goToScreen]);

  const handleBackToList = useCallback(() => {
    setWebAppView("list");
    setCallCompleted(true);
    goToScreen(4);
  }, [goToScreen, setCallCompleted]);

  const handleCallEnd = useCallback(() => timer.stop(), [timer]);

  const targetX = -(windowSize.width / 2 - 100 - 24);
  const targetY = windowSize.height / 2 - 180 - 24;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 40% 35% at 50% 45%, rgba(194,155,101,0.06) 0%, transparent 100%)",
      }} />

      <SpeedControl />

      {screen === 1 && !showIncomingCall && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-[11px] font-medium text-muted-foreground/80">
          Press spacebar to start
        </div>
      )}

      {phonePhase !== "mini" && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: phonePhase === "shrinking" ? 60 : 10 }}
          animate={
            phonePhase === "shrinking"
              ? { scale: 0.4, x: targetX, y: targetY, opacity: 0 }
              : { scale: 1, x: 0, y: 0, opacity: 1 }
          }
          transition={
            phonePhase === "shrinking"
              ? { type: "spring", stiffness: 180, damping: 22 }
              : { duration: 0 }
          }
        >
          <PhoneFrame
            hexaToggled={hexaToggled}
            dynamicIslandExpanded={hexaNotificationVisible}
            dynamicIslandResponded={hexaNotificationResponded}
            onDynamicIslandChoice={handleTrackChoice}
          >
            <AnimatePresence mode="wait">
              {(screen === 1 || (screen === 3 && !showIncomingCall)) && (
                <motion.div key="home" className="h-full"
                  exit={{ opacity: 0, scale: 1.06 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <HomeScreen />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showIncomingCall && screen >= 3 && (
                <IncomingCall
                  callAccepted={callAccepted}
                  timerFormatted={timer.formatted}
                  onAccept={handleAccept}
                />
              )}
            </AnimatePresence>
          </PhoneFrame>
        </motion.div>
      )}

      <AnimatePresence>
        {showWebApp && (
          <motion.div key="webapp" className="absolute inset-0 p-3" style={{ zIndex: 20 }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          >
            <BrowserChrome>
              <Sidebar />
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {webAppView === "list" && (
                    <motion.div key="list" className="h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CallList
                        timerFormatted={timer.formatted}
                        onSelectLiveCall={handleSelectLive}
                        callCompleted={callCompleted}
                      />
                    </motion.div>
                  )}
                  {webAppView === "detail" && (
                    <motion.div key="detail" className="h-full"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CallDetail
                        timerFormatted={timer.formatted}
                        elapsedSeconds={timer.elapsedSeconds}
                        isTimerRunning={timer.isRunning}
                        onBack={handleBackToList}
                        screen5State={screen5State}
                        setScreen5State={setScreen5State}
                        onCallEnd={handleCallEnd}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </BrowserChrome>
          </motion.div>
        )}
      </AnimatePresence>

      {phonePhase === "mini" && (
        <MiniPhone
          timerFormatted={timer.formatted}
          callEnded={!timer.isRunning && callAccepted}
          visible={!callCompleted}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <SpeedProvider>
      <DemoApp />
    </SpeedProvider>
  );
}

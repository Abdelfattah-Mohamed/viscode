import { useState, useEffect, useRef, useCallback } from "react";

export function useStepPlayer(steps = [], speed = 900) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(speed);
  const timerRef = useRef(null);

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!isPlaying) { stop(); return; }
    timerRef.current = setInterval(() => {
      setStepIndex(prev => {
        if (prev >= steps.length - 1) { setIsPlaying(false); stop(); return prev; }
        return prev + 1;
      });
    }, playSpeed);
    return stop;
  }, [isPlaying, playSpeed, steps.length, stop]);

  // Reset when steps change (problem switch)
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
    stop();
  }, [steps, stop]);

  return {
    currentStep: steps[stepIndex] ?? null,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    play:     () => setIsPlaying(true),
    pause:    () => setIsPlaying(false),
    next:        () => { setIsPlaying(false); setStepIndex(p => Math.min(p + 1, steps.length - 1)); },
    prev:        () => { setIsPlaying(false); setStepIndex(p => Math.max(p - 1, 0)); },
    jumpToStart: () => { setIsPlaying(false); setStepIndex(0); },
    jumpToEnd:   () => { setIsPlaying(false); setStepIndex(steps.length ? steps.length - 1 : 0); },
    reset:       () => { setIsPlaying(false); setStepIndex(0); },
    setSpeed: ms => setPlaySpeed(ms),
  };
}

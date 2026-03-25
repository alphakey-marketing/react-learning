import { useEffect, useRef, useState } from "react";

const BGM_TRACKS: Record<string, string> = {
  town: "/audio/town.mp3",
  fight: "/audio/fight.ogg",
  boss: "/audio/boss.ogg",
};

const SFX_TRACKS: Record<string, string> = {
  death: "/audio/death.ogg",
  levelup: "/audio/levelup.mp3",
};

export function useGameAudio() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string>("");
  const isPlayingRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const playBGM = (trackKey: string) => {
    // Only skip if same track AND audio is actually playing
    if (currentTrackRef.current === trackKey && isPlayingRef.current) return;
    currentTrackRef.current = trackKey;

    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current = null;
    }

    const src = BGM_TRACKS[trackKey];
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = isMutedRef.current ? 0 : 0.4;
    audio
      .play()
      .then(() => {
        isPlayingRef.current = true;
      })
      .catch(() => {
        isPlayingRef.current = false;
      });
    bgmRef.current = audio;
  };

  // Clears guards so same track can be retried — use on first user interaction
  const resetAndPlay = (trackKey: string) => {
    currentTrackRef.current = "";
    isPlayingRef.current = false;
    playBGM(trackKey);
  };

  const playSFX = (trackKey: string) => {
    if (isMutedRef.current) return;
    const src = SFX_TRACKS[trackKey];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (bgmRef.current) {
        bgmRef.current.volume = next ? 0 : 0.4;
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      bgmRef.current?.pause();
    };
  }, []);

  return { playBGM, resetAndPlay, playSFX, toggleMute, isMuted };
}
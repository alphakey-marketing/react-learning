import { useEffect, useRef, useState } from "react";

// death and levelup are one-shot SFX, not looping BGM
const BGM_TRACKS: Record<string, string> = {
  town: "/audio/town.mp3",
  fight: "/audio/fight.mp3",
  boss: "/audio/boss.ogg",
};

const SFX_TRACKS: Record<string, string> = {
  death: "/audio/death.ogg",
  levelup: "/audio/levelup.mp3",
};

export function useGameAudio() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false); // ref so SFX functions can read latest value

  const playBGM = (trackKey: string) => {
    if (currentTrackRef.current === trackKey) return; // already playing
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
    audio.play().catch(() => {
      // Autoplay blocked — will play after first user interaction
    });
    bgmRef.current = audio;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bgmRef.current?.pause();
    };
  }, []);

  return { playBGM, playSFX, toggleMute, isMuted };
}
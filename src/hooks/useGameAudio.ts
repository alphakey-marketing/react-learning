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
  // P0: track first user interaction so mobile browsers allow audio
  const userHasInteractedRef = useRef(false);
  const pendingTrackRef = useRef<string>("");

  const playBGM = (trackKey: string) => {
    // Only skip if same track AND audio is actually playing
    if (currentTrackRef.current === trackKey && isPlayingRef.current) return;
    currentTrackRef.current = trackKey;

    // P0: If user hasn't interacted yet, queue the track and wait
    if (!userHasInteractedRef.current) {
      pendingTrackRef.current = trackKey;
      return;
    }

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

  // P0: Call this once on the first user tap/click to unlock audio
  const unlockAudio = () => {
    if (userHasInteractedRef.current) return;
    userHasInteractedRef.current = true;
    const trackToPlay = pendingTrackRef.current || currentTrackRef.current;
    if (trackToPlay) {
      resetAndPlay(trackToPlay);
    }
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

  return { playBGM, resetAndPlay, unlockAudio, playSFX, toggleMute, isMuted };
}
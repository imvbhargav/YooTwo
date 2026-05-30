import React from "react";

interface OverlayControlsProps {
  playVideo: boolean;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  loop: boolean;
  volume: number;
  videoProgress: number;
  videoLoaded: number;
  playedSecs: string;
  totalDuration: string;
  fileExists: boolean;
  videoID: string;
  remoteBuffering: boolean;
  handleForcePlay: (enable: boolean) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeekVideo: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoopChange: () => void;
  remoteUsername: string | null;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({
  playVideo,
  muted,
  setMuted,
  loop,
  volume,
  videoProgress,
  videoLoaded,
  playedSecs,
  totalDuration,
  fileExists,
  videoID,
  remoteBuffering,
  handleForcePlay,
  handleVolumeChange,
  handleSeekVideo,
  handleLoopChange,
  remoteUsername,
}) => {
  return (
    <div
      className={`${
        !playVideo || remoteBuffering
          ? "opacity-100 bg-black/60"
          : "opacity-0 hover:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-transparent"
      } absolute inset-0 w-full h-full transition-all duration-300 z-10 flex flex-col justify-between`}
      style={
        (!playVideo || remoteBuffering) && !fileExists
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("https://img.youtube.com/vi/${videoID}/maxresdefault.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {/* Clickable Area to Toggle Play/Pause */}
      <button
        className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
        onClick={() => handleForcePlay(!playVideo)}
        aria-label="Toggle Play"
      />

      {/* Top Status Indicator */}
      <div className="w-full flex justify-center pt-8 pointer-events-none z-20">
        {(!playVideo || remoteBuffering) && (
          <div className="border border-white/20 bg-black/60 backdrop-blur-sm px-4 py-2 shadow-2xl">
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.2em] uppercase text-white/90 animate-pulse">
              {playVideo && remoteBuffering
                ? `[ ${remoteUsername} is buffering ]`
                : "[ Paused — Click to play ]"}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex flex-col z-20 mt-auto">
        {/* Progress Bar (Custom Brutalist implementation) */}
        <div className="w-full h-[3px] bg-white/10 hover:h-2 transition-all relative group cursor-pointer">
          {/* Loaded Buffer Line */}
          <div
            className="absolute top-0 left-0 h-full bg-white/30"
            style={{ width: `${videoLoaded}%` }}
          />
          {/* Current Progress Line */}
          <div
            className="absolute top-0 left-0 h-full bg-[#f0ede8]"
            style={{ width: `${videoProgress}%` }}
          />
          {/* Invisible Range Input for Interaction */}
          <input
            type="range"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 p-0"
            min="1"
            max="100"
            value={videoProgress}
            onChange={handleSeekVideo}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-sm border-t border-white/[0.05]">
          {/* Left: Time & Quality */}
          <div className="flex items-center gap-6">
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.1em] text-[#f0ede8]">
              {playedSecs} <span className="text-white/30 mx-1">/</span>{" "}
              <span className="text-white/60">{totalDuration}</span>
            </span>
            <span className="font-['DM_Mono',monospace] text-[9px] tracking-[0.15em] uppercase text-white/40 border border-white/10 px-2 py-0.5">
              Auto
            </span>
          </div>

          {/* Right: Audio, Loop, Volume */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleLoopChange}
              className={`font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] uppercase transition-colors hover:text-white ${
                loop ? "text-[#f0ede8]" : "text-white/30"
              }`}
            >
              [ Loop: {loop ? "On" : "Off"} ]
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMuted(!muted)}
                className={`font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] uppercase transition-colors hover:text-white ${
                  muted ? "text-red-400" : "text-[#f0ede8]"
                }`}
              >
                [ {muted ? "Muted" : "Audio"} ]
              </button>
              
              {/* Custom Volume Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-0.5 bg-white/20 appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#f0ede8]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayControls;
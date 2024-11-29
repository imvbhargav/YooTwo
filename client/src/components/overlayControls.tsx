interface OverlayControlsProps {
  // Video state
  playVideo: boolean;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  loop: boolean;
  volume: number;

  // Progress state
  videoProgress: number;
  videoLoaded: number;
  playedSecs: string;
  totalDuration: string;

  // Video source state
  fileExists: boolean;
  videoID: string;

  // Buffer state
  remoteBuffering: boolean;

  // Event handlers
  handleForcePlay: (enable: boolean) => void;
  handleVolumeChange: ({ target }: { target: HTMLInputElement }) => void;
  handleSeekVideo: (event: any) => void;
  handleLoopChange: () => void;

  // Remote state
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
  remoteUsername
}) => {
  return (
    <div className={`${!playVideo || remoteBuffering ? "opacity-100 bg-no-repeat bg-cover bg-transparent" : "opacity-0 hover:opacity-100"} absolute w-full h-full top-0 left-0 outline-none border-none`}
        style={ (!playVideo || remoteBuffering) && !fileExists ? {backgroundImage: `url("https://img.youtube.com/vi/${videoID}/maxresdefault.jpg")`} : {}}>
      <button className="w-full h-full bg-black/20" onClick={() => handleForcePlay(!playVideo)}></button>
      {(!playVideo || remoteBuffering) && <p className="bg-[blueviolet] pointer-events-none text-white absolute text-center w-full top-0 py-4"><strong className="animate-pulse">{ playVideo && remoteBuffering ? `${remoteUsername}'s buffering, Force play!` : "Video is paused, Click to play!"}</strong></p>}
      <div className="w-full absolute bottom-0 flex flex-col-reverse">
        <div className="flex w-full justify-between bg-black/75">
          <p className="bg-transparent text-white text-left w-max bottom-0 p-4 text-sm sm:text-2xl">{playedSecs + " / " + totalDuration}</p>
          <p className="bg-transparent text-white text-left w-max bottom-0 p-4 text-sm sm:text-2xl"><span className="text-zinc-400 animate-pulse">Quality: Auto</span></p>
          <div className="flex justify-end">
            <button className={`bg-transparent text-white text-left w-max bottom-0 p-2 sm:p-4 outline-none border-none text-sm sm:text-2xl md:min-w-32 ${loop ? "" : "line-through decoration-pink-500 decoration-4"}`} onClick={handleLoopChange}>Loop</button>
            <button className={`bg-transparent text-white text-left w-max bottom-0 p-2 sm:p-4 outline-none border-none text-sm sm:text-2xl md:min-w-32 ${muted ? "line-through decoration-pink-500 decoration-4" : ""}`} onClick={() => setMuted(!muted)}>Audio</button>
            <div className="flex items-center justify-center w-1/2 md:w-full mr-4">
              <input className='range_slider' type="range" min="1" max="100" value={volume} onChange={handleVolumeChange} />
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-800 overflow-hidden hover:h-4 relative">
          <span style={{width: `${videoLoaded}%`}} className="h-4 block bottom-14 bg-gray-300">
            <div className="flex items-center justify-center w-full absolute top-0 opacity-70">
              <input className='range_slider_video' type="range" min="1" max="100" value={videoProgress} onChange={handleSeekVideo} />
            </div>
          </span>
        </div>
      </div>
    </div>
  )
}

export default OverlayControls;
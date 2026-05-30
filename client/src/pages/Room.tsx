import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { useMeeting } from "../context/MeetProvider";
import peer from "../service/peer";
import OverlayControls from "../components/overlayControls";
import {
  DataChannelMessage,
  ProgressState,
  SignalingPayload,
  UserJoinedPayload,
} from "../types";

function IconVideo({ off }: { off?: boolean }) {
  return (
    <svg
      className="w-6 h-6 md:w-8 md:h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
      {off && <line x1="3" y1="3" x2="21" y2="21" strokeWidth={1.5} />}
    </svg>
  );
}

function IconMic({ off }: { off?: boolean }) {
  return (
    <svg
      className="w-6 h-6 md:w-8 md:h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
      {off && <line x1="3" y1="3" x2="21" y2="21" strokeWidth={1.5} />}
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      className="w-6 h-6 md:w-8 md:h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Flexible Video Tile 
───────────────────────────────────────────── */
function VideoTile({
  name,
  isLocal,
  hasVideo,
  children,
  onCopy,
  copyRef,
}: {
  name: string | null;
  isLocal?: boolean;
  hasVideo: boolean;
  children?: React.ReactNode;
  onCopy?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  copyRef?: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <div className="relative bg-[#0d0d0d] border border-white/[0.07] overflow-hidden flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center p-2 rounded-sm shadow-inner">
      {hasVideo ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 w-full h-full z-10 p-2">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
            <span className="font-['Syne',sans-serif] text-base lg:text-2xl font-bold text-white/40 uppercase">
              {name ? name.slice(0, 2) : "??"}
            </span>
          </div>
          <span className="font-['DM_Mono',monospace] text-[9px] lg:text-[11px] tracking-[0.12em] uppercase text-white/40 text-center">
            {isLocal ? "Camera Off" : name ? "Audio Only" : "Waiting for peer"}
          </span>
          {!isLocal && !name && onCopy && (
            <button
              ref={copyRef}
              onClick={onCopy}
              className="mt-1 lg:mt-2 font-['DM_Mono',monospace] text-[9px] lg:text-[11px] tracking-[0.15em] uppercase text-white/50 hover:text-white/90 border border-white/20 px-3 py-1.5 transition-colors bg-white/5 hover:bg-white/10 whitespace-nowrap"
            >
              [ Copy ID ]
            </button>
          )}
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 lg:bottom-4 lg:left-4 px-2 py-1 lg:px-2.5 lg:py-1.5 bg-black/70 backdrop-blur-sm border border-white/10 flex items-center gap-2">
        <span className="font-['DM_Mono',monospace] text-[9px] lg:text-[11px] tracking-[0.1em] uppercase text-white/80">
          {name ?? (isLocal ? "You" : "—")}
        </span>
        {isLocal && (
          <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Room
───────────────────────────────────────────── */
function Room(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchRef = useRef<typeof ReactPlayer | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const copyRef = useRef<HTMLButtonElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileVideoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const receiveTypeRef = useRef<string>("callStream");
  const fileStreamRef = useRef<MediaStream | null>(null);

  const socket = useSocket();
  const navigate = useNavigate();
  const { room } = useParams<{ room: string }>();
  const { username, meetid, remoteSocketID, setRemoteSocketID } = useMeeting();

  const [showMe, setShowMe] = useState<boolean>(false);
  const [listenMe, setListenMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vdurl, setVdurl] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteFileStream, setRemoteFileStream] = useState<MediaStream | null>(
    null,
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState<boolean>(false);
  const [remoteUsername, setRemoteUsername] = useState<string | null>(null);
  const [remoteVideoExist, setRemoteVideoExist] = useState<boolean>(false);
  const [remoteBuffering, setRemoteBuffering] = useState<boolean>(false);
  const [remoteNextBuffering, setRemoteNextBuffering] =
    useState<boolean>(false);
  const [localBuffering, setLocalBuffering] = useState<boolean>(false);
  const [playVideo, setPlayVideo] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [videoID, setVideoID] = useState<string>("");
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoLoaded, setVideoLoaded] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<string>("00:00");
  const [playedSecs, setPlayedSecs] = useState<string>("00:00");
  const [volume, setVolume] = useState<number>(100);

  // ── Streams ──────────────────────────────────────
  const sendStreams = useCallback(() => {
    if (!showMe && !listenMe && peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({ type: "mediaStatus", content: "stopped" }),
      );
    }
    if (localStream && peer.peer) {
      peer.dataChannel?.send(
        JSON.stringify({ type: "mediaReceiving", content: "callStream" }),
      );
      setTimeout(() => {
        for (const track of localStream.getTracks()) {
          if (
            (showMe && track.kind === "video") ||
            (listenMe && track.kind === "audio")
          ) {
            peer.peer?.addTrack(track, localStream);
          }
        }
      }, 100);
    }
  }, [showMe, listenMe, localStream]);

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        localStream?.getTracks().forEach((t) => t.stop());
        let stream: MediaStream = new MediaStream();
        if (showMe || listenMe) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: showMe,
            audio: listenMe,
          });
        }
        if (!showMe && !listenMe) {
          stream.getTracks().forEach((t) => t.stop());
          setLocalStream(null);
        } else {
          if (!showMe && listenMe)
            stream.getVideoTracks().forEach((t) => t.stop());
          else if (showMe && !listenMe)
            stream.getAudioTracks().forEach((t) => t.stop());
          setLocalStream(stream);
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError("Unable to access media devices. Please check permissions.");
        console.error(err);
      }
    };
    getUserMedia();
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [showMe, listenMe]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── YouTube ──────────────────────────────────────
  useEffect(() => {
    const getYouTubeVideoId = (url: string) => {
      const match = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(url);
      return match ? match[1] : null;
    };
    setVideoID(getYouTubeVideoId(vdurl ?? "") ?? "");
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({ type: "videoLink", content: video }),
      );
    }
  }, [video, vdurl]);

  const handleURLSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (remoteSocketID) {
      setPlayVideo(false);
      setVideo(vdurl);
      setFileExists(false);
    }
  };

  const toggleMyVideo = () => setShowMe((p) => !p);
  const toggleMyAudio = () => setListenMe((p) => !p);

  // ── Signaling ─────────────────────────────────────
  const handleUserJoined = useCallback(
    (data: UserJoinedPayload) => {
      if (socket && data.id !== socket.id) {
        setRemoteSocketID(data.id);
        setRemoteUsername(data.username);
        socket.emit("user:accepted", {
          username,
          to: data.id,
          id: socket.id,
          room: meetid,
        });
      }
    },
    [socket, setRemoteSocketID, meetid, username],
  );

  const handleUserAccepted = useCallback(
    (data: UserJoinedPayload) => {
      if (socket && data.id !== socket.id) {
        setRemoteSocketID(data.id);
        setRemoteUsername(data.username);
        peer.getOffer().then((offer) => {
          socket.emit("receive:offer", { room: meetid, id: socket.id, offer });
        });
      }
    },
    [socket, setRemoteSocketID, meetid],
  );

  const handleOfferReceive = useCallback(
    (data: SignalingPayload) => {
      if (socket && data.id !== socket.id && data.offer) {
        peer.getAnswer(data.offer).then((ans) => {
          socket.emit("receive:answer", { room: meetid, id: socket.id, ans });
        });
      }
    },
    [socket, meetid],
  );

  const handleAnswerReceive = useCallback(
    (data: SignalingPayload) => {
      if (socket && data.id !== socket.id && peer.peer && data.ans) {
        peer.peer.setRemoteDescription(data.ans).then(sendStreams);
      }
    },
    [socket, sendStreams],
  );

  const handleReceivedNegotiation = useCallback(
    (data: SignalingPayload) => {
      if (socket && socket.id !== data.from && data.data?.offer) {
        peer.getAnswer(data.data.offer).then((ans) => {
          socket.emit("negotiation:complete", { to: data.from, ans });
        });
      }
    },
    [socket],
  );

  const handleNegotiationComplete = useCallback(
    (data: SignalingPayload) => {
      if (socket && peer.peer && data.ans) {
        peer.peer.setRemoteDescription(data.ans);
        if (!peer.dataChannel)
          peer.dataChannel = peer.peer.createDataChannel("messages") ?? null;
      }
    },
    [socket],
  );

  const handleRemoteUserLeft = useCallback(
    (data: UserJoinedPayload) => {
      sessionStorage.setItem(
        "message",
        `Meeting ended! ${data.username} left.`,
      );
      navigate(`/lobby/join?roomid=${meetid}`);
    },
    [navigate, meetid],
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("user:joined", handleUserJoined);
    socket.on("user:here", handleUserAccepted);
    socket.on("receive:offer", handleOfferReceive);
    socket.on("receive:answer", handleAnswerReceive);
    socket.on("negotiated", handleReceivedNegotiation);
    socket.on("negotiation:complete", handleNegotiationComplete);
    socket.on("user:left", handleRemoteUserLeft);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("user:here", handleUserAccepted);
      socket.off("receive:offer", handleOfferReceive);
      socket.off("receive:answer", handleAnswerReceive);
      socket.off("negotiated", handleReceivedNegotiation);
      socket.off("negotiation:complete", handleNegotiationComplete);
      socket.off("user:left", handleRemoteUserLeft);
    };
  }, [
    socket,
    handleUserJoined,
    handleUserAccepted,
    handleOfferReceive,
    handleAnswerReceive,
    handleReceivedNegotiation,
    handleNegotiationComplete,
    handleRemoteUserLeft,
  ]);

  useEffect(() => {
    sendStreams();
  }, [localStream, sendStreams]);

  useEffect(() => {
    if (!peer.peer) return;
    const handleTrack = (ev: RTCTrackEvent) => {
      const streams = ev.streams;
      if (receiveTypeRef.current === "videoFile") {
        setRemoteFileStream(streams[0]);
      } else {
        if (streams[0].getTracks().length > 0) setRemoteStream(streams[0]);
        else setRemoteStream(null);
        setRemoteVideoExist(streams[0].getVideoTracks().length > 0);
      }
    };
    peer.peer.addEventListener("track", handleTrack);
    return () => {
      peer.peer?.removeEventListener("track", handleTrack);
    };
  }, []);

  const handleRemoteFilePeek = (seekFrac: number) => {
    if (fileVideoRef.current) {
      fileVideoRef.current.currentTime =
        seekFrac * fileVideoRef.current.duration;
    }
  };

  useEffect(() => {
    const handleDataChannelMessage = (e: MessageEvent) => {
      const message: DataChannelMessage = JSON.parse(e.data);
      if (message.type === "mediaStatus" && message.content === "progress") {
        setVideoProgress(message.progress ?? 0);
        setPlayedSecs(message.progressSec ?? "00:00");
      } else if (
        message.type === "mediaStatus" &&
        message.content === "duration"
      ) {
        setTotalDuration(message.duration ?? "00:00");
      } else if (
        message.type === "mediaStatus" &&
        message.content === "stopped"
      ) {
        setRemoteStream(null);
        setRemoteVideoExist(false);
      } else if (message.type === "videoLink") {
        if (!message.content) {
          setVdurl(null);
          setVideo(null);
          setRemoteBuffering(false);
          setRemoteNextBuffering(false);
        } else {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          setFileUrl(null);
          setRemoteFileStream(null);
          setFileExists(false);
          setVdurl(message.content as string);
          setVideo(message.content as string);
        }
      } else if (message.type === "videoCtrl" && message.content === "pause") {
        setPlayVideo(false);
      } else if (message.type === "videoCtrl" && message.content === "play") {
        setPlayVideo(true);
      } else if (message.type === "ready") {
        setPlayVideo(true);
      } else if (message.type === "videoCtrl" && message.content === "buffer") {
        setRemoteNextBuffering(localBuffering ? true : false);
        setRemoteBuffering(localBuffering ? false : true);
      } else if (
        message.type === "videoCtrl" &&
        message.content === "bufferEnd"
      ) {
        setRemoteNextBuffering(false);
        setRemoteBuffering(false);
      } else if (message.type === "videoCtrl" && message.content === "loop") {
        setLoop(message.enable ?? false);
      } else if (
        message.type === "seekTo" &&
        typeof message.content === "number"
      ) {
        if (message.video === "file") handleRemoteFilePeek(message.content);
        else if (message.video === "yt")
          watchRef.current?.seekTo(message.content);
      } else if (message.type === "mediaReceiving") {
        receiveTypeRef.current = message.content as string;
        if (receiveTypeRef.current === "videoFile") {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          setFileExists(true);
          setFileUrl(null);
        }
      }
    };

    const handleDataChannel = (ev: RTCDataChannelEvent) => {
      const receiveChannel = ev.channel;
      if (!peer.dataChannel)
        peer.dataChannel = peer.peer?.createDataChannel("messages") ?? null;
      receiveChannel.addEventListener("message", handleDataChannelMessage);
    };

    if (peer.peer) peer.peer.addEventListener("datachannel", handleDataChannel);
    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("datachannel", handleDataChannel);
        peer.dataChannel?.removeEventListener(
          "message",
          handleDataChannelMessage,
        );
      }
    };
  }, [localBuffering]);

  const handleNegotiationNeeded = useCallback(async () => {
    if (socket && remoteSocketID) {
      peer.getOffer().then((offer) => {
        socket.emit("negotiate", { to: remoteSocketID, offer });
      });
    }
  }, [socket, remoteSocketID]);

  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      peer.peer?.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded,
      );
    };
  }, [handleNegotiationNeeded]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (fileExists) {
      if (playVideo) fileVideoRef.current?.play().catch(() => {});
      else fileVideoRef.current?.pause();
    }
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({
          type: "videoCtrl",
          content: playVideo ? "play" : "pause",
        }),
      );
    }
  }, [playVideo, fileExists]);

  const handlePlayPause = (enable: boolean) => {
    if (!remoteBuffering) setPlayVideo(enable);
  };
  const handleForcePlay = (enable: boolean) => {
    handlePlayPause(enable);
    setRemoteBuffering(false);
  };

  useEffect(() => {
    setRemoteBuffering(remoteNextBuffering);
  }, [localBuffering, remoteNextBuffering]);

  const handleBuffer = (buffering: boolean) => {
    setLocalBuffering(buffering);
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({
          type: "videoCtrl",
          content: buffering ? "buffer" : "bufferEnd",
        }),
      );
    }
  };

  const handleReady = () => {
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(JSON.stringify({ type: "ready" }));
    }
    const iframe = watchRef.current?.getInternalPlayer() as HTMLIFrameElement;
    if (iframe) {
      iframe.setAttribute("tabindex", "-1");
      iframe.style.pointerEvents = "none";
    }
  };

  const getPlayedSecs = useCallback(
    (playedSecsNum: number) => {
      const h = Math.floor(playedSecsNum / 3600);
      const m = Math.floor((playedSecsNum % 3600) / 60);
      const s = Math.floor(playedSecsNum % 60);
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      const formatted =
        h > 0 ? `${String(h).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
      setPlayedSecs(formatted);
      if (fileExists && fileVideoRef.current) {
        const pct =
          (fileVideoRef.current.currentTime * 100) /
          (fileVideoRef.current.duration || 1);
        peer.dataChannel?.send(
          JSON.stringify({
            type: "mediaStatus",
            content: "progress",
            progressSec: formatted,
            progress: pct,
          }),
        );
      }
    },
    [fileExists],
  );

  const handleDuration = useCallback(
    (duration: number) => {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      const s = Math.floor(duration % 60);
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      const formatted =
        h > 0 ? `${String(h).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
      setTotalDuration(formatted);
      if (fileExists) {
        peer.dataChannel?.send(
          JSON.stringify({
            type: "mediaStatus",
            content: "duration",
            duration: formatted,
          }),
        );
      }
    },
    [fileExists],
  );

  const handleProgress = (data: ProgressState) => {
    setVideoLoaded(Math.floor(data.loaded * 100));
    setVideoProgress(Math.floor(data.played * 100));
    getPlayedSecs(data.playedSeconds);
  };

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (meetid) navigator.clipboard.writeText(meetid);
    if (copyRef.current) copyRef.current.innerText = "[ Copied! ]";
    setTimeout(() => {
      if (copyRef.current) copyRef.current.innerText = "[ Copy ID ]";
    }, 3000);
  };

  useEffect(() => {
    if (fileExists && fileVideoRef.current)
      fileVideoRef.current.volume = volume / 100;
  }, [volume, fileExists]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setVolume(Number(e.target.value));

  const sendNewPosition = (value: number) => {
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({
          type: "seekTo",
          video: fileExists ? "file" : "yt",
          content: value,
        }),
      );
    }
  };

  const handleSeekVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (fileExists) {
      if (fileUrl && fileVideoRef.current) {
        fileVideoRef.current.currentTime =
          (val / 100) * (fileVideoRef.current.duration || 0);
      } else if (remoteFileStream && fileVideoRef.current) {
        sendNewPosition(val / 100);
      }
    } else {
      watchRef.current?.seekTo(val / 100);
      sendNewPosition(val / 100);
    }
  };

  const endCall = () => navigate("/callend");

  const handleLoopChange = () => {
    setLoop((p) => !p);
    if (peer.dataChannel?.readyState === "open") {
      peer.dataChannel.send(
        JSON.stringify({ type: "videoCtrl", content: "loop", enable: !loop }),
      );
    }
  };

  const handlePlayFileStream = () => {
    peer.dataChannel?.send(
      JSON.stringify({ type: "mediaReceiving", content: "videoFile" }),
    );
    setTimeout(() => {
      const vRef = fileVideoRef.current as HTMLVideoElement & {
        captureStream?: () => MediaStream;
      };
      if (vRef?.captureStream) {
        fileStreamRef.current = vRef.captureStream();
        fileStreamRef.current?.getTracks().forEach((track) => {
          peer.peer?.addTrack(track, fileStreamRef.current as MediaStream);
        });
      }
    }, 100);
  };

  const handleMetaDataLoad = useCallback(() => {
    handleDuration(fileVideoRef.current?.duration ?? 0);
    intervalRef.current = setInterval(() => {
      if (playVideo && fileVideoRef.current) {
        getPlayedSecs(fileVideoRef.current.currentTime);
        const pct =
          (fileVideoRef.current.currentTime * 100) /
          (fileVideoRef.current.duration || 1);
        setVideoProgress(pct);
      }
    }, 1000);
    fileVideoRef.current?.removeEventListener(
      "loadedmetadata",
      handleMetaDataLoad,
    );
  }, [handleDuration, playVideo, getPlayedSecs]);

  useEffect(() => {
    if (fileUrl && fileVideoRef.current) {
      fileVideoRef.current.srcObject = null;
      fileVideoRef.current.src = fileUrl;
      fileVideoRef.current.addEventListener(
        "loadedmetadata",
        handleMetaDataLoad,
      );
      setPlayVideo(true);
      fileVideoRef.current
        .play()
        .then(handlePlayFileStream)
        .catch(() => {});
    }
  }, [fileUrl, handleMetaDataLoad]);

  useEffect(() => {
    if (remoteFileStream && fileVideoRef.current) {
      fileVideoRef.current.src = "";
      fileVideoRef.current.srcObject = remoteFileStream;
    }
  }, [remoteFileStream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setVideo(null);
    setVdurl(null);
    const file = e.target.files?.[0];
    if (file) {
      setFileExists(true);
      if (remoteFileStream) setRemoteFileStream(null);
      setFileUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleFileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (remoteUsername) fileRef.current?.click();
  };

  useEffect(() => {
    if (!fileExists && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [fileExists]);

  /* ── Auth gate ─────────────────────────────────── */
  if ((!username || !meetid)) {
    return (
      <>
        <div
          className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] relative overflow-hidden flex items-center justify-center p-6"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(240,237,232,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(240,237,232,0.025) 1px,transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative z-10 w-full max-w-2xl border border-white/[0.08] p-10 flex flex-col gap-8 bg-[#0a0a0a]/80 backdrop-blur-md shadow-[0_0_60px_-15px_rgba(240,237,232,0.05)]">
            <div className="border-b border-white/[0.08] pb-8">
              <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.2em] uppercase text-white/40 mb-4 flex items-center gap-2">
                <span className="block w-4 h-px bg-white/30" />
                Access Denied
              </p>
              <h2
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[42px] leading-[1.05] tracking-[-1.5px] text-[#f0ede8]"
              >
                Authentication
                <br />
                <em className="italic text-white/40">Required.</em>
              </h2>
            </div>

            <p className="text-[15px] leading-relaxed text-white/50">
              You haven't joined a valid session. Return to the lobby to
              establish a secure peer connection.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <button
                onClick={() => navigate(`/lobby/join?roomid=${room || ""}`)}
                className="w-full py-4 bg-[#f0ede8] text-[#0a0a0a] text-[13px] font-bold tracking-[0.08em] uppercase transition-colors hover:bg-white border border-transparent"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Go to Lobby
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Main Room UI ──────────────────────────────── */
  return (
    <>
      <div
        className="w-screen h-[100dvh] bg-[#070707] text-[#f0ede8] overflow-hidden flex flex-col relative"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,237,232,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(240,237,232,0.018) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden relative z-20 px-5 py-4 flex justify-between items-center border-b border-white/[0.07] bg-[#070707]/95 backdrop-blur-md shrink-0">
          <Link
            to="/"
            className="text-2xl font-['DM_Serif_Display',serif] font-black tracking-[-0.5px] text-[#f0ede8] hover:text-white/70 transition-colors"
          >
            YooTwo
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-['DM_Mono',monospace] text-[9px] tracking-[0.1em] text-white/40 uppercase">
              Room:
            </span>
            <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.1em] text-[#f0ede8] border border-white/10 px-2 py-0.5">
              {meetid ?? "—"}
            </span>
          </div>
        </div>

        {/* ── Main Grid Container (Fixed Desktop Layout, Stacked Mobile Layout) ───────────────── */}
        <div className="relative z-10 grid flex-1 min-h-0 overflow-hidden grid-cols-1 grid-rows-[0.6fr_1fr] lg:grid-rows-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px]">
          {/* ── Main video stage ───────────────────── */}
          <main className="relative bg-[#050505] flex items-center justify-center min-h-0 min-w-0 border-b lg:border-b-0 lg:border-r border-white/[0.07]">
            <div className="absolute inset-0 flex items-center justify-center w-full h-full p-0 lg:p-6 bg-black lg:bg-transparent">
              <div className="relative w-full h-full lg:max-h-full lg:aspect-video flex items-center justify-center bg-black lg:border border-white/[0.05] overflow-hidden shadow-2xl">
                {video && (
                  <ReactPlayer
                    ref={watchRef}
                    url={video}
                    className="absolute inset-0"
                    width="100%"
                    height="100%"
                    controls={false}
                    muted={muted}
                    volume={volume / 100}
                    playing={playVideo && !remoteBuffering}
                    loop={loop}
                    config={{
                      youtube: {
                        playerVars: {
                          modestbranding: 1,
                          fs: 0,
                          iv_load_policy: 3,
                          rel: 0,
                          controls: 0,
                          showinfo: 0,
                        },
                      },
                    }}
                    onReady={handleReady}
                    onPause={() => handlePlayPause(false)}
                    onPlay={() => handlePlayPause(true)}
                    onBuffer={() => handleBuffer(true)}
                    onBufferEnd={() => handleBuffer(false)}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={() => handlePlayPause(false)}
                  />
                )}

                {fileExists && (
                  <video
                    ref={fileVideoRef}
                    autoPlay={playVideo}
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    muted={muted}
                    loop={loop}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                )}

                {(video || fileExists) && (
                  <OverlayControls
                    playVideo={playVideo}
                    muted={muted}
                    setMuted={setMuted}
                    loop={loop}
                    volume={volume}
                    videoProgress={videoProgress}
                    videoLoaded={videoLoaded}
                    playedSecs={playedSecs}
                    totalDuration={totalDuration}
                    fileExists={fileExists}
                    videoID={videoID}
                    remoteBuffering={remoteBuffering}
                    handleForcePlay={handleForcePlay}
                    handleVolumeChange={handleVolumeChange}
                    handleSeekVideo={handleSeekVideo}
                    handleLoopChange={handleLoopChange}
                    remoteUsername={remoteUsername}
                  />
                )}

                {!video && !fileExists && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 select-none bg-[#050505]">
                    <div className="w-16 h-16 md:w-20 md:h-20 border border-white/[0.06] flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white/15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-['DM_Mono',monospace] text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-white/30 text-center px-4">
                      No media selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* ── Right sidebar / Bottom on Mobile ────── */}
          <aside className="w-full bg-[#070707] flex flex-col z-20 overflow-y-auto lg:overflow-hidden min-h-0 relative">
            {/* Desktop Header / Branding */}
            <div className="hidden lg:flex px-6 xl:px-8 py-8 border-b border-white/[0.06] items-center justify-between shrink-0">
              <Link
                to="/"
                className="font-['DM_Serif_Display',serif] font-black text-4xl tracking-[-1px] text-[#f0ede8] hover:text-white/70 transition-colors"
              >
                YooTwo
              </Link>
              <div className="flex items-center gap-3">
                <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.12em] uppercase text-white/40">
                  P2P
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${remoteUsername ? "bg-emerald-400" : "bg-white/20"}`}
                />
              </div>
            </div>

            {/* Desktop Status Bar */}
            <div className="hidden lg:flex items-center justify-between px-6 xl:px-8 py-5 border-b border-white/[0.06] shrink-0">
              <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.16em] uppercase text-white/40">
                Participants
              </span>
              <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.1em] text-white/40 border border-white/[0.1] px-3 py-1.5">
                {remoteUsername ? "2" : "1"} / 2
              </span>
            </div>

            {/* Participants (Stacked Col on both Mobile and Desktop) */}
            <div className="flex flex-col flex-1 min-h-0 p-4 lg:p-6 xl:p-8 gap-4 overflow-y-auto items-stretch content-stretch">
              <VideoTile name={username ?? "You"} isLocal hasVideo={showMe}>
                <video
                  className="w-full h-full object-cover"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  controls={false}
                />
              </VideoTile>

              <VideoTile
                name={remoteUsername}
                hasVideo={!!remoteStream && remoteVideoExist}
                onCopy={handleCopy}
                copyRef={copyRef}
              >
                <video
                  className={`h-full object-cover ${remoteVideoExist ? "w-full" : "hidden"}`}
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  controls={false}
                />
              </VideoTile>
            </div>

            {/* Action Controls Block */}
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-4 w-full p-4 lg:p-6 xl:p-8 border-t border-white/[0.06] shrink-0 bg-[#0a0a0a] lg:bg-transparent">
              <button
                onClick={toggleMyAudio}
                title={listenMe ? "Mute" : "Unmute"}
                className={`col-span-1 h-14 md:h-16 lg:h-24 border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 shadow-lg ${listenMe ? "bg-[#f0ede8]/15 border-[#f0ede8]/25 text-white hover:bg-white/25" : "bg-[#0a0a0a] border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80"}`}
              >
                <IconMic off={!listenMe} />
                <span
                  className={`hidden lg:block font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase`}
                >
                  Audio
                </span>
              </button>

              <button
                onClick={toggleMyVideo}
                title={showMe ? "Stop Video" : "Start Video"}
                className={`col-span-1 h-14 md:h-16 lg:h-24 border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 shadow-lg ${showMe ? "bg-[#f0ede8]/15 border-[#f0ede8]/25 text-white hover:bg-white/25" : "bg-[#0a0a0a] border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80"}`}
              >
                <IconVideo off={!showMe} />
                <span
                  className={`hidden lg:block font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase`}
                >
                  Video
                </span>
              </button>

              <button
                onClick={endCall}
                title="End Call"
                className="col-span-1 lg:col-span-2 h-14 md:h-16 lg:h-16 bg-red-500 hover:bg-red-600 border border-transparent text-white flex items-center justify-center gap-3 transition-colors shadow-[0_0_25px_-5px_rgba(239,68,68,0.35)]"
              >
                <IconPhone />
                <span className="hidden lg:block font-['DM_Mono',monospace] text-[11px] tracking-[0.12em] uppercase text-white/90">
                  End Call
                </span>
              </button>
            </div>
          </aside>
        </div>

        {/* ── Bottom control bar: Media Inputs ────── */}
        <footer className="relative z-20 shrink-0 border-t border-white/[0.07] bg-[#070707]/95 backdrop-blur-md flex flex-col md:flex-row items-stretch gap-0">
          {/* Guest / Peer Info (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-between w-64 shrink-0 border-r border-white/10 px-6 xl:px-8 py-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-['DM_Serif_Display',serif] text-lg text-white/80 leading-none">
                {username ?? "Guest"}
              </span>
              <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.1em] uppercase text-white/40 truncate w-44">
                {remoteUsername
                  ? `with ${remoteUsername}`
                  : "Waiting for peer..."}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleURLSubmit}
            className="w-full flex items-stretch gap-2 lg:gap-3 px-4 md:px-6 py-3 md:py-4"
          >
            <input
              type="url"
              onChange={(e) => setVdurl(e.target.value)}
              placeholder="Paste YouTube URL..."
              value={vdurl ?? ""}
              className="py-3 flex-1 min-w-0 bg-[#0a0a0a] lg:bg-transparent border border-white/[0.1] px-4 md:px-6 text-[#f0ede8] font-['DM_Mono',monospace] text-[11px] md:text-[13px] outline-none transition-colors placeholder-white/20 focus:border-white/40 hover:border-white/25 shadow-inner"
            />
            <button
              type="submit"
              className="shrink-0 font-['Syne',sans-serif] text-[11px] md:text-[13px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] bg-[#f0ede8] px-5 md:px-8 transition-colors hover:bg-white whitespace-nowrap border border-transparent shadow-lg flex items-center justify-center"
            >
              Play
            </button>
            <span className="hidden md:block w-px bg-white/10 mx-2 shrink-0 my-2" />
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileRef}
            />
            <button
              type="button"
              onClick={handleFileClick}
              title="Share Local File"
              className="shrink-0 hidden sm:flex items-center justify-center font-['Syne',sans-serif] text-[11px] md:text-[13px] font-bold tracking-[0.08em] uppercase text-white/60 border border-white/20 px-4 md:px-6 lg:px-8 transition-colors hover:border-white/40 hover:text-white hover:bg-white/[0.04] whitespace-nowrap bg-[#0a0a0a] lg:bg-transparent"
            >
              <span className="hidden lg:inline">Local File</span>
              <span className="lg:hidden">
                <IconFolder />
              </span>
            </button>
          </form>

          {/* Room ID (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-end gap-5 w-64 shrink-0 border-l border-white/10 px-6 xl:px-8 py-5">
            <div className="flex flex-col gap-1.5 items-end">
              <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.1em] text-white/30 uppercase">
                Room ID
              </span>
              <span className="font-['DM_Mono',monospace] text-[13px] tracking-[0.1em] uppercase text-white/70">
                {meetid ?? "—"}
              </span>
            </div>
            {remoteBuffering && (
              <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.12em] uppercase text-amber-400/80 animate-pulse border border-amber-400/30 px-3 py-1.5 ml-3 bg-amber-400/5">
                Buffering
              </span>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}

export default Room;

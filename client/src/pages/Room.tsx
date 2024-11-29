import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import { useMeeting } from "../context/MeetProvider";
import peer from "../service/peer";
import { useParams } from "react-router-dom";
import OverlayControls from '../components/overlayControls';

let interval: any = undefined;
let receiveType: string = "callStream";
let fileStream: MediaStream = new MediaStream;

function Room(): JSX.Element {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchRef = useRef<typeof ReactPlayer | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const copyRef = useRef<HTMLButtonElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileVideoRef = useRef<HTMLVideoElement | null>(null);

  // Use the useSocket hook to get the socket instance.
  const socket = useSocket();

  // Boolean state variables to toggle audio and video.
  const [ showMe, setShowMe ] = useState<boolean>(true);
  const [ listenMe, setListenMe ] = useState<boolean>(true);

  // State to store possible error getting audio or video.
  const [ error, setError ] = useState<string | null>(null);

  // State to store video URL as the input changes and another to use as full URL.
  const [ vdurl, setVdurl ] = useState<string | null>(null);
  const [ video, setVideo ] = useState<string | null>(null);

  // State to store local and remote streams.
  const [ localStream, setLocalStream ] = useState<MediaStream | null>(null);
  const [ remoteStream, setRemoteStream ] = useState<MediaStream | null>(null);
  const [ remoteFileStream, setRemoteFileStream ] = useState<MediaStream | null>(null);
  const [ fileUrl, setFileUrl ] = useState<string | null>(null);
  const [ fileExists, setFileExists ] = useState<boolean>(false);

  // State to store remote username.
  const [ remoteUsername, setRemoteUsername ] = useState<string | null>(null);
  const [ remoteVideoExist, setRemoteVideoExist ] = useState<boolean>(false);
  const [ remoteBuffering, setRemoteBuffering ] = useState<boolean>(false);
  const [ remoteNextBuffering, setRemoteNextBuffering ] = useState<boolean>(false);
  const [ localBuffering, setLocalBuffering ] = useState<boolean>(false);

  const [ playVideo, setPlayVideo ] = useState<boolean>(true);
  const [ muted, setMuted ] = useState<boolean>(false);
  const [ loop, setLoop ] = useState<boolean>(false);
  const [ videoID, setVideoID ] = useState<string>("");
  const [ videoProgress, setVideoProgress ] = useState<number>(0);
  const [ videoLoaded, setVideoLoaded ] = useState<number>(0);
  const [ totalDuration, setTotalDuration ] = useState<string>("00:00");
  const [ playedSecs, setPlayedSecs ] = useState<string>("00:00");
  const [ volume, setVolume ] = useState<number>(100);

  // Custom hook to use the MeetingContext.
  const { username, meetid, remoteSocketID, setRemoteSocketID } = useMeeting();

  // Use the useNavigate hook to navigate to other pages.
  const  { room } = useParams<{ room: string }>();

  useEffect(() => {

    // If username or meetid is not given the redirect to lobby to register these values.
    if (!username || !meetid) {
      window.location.href = `/lobby/join?roomid=${room}`;
    }
  }, []);

  // Function to send the streams using WebRTC connection.
  const sendStreams = () => {
    if (!showMe && !listenMe && peer.dataChannel && peer.dataChannel.readyState == "open") {
      peer.dataChannel.send(JSON.stringify({type: "mediaStatus", content: "stopped"}));
    }
    if (localStream && peer.peer){
      peer.dataChannel?.send(JSON.stringify({type: "mediaReceiving", content: "callStream"}));
      setTimeout(() => {
        for (const track of localStream.getTracks()) {
          if ((showMe && track.kind === "video") || (listenMe && track.kind === "audio")) {
            peer.peer?.addTrack(track, localStream);
          }
        }
      }, 100);
    }
  };

  // If any error occurs while loading user AV media show the error as an alert.
  useEffect(()=> {
    if (error)
      console.error(error);
  }, [error]);

  useEffect(() => {

    // Function to get user media.
    const getUserMedia = async () => {
      try {
        // Stop existing tracks if toggling camera or mic off.
        localStream?.getTracks().forEach((track) => track.stop());

        // Get the steam only if the user wants to show video or enable audio.
        // This avoids unable to get User Media due to both audio and video being false.
        let stream: MediaStream = new MediaStream;
        if (showMe || listenMe){
          const constraints: MediaStreamConstraints = {
            video: showMe,                  // Request video if showMe is true.
            audio: listenMe,                // Request audio if listenMe is true.
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        }

        if (!showMe && !listenMe) {         // If both showMe and listenMe are false, stop the stream.
          stream.getTracks().forEach((track) => track.stop());
        }
        else if (!showMe && listenMe) {     // If showMe is false and listenMe is true, stop the video track.
          stream.getTracks().forEach((track) => {
            if (track.kind === "video") {
              track.stop();
            }
          });
        } else if (showMe && !listenMe) {   // If showMe is true and listenMe is false, stop the audio track.
          stream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
              track.stop();
            }
          });
        }

        // Update the local stream and video element.
        if (!showMe && !listenMe) {         // If both showMe and listenMe are false, stop the stream.
          setLocalStream(null);
        } else {                            // If both showMe and listenMe are true, update the local stream.
          setLocalStream(stream);
        }

        // Update the video element.
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) { // If there is an error, set the error message.
        setError("Unable to access media devices. Please check permissions.");
        console.error(err);
      }
    };

    // Get user media.
    getUserMedia();

    // Cleanup: Stop all tracks on component unmount or when dependencies change.
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [showMe, listenMe]);

  useEffect(()=>{
    setVideoID(getYouTubeVideoId(vdurl??"")??"");
    if (peer.dataChannel && peer.dataChannel.readyState == "open") {
      peer.dataChannel.send(JSON.stringify({type: "videoLink", content: video}));
    }
  }, [video]);

  // Handle video URL submission.
  const handleURLSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (remoteSocketID) {
      setVideo(vdurl);
      setFileExists(false)
    } else {
      alert("Please wait for other user to join!");
    }
  }

  // Toggle video.
  const toggleMyVideo = () => {
    setShowMe(!showMe);
  }

  // Toggle audio.
  const toggleMyAudio = () => {
    setListenMe(!listenMe);
  }

  // Inform the joining of new user and emit an accept event.
  const handleUserJoined = useCallback((data: any) => {
    if (socket && data.id !== socket.id) {
      console.log(`User ${data.username} with ${data.id} joined!`);
      setRemoteSocketID(data.id);
      setRemoteUsername(data.username);
      socket.emit("user:accepted", { username, to: data.id, id: socket.id, room: meetid });
    }
  }, [socket, setRemoteSocketID, setRemoteUsername, meetid])

  // Inform of an existing user, set remote socket ID and username and emit an WebRTC offer.
  const handleUserAccepted = useCallback((data: any) => {
    if (socket && data.id !== socket.id) {
      console.log(`User ${data.username} with ${data.id} is already here!`);
      setRemoteSocketID(data.id);
      setRemoteUsername(data.username);
      peer.getOffer().then((offer) => {
        socket.emit("receive:offer", {room: meetid, id: socket.id, offer});
      });
    }
  }, [socket, setRemoteSocketID, setRemoteUsername, peer, meetid]);

  // Handle WebRTC offer and emit an WebRTC answer.
  const handleOfferReceive = useCallback((data: any) => {
    if (socket) {
      if (data.id !== socket.id) {
        peer.getAnswer(data.offer).then((ans) => {
          socket.emit("receive:answer", {room: meetid, id: socket.id, ans});
        })
        console.log("Sent answer to complete WebRTC Handshake!");
      }
    }
  }, [socket, peer, meetid]);

  // Handle WebRTC answer.
  const handleAnswerReceive = useCallback((data: any) => {
    if (socket) {
      if (data.id !== socket.id && peer.peer) {
        peer.peer.setRemoteDescription(data.ans);
        console.log("Received answer to complete WebRTC Handshake!");
      }
    }
  }, [socket, peer, meetid]);

  const handleReceivedNegotiation = useCallback((data: any)=> {
    if (socket && socket.id !== data.from) {
      peer.getAnswer(data.data.offer).then((ans) => {
        socket.emit("negotiation:complete", {to: data.from, ans});
      })
    }
  }, []);

  const handleNegotiationComplete = useCallback((data: any) => {
    if (socket && peer.peer) {
      peer.peer.setRemoteDescription(data.ans);
      if (!peer.dataChannel) {
        peer.dataChannel = peer.peer?.createDataChannel("messages")??null;
      }
    }
  }, []);

  const handleRemoteUserLeft = useCallback((data: any) => {
    sessionStorage.setItem("message", `Meeting ended! ${data.username} left the meeting!`);
    window.location.href = `/lobby/join?roomid=${meetid}`;
  }, [socket]);

  // Handle socket events.
  useEffect(() => {
    if (socket) {
      socket.on('user:joined', handleUserJoined);
      socket.on('user:here', handleUserAccepted);
      socket.on('receive:offer', handleOfferReceive);
      socket.on('receive:answer', handleAnswerReceive);
      socket.on('negotiated', handleReceivedNegotiation);
      socket.on('negotiation:complete', handleNegotiationComplete);
      socket.on('user:left', handleRemoteUserLeft);
      return () => {
        socket.off('user:joined', handleUserJoined);
        socket.off('user:here', handleUserAccepted);
        socket.off('receive:offer', handleOfferReceive);
        socket.off('receive:answer', handleAnswerReceive);
        socket.off('negotiated', handleReceivedNegotiation);
        socket.off('negotiation:complete', handleNegotiationComplete);
        socket.off('user:left', handleRemoteUserLeft);
      }
    }
  }, [socket, handleUserJoined, handleUserAccepted, handleOfferReceive, handleAnswerReceive, handleReceivedNegotiation, handleNegotiationComplete, handleRemoteUserLeft]);

  useEffect(() => {
    sendStreams();
  }, [localStream]);

  // Handle remote stream.
  useEffect(() => {

    // Confirm if the successful peer connection exists.
    if (peer.peer) {

      // Create a reference to the event handler function
      const handleTrack = async (ev: RTCTrackEvent) => {
        const streams = ev.streams;
        // If track is of type file, set the remote stream as the file stream.
        if (receiveType === 'videoFile') {
          setRemoteFileStream(streams[0]);
        } else {    // Else set the remote stream as the video stream.
          // If tracks exists then set the tracks else set the RemoteStream as null.
          if (streams[0].getTracks().length > 0) {
            setRemoteStream(streams[0]);
          } else {
            setRemoteStream(null);
          }

          // If video track exists then set the RemoteVideoExist as true else false.
          setRemoteVideoExist(streams[0].getVideoTracks().length > 0);
        }
      };

      // Add the event listener
      peer.peer.addEventListener("track", handleTrack);

      // Cleanup function
      return () => {
        if (peer.peer) {
          peer.peer.removeEventListener("track", handleTrack);
        }
      };
    }
  }, []);

  // Function to take percentage of seek, convert to seconds,
  // and set the seconds to the remote file stream current time value
  const handleRemoteFilePeek = (seekFrac: number) => {
    if (fileVideoRef.current) {
      fileVideoRef.current.currentTime = (seekFrac) * fileVideoRef.current.duration;
    }
  };

  useEffect(() => {
    const handleDataChannelMessage = (e: MessageEvent) => {
      const message = JSON.parse(e.data);
      if (message.type === "mediaStatus" && message.content === "progress") {
        setVideoProgress(message.progress);
        setPlayedSecs(message.progressSec);
      } else if (message.type === "mediaStatus" && message.content === "duration") {
        console.log("Changed total duration in DC receiver!");
        setTotalDuration(message.duration);
      } else if (message.type === "mediaStatus" && message.content === "stopped") {
        setRemoteStream(null);
        setRemoteVideoExist(false);
      } else if (message.type === "videoLink") {
        if (message.content == null || message.content == "") {
          setVdurl(null);
          setVideo(null);
          setRemoteBuffering(false);
          setRemoteNextBuffering(false);
        } else {
          clearInterval(interval);
          interval = undefined;
          setFileUrl(null);
          setRemoteFileStream(null);
          setFileExists(false);
          setVdurl(message.content);
          setVideo(message.content);
        }
      } else if (message.type === "videoCtrl" && message.content === "pause") {
        setPlayVideo(false);
      } else if (message.type === "videoCtrl" && message.content === "play") {
        setPlayVideo(true);
      } else if (message.type === "videoCtrl" && message.content === "buffer") {
        if (localBuffering){
          setRemoteNextBuffering(true);
        } else {
          setRemoteBuffering(true);
        }
      } else if (message.type === "videoCtrl" && message.content === "bufferEnd") {
        if (localBuffering){
          setRemoteNextBuffering(false);
        } else {
          setRemoteBuffering(false);
        }
      } else if (message.type === "videoCtrl" && message.content === "loop") {
        setLoop(message.enable);
      } else if (message.type === "seekTo") {
        if (message.video === "file")
          handleRemoteFilePeek(message.content);
        else if (message.video === "yt")
          watchRef?.current.seekTo(message.content);
      } else if (message.type === "mediaReceiving") {
        receiveType = message.content;
        if (receiveType === "videoFile") {
          if (interval) {
            clearInterval(interval);
            interval = undefined;
          }
          setFileExists(true);
          setFileUrl(null);
        }
      }
    };

    const handleDataChannel = (ev: RTCDataChannelEvent) => {
      console.log("Channel created at receiver! Hence channel created here!");
      const receiveChannel = ev.channel;
      if (!peer.dataChannel) {
        peer.dataChannel = peer.peer?.createDataChannel("messages") ?? null;
      }
      receiveChannel.addEventListener("message", handleDataChannelMessage);
    };

    if (peer.peer) {
      peer.peer.addEventListener("datachannel", handleDataChannel);
    }

    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("datachannel", handleDataChannel);
        if (peer.dataChannel) {
          peer.dataChannel.removeEventListener("message", handleDataChannelMessage);
        }
      }
    };
  }, [localBuffering, watchRef]);

  const handleNegotiationNeeded = useCallback(async () => {
    if (socket) {
      peer.getOffer().then((offer) => {
          console.log("Negotiation needed for successful WebRTC Handshake!", remoteSocketID);
          socket.emit("negotiate", {to: remoteSocketID, offer});
      })
    }
  }, [socket, remoteSocketID]);

  useEffect(() => {
      peer.peer?.addEventListener("negotiationneeded", handleNegotiationNeeded);
      return () => {
        peer.peer?.removeEventListener("negotiationneeded", handleNegotiationNeeded);
      }
  }, [handleNegotiationNeeded]);

  useEffect(()=> {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (fileExists) {
      if (playVideo)
        fileVideoRef.current?.play();
      else
        fileVideoRef.current?.pause();
    }
    if (peer.dataChannel && peer.dataChannel.readyState == "open"){
      if (playVideo) {
        peer.dataChannel.send(JSON.stringify({type: "videoCtrl", content: "play"}));
      } else {
        peer.dataChannel.send(JSON.stringify({type: "videoCtrl", content: "pause"}));
      }
    }
  }, [playVideo]);

  const handlePlayPause = (enable: boolean) => {
    if (!remoteBuffering)
      setPlayVideo(enable);
  }

  const handleForcePlay = (enable: boolean) => {
    handlePlayPause(enable);
    setRemoteBuffering(false);
  }

  useEffect(() => {
    setRemoteBuffering(remoteNextBuffering)
  }, [localBuffering]);

  const handleBuffer = (buffering: boolean) => {
    setLocalBuffering(buffering);
    if (peer.dataChannel && peer.dataChannel.readyState == "open"){
      if (buffering) {
        peer.dataChannel.send(JSON.stringify({type: "videoCtrl", content: "buffer"}));
      } else {
        peer.dataChannel.send(JSON.stringify({type: "videoCtrl", content: "bufferEnd"}));
      }
    }
  }

  const handleReady = () => {
    const iframe = watchRef.current
      ?.getInternalPlayer()
      ?.getIframe?.();
    if (iframe) {
      iframe.setAttribute('tabindex', '-1');
      iframe.style.pointerEvents = 'none';
    }
  };

  const getPlayedSecs = useCallback((playedSecs: number) => {
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(playedSecs / 3600);
    const minutes = Math.floor((playedSecs % 3600) / 60);
    const seconds = Math.floor(playedSecs % 60);

    // Format with leading zeros
    const strMinutes = String(minutes).padStart(2, "0");
    const strSeconds = String(seconds).padStart(2, "0");

    // Include hours only if > 0 and pad hours
    if (hours > 0) {
      const strHours = String(hours).padStart(2, "0");
      setPlayedSecs(`${strHours}:${strMinutes}:${strSeconds}`);

      if (fileExists) {
        const progressPer: number = (fileVideoRef.current?.currentTime??0) * 100 / (fileVideoRef.current?.duration??0);
        peer.dataChannel?.send(JSON.stringify({type: "mediaStatus", content: "progress", progressSec: `${strHours}:${strMinutes}:${strSeconds}`, progress: progressPer}));
      }
    } else {
      // Combine into HH:MM:SS or MM:SS format
      setPlayedSecs(`${strMinutes}:${strSeconds}`);

      if (fileExists){
        const progressPer: number = (fileVideoRef.current?.currentTime??0) * 100 / (fileVideoRef.current?.duration??0);
        peer.dataChannel?.send(JSON.stringify({type: "mediaStatus", content: "progress", progressSec: `${strMinutes}:${strSeconds}`, progress: progressPer}));
      }
    }
  }, [setPlayedSecs, fileExists]);


  const handleDuration = useCallback((duration: number) => {
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    // Format with leading zeros
    const strMinutes = String(minutes).padStart(2, "0");
    const strSeconds = String(seconds).padStart(2, "0");

    // Include hours only if > 0 and pad hours
    if (hours > 0) {
      const strHours = String(hours).padStart(2, "0");
      setTotalDuration(`${strHours}:${strMinutes}:${strSeconds}`);

      if (fileExists)
        peer.dataChannel?.send(JSON.stringify({type: "mediaStatus", content: "duration", duration: `${strHours}:${strMinutes}:${strSeconds}`}));
    } else {
      // Combine into HH:MM:SS or MM:SS format
      setTotalDuration(`${strMinutes}:${strSeconds}`);

      if (fileExists)
        peer.dataChannel?.send(JSON.stringify({type: "mediaStatus", content: "duration", duration: `${strMinutes}:${strSeconds}`}));
    }
  }, [setTotalDuration, fileExists]);


  const handleProgress = (data: any) => {
    const progress = parseInt(String(data.played * 100), 10);
    const loaded = parseInt(String(data.loaded * 100), 10);
    setVideoLoaded(loaded);
    setVideoProgress(progress);
    getPlayedSecs(data.playedSeconds);
  }

  const getYouTubeVideoId = (url: string): string | null => {
    const regex =
      /[?&]v=([a-zA-Z0-9_-]{11})/
    const match = regex.exec(url);
    return match ? match[1] : null;
  };

  // Handle copying of the meeting ID to the clipboard using copy button.
  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Copy the meet ID to the clipboard.
    if (meetid) {
      navigator.clipboard.writeText(meetid);
    }

    // Change the copy button text to "copied" for 3 seconds.
    if (copyRef.current){
      copyRef.current.innerText = "Meet ID copied to clipboard!";
    }
    setTimeout(() => {
      if (copyRef.current){
        copyRef.current.innerText = "Click to copy Meet ID!";
      }
    }, 3000)
  }

  useEffect(() => {
    if (fileExists) {
      if (fileVideoRef.current)
        fileVideoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleVolumeChange = ({target}: {target: HTMLInputElement}) => {
    setVolume(Number(target.value));
  };

  const sendNewPosition = (value: number) => {
    if (peer.dataChannel && peer.dataChannel.readyState == "open"){
      if (fileExists)
        peer.dataChannel.send(JSON.stringify({type: "seekTo", video: "file", content: value}));
      else
        peer.dataChannel.send(JSON.stringify({type: "seekTo", video: "yt", content: value}));
    }
  }

  const getTimeSeconds = (progress: number): number => {
    const videoDuration: number = fileVideoRef.current?.duration??0;
    const seekto: number = progress / 100 * videoDuration;
    return seekto;
  }

  const handleSeekVideo = (event: any) => {
    if (fileExists) {
      if (fileUrl && fileVideoRef.current)
        fileVideoRef.current.currentTime = getTimeSeconds(event.target.value);
      else if (remoteFileStream && fileVideoRef.current)
        sendNewPosition(event.target.value / 100);
    } else {
      watchRef?.current.seekTo(event.target.value / 100);
      sendNewPosition(event.target.value / 100);
    }
  }

  const endCall = () => {
    window.location.href = '/callend';
  }

  const handleLoopChange = () => {
    setLoop(!loop);
    if (peer.dataChannel && peer.dataChannel.readyState == "open"){
      peer.dataChannel.send(JSON.stringify({type: "videoCtrl", content: "loop", enable: !loop}));
    }
  }

  const handlePlayFileStream = () => {
    peer.dataChannel?.send(JSON.stringify({type: "mediaReceiving", content: "videoFile"}));
    setTimeout(() => {
      fileStream = (fileVideoRef.current as any).captureStream();
      fileStream?.getTracks().forEach((track) => {
        peer.peer?.addTrack(track, fileStream);
      });
    }, 100);
  }

  function handleMetaDataLoad() {
    handleDuration(fileVideoRef.current?.duration??0);
    interval = setInterval(() => {
      if (playVideo) {
        getPlayedSecs(fileVideoRef?.current?.currentTime??0);
        const progressPer: number = (fileVideoRef.current?.currentTime??0) * 100 / (fileVideoRef.current?.duration??0);
        setVideoProgress(progressPer);
      }
    }, 1000);
    fileVideoRef.current?.removeEventListener("loadedmetadata", handleMetaDataLoad);
  }

  useEffect(() => {
    if (fileUrl && fileVideoRef.current) {
      fileVideoRef.current.srcObject = null;
      fileVideoRef.current.src = fileUrl??"";
      fileVideoRef.current.addEventListener("loadedmetadata", handleMetaDataLoad);
      setPlayVideo(true);
      fileVideoRef.current.play().then(() => {
        handlePlayFileStream();
      });
    }
  }, [fileUrl]);

  useEffect(() => {
    if (remoteFileStream && fileVideoRef.current) {
      fileVideoRef.current.src = "";
      fileVideoRef.current.srcObject = remoteFileStream;
    }
  }, [remoteFileStream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setVideo(null);
    setVdurl(null);
    const file = event.target.files?.[0];
    if (file) {
      setFileExists(true);
      if (remoteFileStream)
        setRemoteFileStream(null);
      const fileURL = URL.createObjectURL(file);
      setFileUrl(fileURL);
    }
    event.target.value = "";
  };

  const handleFileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (remoteUsername) {
      fileRef.current?.click();
    }
    else
     alert("Please wait for other user to join!");
  }

  useEffect(() => {
    if (!fileExists && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }, [fileExists]);

  useEffect(() => {
    console.log("Total duration changed: ", totalDuration);
  }, [totalDuration]);

  return (
    <div className='w-full h-full bg-black/50 flex flex-col items-center'>
      <div id='fullcontainer' className='w-full p-12 flex flex-col items-center'>
        <div id='mainbar' className='w-full md:h-[50px] bg-zinc-900 flex flex-col-reverse md:flex-row items-center justify-between'>
          <form action="submit" onSubmit={(e) => handleURLSubmit(e)} className="h-full w-full md:w-1/3 bg-zinc-700 flex items-center justify-between border-2 border-zinc-700">
            <input type="url" onChange={(e) => setVdurl(e.target.value)} placeholder="Enter YouTube URL..." value={vdurl??""} className="h-full w-full p-4 bg-zinc-700"/>
            <button type="submit" className="h-full p-4 border-none hover:border-none transition-all">Watch</button>
          </form>
          <div className="flex justify-between gap-8 w-full md:w-auto">
            <h1 className="text-[3rem] font-black text-center">
              <span className=" bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">YooTwo</span>
            </h1>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileRef}
            />
            <button type="button" onClick={handleFileClick} className="h-full p-4 border-2 border-zinc-700 hover:border-zinc-300 hover:bg-zinc-300 hover:text-zinc-800 transition-all">Share Local file</button>
          </div>
        </div>
        <div id='callwindow' className='w-full h-max bg-zinc-900 mt-4 flex flex-col md:flex-row gap-2'>
          <div className="w-full md:w-[65%] aspect-video bg-zinc-700">
              <div className="h-full w-full relative">
                {video &&
                  <ReactPlayer
                    ref={watchRef}
                    url={video}
                    width="100%"
                    height="100%"
                    light={false}
                    controls={false}
                    muted={muted}
                    volume={volume/100}
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
                    onProgress={(data: any) => handleProgress(data)}
                    onDuration={(data: any) => handleDuration(data)}
                    onEnded={() => handlePlayPause(false)}
                  />
              }
              { fileExists &&
                <div className="w-full h-full bg-black flex justify-center items-center">
                  <video
                    ref={fileVideoRef}
                    autoPlay={playVideo}
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    muted={muted}
                    loop={loop}
                    className="w-full"
                  />
                </div>
              }
              {(video || fileExists) &&
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
              }
            </div>
          </div>
          <div className="w-full md:w-[35%] min-h-96 md:min-h-0 max-h-[550px] flex flex-row md:flex-col gap-2">
            <div className={`${showMe ? "bg-black relative" : "bg-zinc-700 flex items-center justify-center"} w-full aspect-[9/16] sm:aspect-[16/9] sm:h-1/2`}>
              {showMe &&
               <video
                  className="w-full h-full bg-red"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  controls={false}
                />
              }
              {username && <p className={`${showMe ? "absolute top-0 left-0 bg-black" : "relative h-max"} text-zinc-300 text-left px-2 font-bold`}>{username}</p>}
            </div>
            <div className={`${remoteVideoExist ? "bg-black relative" : "bg-zinc-700 flex items-center justify-center"} w-full aspect-[9/16] sm:aspect-[16/9] sm:h-1/2`}>
              {remoteUsername && <p className={`${remoteVideoExist ? "absolute top-0 left-0 bg-black" : "relative h-max"} text-zinc-300 text-left px-2 font-bold`}>{remoteUsername}</p>}
              {!remoteUsername && <button ref={copyRef} onClick={handleCopy} className="border-none outline-none font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent hover:text-zinc-300">Click to copy Meet ID!</button>}
              {remoteStream &&
               <video
                  className={`${remoteVideoExist ? "w-full" : "w-0"} h-full bg-red`}
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  controls={false}
                />
              }
            </div>
          </div>
        </div>
        <div id='calloptions' className='w-full h-[100px] bg-zinc-900 mt-4 flex justify-center items-center gap-8'>
          <button type="button" className={`${showMe ? "bg-zinc-300" : "bg-red-700"} relative transition-al w-[50px] h-[50px] overflow-hidden flex justify-center items-center`} onClick={toggleMyVideo}>
            {!showMe && <span className="font-8xl absolute w-2 rotate-45 h-3/4 bg-black"></span>}
            <img width={25} height={25} src="../cam.png" alt="Stop Video" />
          </button>
          <button type="button" className={`${listenMe ? "bg-zinc-300" : "bg-red-700"} relative transition-all w-[50px] h-[50px] overflow-hidden flex justify-center items-center`} onClick={toggleMyAudio}>
            {!listenMe && <span className="font-8xl absolute w-2 rotate-45 h-3/4 bg-black"></span>}
            <img width={25} height={25} src="../mic.png" alt="Mute" />
          </button>
          <button type="button"  className="bg-zinc-300 w-[50px] h-[50px] overflow-hidden flex justify-center items-center" onClick={endCall}>
            <img width={30} height={30} src="../end.png" alt="End Call" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;
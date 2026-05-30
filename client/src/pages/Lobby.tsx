import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { useMeeting } from "../context/MeetingContext";
import { v4 as uuidv4 } from "uuid";
import { RoomData, JoinRoomError } from "../types";

const setSessionValues = (name: string, meetid: string): void => {
  if (meetid) {
    sessionStorage.setItem("username", name);
    sessionStorage.setItem("meetid", meetid);
  }
};

const getSessionValues = () => ({
  userName: sessionStorage.getItem("username"),
  meetID: sessionStorage.getItem("meetid"),
  message: sessionStorage.getItem("message"),
});

function Lobby(): JSX.Element {
  const copyRef = useRef<HTMLButtonElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const { search } = useLocation();
  const socket = useSocket();
  const navigate = useNavigate();
  const { meetid, username, setMeetid, setUsername, setSocketID } =
    useMeeting();
  const { meetType } = useParams<{ meetType: string }>();

  const [newmeet, setNewmeet] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Sync mode with URL on initial load
  useEffect(() => {
    if (meetType === "join") {
      setNewmeet(false);
    } else {
      setNewmeet(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Meeting ID Generation / Clearing based on toggle
  useEffect(() => {
    if (newmeet) {
      setMeetid(uuidv4().slice(0, 8));
    } else {
      const query = new URLSearchParams(search);
      const roomid = query.get("roomid");
      if (roomid) setMeetid(roomid);
      else setMeetid("");
    }
  }, [newmeet, search, setMeetid]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => prev + 1);
      }, 50);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (progress >= 100) {
      setMsg(null);
      setRunning(false);
      setProgress(0);
    }
  }, [progress]);

  const handleProgressClose = () => setProgress(100);

  useEffect(() => {
    const data = getSessionValues();
    if (data.userName) setUsername(data.userName);
    if (data.message) {
      setMsg(data.message);
      sessionStorage.removeItem("message");
      setRunning(true);
    }
  }, [setUsername]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (socket) socket.emit("room:join", { username, meetid, newmeet });
    },
    [username, meetid, newmeet, socket],
  );

  const handleJoinRoom = useCallback(
    (data: RoomData) => {
      navigate(`/room/${data.meetid}`);
    },
    [navigate],
  );

  const handleUserJoin = useCallback(
    (data: RoomData) => {
      setSessionValues(data.username, data.meetid);
      setSocketID(data.id);
      setUsername(data.username);
      setMeetid(data.meetid);
    },
    [setSocketID, setUsername, setMeetid],
  );

  const handleRoomJoinError = useCallback(({ message }: JoinRoomError) => {
    setMsg(message);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("user:joined", handleUserJoin);
      socket.on("room:join", handleJoinRoom);
      socket.on("error:meet", handleRoomJoinError);
      return () => {
        socket.off("user:joined", handleUserJoin);
        socket.off("room:join", handleJoinRoom);
        socket.off("error:meet", handleRoomJoinError);
      };
    }
  }, [socket, handleJoinRoom, handleUserJoin, handleRoomJoinError]);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (meetid) navigator.clipboard.writeText(meetid.toUpperCase());
    if (copyRef.current) copyRef.current.innerText = "[ Copied! ]";
    setTimeout(() => {
      if (copyRef.current) copyRef.current.innerText = "[ Copy ID ]";
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] font-['Syne',sans-serif] relative overflow-hidden grid grid-rows-[auto_1fr_auto]">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(240,237,232,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(240,237,232,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Toast */}
      {running && msg && (
        <div className="fixed top-20 right-6 border-[0.5px] border-[#f0ede8]/[0.18] bg-[#0f0f0f] w-[300px] z-50 overflow-hidden">
          <div className="p-3.5 flex justify-between items-center gap-3">
            <span className="text-[13px] text-[#f0ede8] font-['Syne',sans-serif] leading-[1.5]">
              {msg}
            </span>
            <button
              className="bg-transparent border-none cursor-pointer text-[#f0ede8]/35 p-0 shrink-0 transition-colors duration-150 flex hover:text-[#f0ede8]/80"
              onClick={handleProgressClose}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            className="h-[1.5px] bg-[#f0ede8]/60 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between py-7 px-6 md:px-12 border-b-[0.5px] border-[#f0ede8]/10">
        <Link
          to="/"
          className="font-['DM_Serif_Display',serif] text-3xl md:text-6xl font-black tracking-[-0.5px] text-[#f0ede8] no-underline transition-opacity duration-150 hover:opacity-70"
        >
          YooTwo
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-['DM_Mono',monospace] text-[11px] font-light tracking-[0.15em] uppercase text-[#f0ede8]/35 no-underline transition-colors duration-150 hover:text-[#f0ede8]/70 group"
        >
          <svg
            className="transition-transform duration-150 group-hover:-translate-x-[3px]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back to home
        </Link>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex items-center justify-center py-[60px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_480px] gap-0 w-full max-w-[480px] lg:max-w-[1040px] lg:min-h-[480px]">
          
          {/* Left — Big Toggle Buttons */}
          <div className="flex flex-col justify-center gap-8 lg:gap-16 pr-0 lg:pr-20 mb-16 lg:mb-0">
            <button
              type="button"
              onClick={() => setNewmeet(true)}
              className={`text-left group relative transition-all duration-500 ease-out flex flex-col ${
                newmeet
                  ? "opacity-100 lg:translate-x-4"
                  : "opacity-25 hover:opacity-60 lg:hover:translate-x-2"
              }`}
            >
              <span className={`font-['DM_Mono',monospace] text-[10px] uppercase mb-2 md:mb-4 tracking-[0.2em] transition-all duration-500 ${newmeet ? "text-[#f0ede8]/60" : "text-[#f0ede8]/40"}`}>
                01 — Host a session
              </span>
              <h1 className="font-['DM_Serif_Display',serif] text-[clamp(48px,5vw,84px)] leading-none tracking-[-2px] text-[#f0ede8] m-0">
                Create Room.
              </h1>
            </button>

            <button
              type="button"
              onClick={() => setNewmeet(false)}
              className={`text-left group relative transition-all duration-500 ease-out flex flex-col ${
                !newmeet
                  ? "opacity-100 lg:translate-x-4"
                  : "opacity-25 hover:opacity-60 lg:hover:translate-x-2"
              }`}
            >
              <span className={`font-['DM_Mono',monospace] text-[10px] uppercase mb-2 md:mb-4 tracking-[0.2em] transition-all duration-500 ${!newmeet ? "text-[#f0ede8]/60" : "text-[#f0ede8]/40"}`}>
                02 — Join a session
              </span>
              <h1 className="font-['DM_Serif_Display',serif] text-[clamp(48px,5vw,84px)] leading-none tracking-[-2px] text-[#f0ede8] m-0">
                Join Room.
              </h1>
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[0.5px] self-stretch bg-[#f0ede8]/10" />

          {/* Right — form */}
          <div className="flex flex-col justify-center gap-8 px-6 py-10 lg:px-16 lg:py-16 border border-neutral-600/50 relative bg-[#0a0a0a]">
            {/* Subtle glow/shadow for depth */}
            <div className="absolute inset-0 z-[-1] shadow-[0_0_60px_-15px_rgba(240,237,232,0.05)] pointer-events-none" />

            <div className="pb-7 border-b-[0.5px] border-[#f0ede8]/10">
              
              <h2 className="font-['Syne',sans-serif] font-black text-[38px] leading-[1.05] tracking-[-1px] text-[#f0ede8] m-0">
                {newmeet ? "Start." : "Enter."}
              </h2>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="lb-name"
                  className="font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] uppercase text-[#f0ede8]/40"
                >
                  Display Name
                </label>
                <input
                  id="lb-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  autoComplete="off"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username ?? ""}
                  className="w-full bg-transparent border-[0.5px] border-[#f0ede8]/15 px-4 py-3.5 text-[#f0ede8] font-['Syne',sans-serif] text-[15px] outline-none transition-colors duration-150 placeholder-[#f0ede8]/25 focus:border-[#f0ede8]/50"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="lb-code"
                    className="font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] uppercase text-[#f0ede8]/40"
                  >
                    Meeting ID
                  </label>
                  {newmeet && (
                    <button
                      ref={copyRef}
                      onClick={handleCopy}
                      type="button"
                      className="font-['DM_Mono',monospace] text-[10px] tracking-[0.1em] uppercase text-[#f0ede8]/50 bg-transparent border-none cursor-pointer p-0 transition-colors duration-150 hover:text-[#f0ede8]"
                    >
                      [ Copy ID ]
                    </button>
                  )}
                </div>
                <input
                  id="lb-code"
                  type="text"
                  value={meetid ?? ""}
                  onChange={(e) => setMeetid(e.target.value)}
                  placeholder="Enter room ID"
                  required
                  disabled={newmeet}
                  className={`w-full bg-transparent border-[0.5px] border-[#f0ede8]/15 px-4 py-3.5 text-[#f0ede8] text-[15px] outline-none transition-colors duration-150 placeholder-[#f0ede8]/25 focus:border-[#f0ede8]/50 uppercase tracking-[0.05em] disabled:opacity-45 disabled:cursor-not-allowed disabled:bg-[#f0ede8]/[0.03]`}
                />
              </div>

              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center font-['Syne',sans-serif] text-[13px] font-bold tracking-[0.08em] uppercase text-[#0a0a0a] bg-[#f0ede8] border-[0.5px] border-transparent py-4 px-6 cursor-pointer transition-colors duration-150 w-full hover:bg-white"
              >
                {newmeet ? "Launch Session" : "Join Session"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 md:py-5 md:px-12 border-t-[0.5px] border-[#f0ede8]/[0.08] flex justify-between items-center">
        <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.06em] text-[#f0ede8]/[0.18]">
          &copy; {new Date().getFullYear()} YooTwo
        </span>
        <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.06em] text-[#f0ede8]/[0.18]">
          Built by imvbhargav
        </span>
      </footer>
    </div>
  );
}

export default Lobby;
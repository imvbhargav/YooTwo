import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from "../context/SocketProvider";
import { useMeeting } from '../context/MeetProvider';
import { v4 as uuidv4 } from 'uuid';

let interval: any = undefined;

// Types for the RoomData object.
interface RoomData {
  meetid: string,
  id: string,
  username: string,
}

// Set username, meet ID and socket ID values in session storage.
function setSessionValues(name: string, meetid: string) {
  if (meetid) {
    sessionStorage.setItem("username", name);
    sessionStorage.setItem("meetid", meetid);
  }
};

// Set username, meet ID and socket ID values in session storage.
function getSessionValues(): {userName: string | null, meetID: string | null, message: string | null} {
  const userName = sessionStorage.getItem("username");
  const meetID = sessionStorage.getItem("meetid");
  const message = sessionStorage.getItem("message")??null;
  return {userName, meetID, message};
};

function Lobby() {

  // States for username, meet ID and socket ID.
  const copyRef = useRef<HTMLButtonElement | null>(null);

  // Use the useLocation hook to get the URL search parameters.
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  // Use the useSocket hook to get the socket instance.
  const socket = useSocket();

  // Use the useNavigate hook to navigate to other pages.
  const navigate = useNavigate();

  // Use the useMeeting hook to get the meeting context.
  const { meetid, username, setMeetid, setUsername, setSocketID } = useMeeting();

  // Check if the user trying to join or create a new meet.
  const  { meetType } = useParams<{ meetType: string }>();

  // States to check if the user is joining or creating a new meet.
  const [ newmeet, setNewmeet ] = useState<boolean>(false);
  const [ msg, setMsg ] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Use the useQuery hook to get the URL search parameters.
  const query = useQuery();

  useEffect(() => {
    if (running) {
      interval = setInterval(() => {
        setProgress((prev) => prev + 1);
      }, 50);
    } else {
      clearInterval(interval);
    }
  }, [running]);

  useEffect(() => {
    if (progress >= 100) {
      setMsg(null);
      setRunning(false);
      clearInterval(interval);
      setProgress(0);
    }
  }, [progress]);

  const handleProgressClose = () => {
    setProgress(100);
  }

  // Set username and meetid if the value exists in session info.
  useEffect(() => {
    const data = getSessionValues();
    if (data.userName) {
      setUsername(data.userName);
    }
    if (data.message) {
      setMsg(data.message);
      sessionStorage.removeItem("message");
      setRunning(true);
    }
  }, []);

  // Handke form submission.
  const handleSubmit = useCallback( (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (socket) {
      socket.emit("room:join", {username, meetid});
    }
  }, [username, meetid])

  // Once the user joins a room, navigate to the room page.
  const handleJoinRoom = useCallback((data: RoomData) => {
    const { meetid } = data;
    navigate(`/room/${meetid}`)
  }, [navigate]);

  // Once the user joins a room, set the username, meet ID and socket ID.
  const handleUserJoin = useCallback((data: RoomData) => {
    setSessionValues(data.username, data.meetid);
    setSocketID(data.id);
    setUsername(data.username);
    setMeetid(data.meetid);
  }, [meetid, setSocketID, setUsername]);

  const handleRoomJoinError = ({error, message}: {error: string, message: string}) => {
    console.error(error);
    setMsg(message);
    setRunning(true);
  }

  // Handle socket events.
  useEffect(() => {
    if (socket) {
      socket.on("user:joined", handleUserJoin);
      socket.on("room:join", handleJoinRoom);
      socket.on("error:full", handleRoomJoinError);
      return () => {
        socket.off("user:joined", handleUserJoin);
        socket.off("room:join", handleJoinRoom);
      };
    };
  }, [socket, handleJoinRoom]);

  // Generate a new unique meet ID.
  const generateNewMeetID = () => {
    setMeetid(uuidv4().slice(0, 8));
  };

  // If the user is creating a new meet, generate a new unique meet ID.
  useEffect(() => {
    if (newmeet) {
      generateNewMeetID();
    }
  }, [newmeet]);

  // Handle copying of the meeting ID to the clipboard using copy button.
  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Copy the meet ID to the clipboard.
    if (meetid) {
      navigator.clipboard.writeText(meetid);
    }

    // Change the copy button text to "copied" for 3 seconds.
    if (copyRef.current){
      copyRef.current.innerText = "copied";
    }
    setTimeout(() => {
      if (copyRef.current){
        copyRef.current.innerText = "copy";
      }
    }, 3000)
  }

  // Set the meet ID if the user is joining a meet.
  useEffect(() => {

    // If the user is joining a meet handle join meet states.
    if (meetType == "join") {
      setNewmeet(false);
      const roomid = query.get('roomid');

      // If the user is joining a meet, set the meet ID.
      if (roomid) {
        setMeetid(roomid);
      }
    } else { // If the user is creating a new meet, set the newmeet state to true.
      setNewmeet(true);
    }
  }, [meetType]);

  return (
    <div>
      {running &&
        <div className="border-2 border-violet-500 absolute right-6 sm:right-2 top-20 sm:top-2 py-2">
          <span style={{width: progress+"%"}} className={`absolute bg-violet-500 -z-10 h-full top-0 left-0`}></span>
          <span className="px-4 py-2">{msg}</span>
          <button className="px-4 py-2 text-red-700 font-black" onClick={handleProgressClose}>X</button>
        </div>
      }
      <h1 className="text-[3rem] font-black text-left">
        <span className=" bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">YooTwo</span>
      </h1>
      <div className='flex justify-center align-center min-h-screen md:px-56 lg:px-0'>
        <div className="w-full min-h-screen flex justify-center items-center">
          <div className="shadw w-[95%] lg:w-1/2 bg-zinc-800 px-4 xl:px-32 py-16 border-zinc-300">
            <h1 className="text-6xl md:text-8xl text-center pb-6 border-b-2 border-zinc-700"> {newmeet ? "Create new room!" : "Join room!"} </h1>
            <form action="submit" className="p-0 sm:p-10 mt-8 flex flex-col gap-8" onSubmit={(e) => handleSubmit(e)}>
              <div className="w-full flex flex-col relative">
                <label className="text-black font-black bg-zinc-300 px-10 relative" htmlFor="name">Name <span className="absolute right-5 text-zinc-800">required</span></label>
                <input className="px-10 py-8" id="name" type="name" required placeholder="Enter your name..." autoComplete="off" onChange={(e) => setUsername(e.target.value)} value={username ?? ""}/>
              </div>
              <div className="w-full flex flex-col relative">
                <label className="left-5 text-black font-black bg-zinc-300 px-10" htmlFor="code">Meet ID <span className={`${ !newmeet ? 'inline-block' : 'hidden' } absolute right-5 text-zinc-800`}>required</span><span className={`${newmeet ? 'inline-block' : 'hidden' } absolute right-px text-zinc-800`}> <button ref={copyRef} onClick={(e) => handleCopy(e)} type="button" className="px-4 py-0 mt-px bg-zinc-700 text-zinc-300 hover:bg-zinc-300 hover:text-zinc-700 transition-all">copy</button></span></label>
                <input className="px-10 py-8" id="code" type="name" value={meetid ?? ""} onChange={(e) => setMeetid(e.target.value) } placeholder="Enter the room ID..." required disabled={newmeet} />
              </div>
              <button className="px-10 py-8" id="button" type="submit">{ newmeet ? "Create" : "Join" }</button>
            </form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
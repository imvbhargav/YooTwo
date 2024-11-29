function Home() {
  return (
    <div className='flex justify-center align-center min-h-screen md:px-56 lg:px-0'>
      <div className="sm:max-w-[400px] lg:max-w-max">
        <div className="py-10 flex justify-center">
          <div className="w-full lg:w-1/2 flex flex-col lg:flex-row justify-between items-center">
            <h1 className="text-6xl font-black text-center">
              <span className=" bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">YooTwo</span>
            </h1>
            <div>
              <p className="mb-2 text-center">Start the meeting</p>
              <div className="flex justify-center items-center gap-2">
                <a href="/lobby/new"><button className="px-12 py-5 font-extrabold bg-green-200/10 hover:bg-green-400 hover:text-zinc-800 transition-all duration-200">New</button></a>
                <a href="/lobby/join"><button className="px-12 py-5 font-extrabold bg-blue-200/10 hover:bg-blue-400 hover:text-zinc-800 transition-all duration-200">Join</button></a>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full p-5 text-zinc-300 flex justify-center">
          <p className="w-full lg:w-1/2 text-2xl px-4 lg:px-0 lg:text-4xl"> Through YooTwo you can connect with any one your friends without any concern over your privacy and security, you can connect to just for a video call, watch YouTube videos together, or just share your screen and watch any content you wish together. </p>
        </div>
        <div className="w-full flex justify-center">
          <div className="flex w-full px-5 lg:px-0 lg:w-1/2 justify-between gap-2 mt-8 border-b-2 border-zinc-700 pb-12 flex-col lg:flex-row">
            <div className="bg-pink-300/10 p-5">
              <h1 className="text-4xl border-b-2 border-zinc-700 pb-5"> One-on-One Video Call. </h1>
              <p className="mt-6">Link up with your bestie in a one-on-one video hangout built on the magic of WebRTC! No prying eyes, no shady business—just pure, uninterrupted fun. Create a room, share the invite, and dive into some quality time with your favorite human. No drama, just you, your friend, and the ultimate vibe check. Let the good times stream!</p>
            </div>
            <div className="bg-violet-300/10 p-5">
              <h1 className="text-4xl border-b-2 border-zinc-700 pb-5"> Watch YouTube Together. </h1>
              <p className="mt-6">Grab your popcorn and your favorite person! With YooTwo, you can vibe over your favorite YouTube videos, chat, laugh, and pause the action whenever the tea gets too hot not to spill. One of you pauses, it pauses for both—because true friends sync their streams and their conversations. Ready to turn YouTube into WeTube? Let the fun begin!</p>
            </div>
            <div className="bg-purple-300/10 p-5">
              <h1 className="text-4xl border-b-2 border-zinc-700 pb-5"> Stream your local video files. </h1>
              <p className="mt-6">Not feeling the YouTube vibes? No problem! With YooTwo, you can bring your own blockbuster. Share any video from your system and turn your one-on-one video call into a private screening party. Whether it's a guilty-pleasure rom-com or that weird indie film only you love, now you can enjoy it together—because every video deserves an audience of two!</p>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-full px-5 lg:w-1/2 lg:px-0">
            <h1 className="text-6xl py-10 text-center">Enough nonsense let's just start the meeting</h1>
            <div className="flex justify-between gap-8 items-center pb-12 flex-col lg:flex-row">
              <a href="/lobby/new" className="w-full bg-green-200/10 px-4 lg:px-24 py-10 lg:py-10 text-4xl hover:bg-green-400 hover:border-zinc-300 hover:text-zinc-800 transition-all duration-200"><button className="w-full text-center">Start New Room.</button></a>
              <a href="/lobby/join" className="w-full bg-blue-200/10 px-4 lg:px-24 py-10 lg:py-10 text-4xl hover:bg-blue-400 hover:border-zinc-300 hover:text-zinc-800 transition-all duration-200"><button className="w-full text-center">Join Existing Room.</button></a>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex justify-between w-full lg:w-1/2 px-4 lg:px-0 border-t-2 border-zinc-700 py-10">
            <p className="text-blue-500">&copy; <span className="font-black bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">YooTwo</span> - 2024.</p>
            <p className="text-pink-500 font-black">imvbhargav</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
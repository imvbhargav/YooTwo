import { Link } from "react-router-dom";

function IconVideo(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(240,237,232,0.6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconPlay(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(240,237,232,0.6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconFilm(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(240,237,232,0.6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function Home(): JSX.Element {
  return (
    <div className="bg-[#0a0a0a] text-[#f0ede8] font-['Syne',sans-serif] min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(240,237,232,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(240,237,232,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-5 md:px-10">
        <nav className="flex items-center justify-between gap-10 pt-16">
          <span className="font-['DM_Serif_Display',serif] font-black text-6xl tracking-[-0.5px] text-[#f0ede8] no-underline">
            YooTwo
          </span>
          <div className="w-full h-px bg-neutral-500/25 mt-4"></div>
        </nav>

        <section className="pb-[60px] pt-24 md:pb-[80px] flex flex-col md:grid md:grid-cols-[1fr_380px] gap-9 md:gap-[60px] items-end border-b-[0.5px] border-[#f0ede8]/10">
          <div>
            <div className="font-['DM_Mono',monospace] text-[11px] font-light tracking-[0.2em] uppercase text-[#f0ede8]/40 mb-7 flex items-center gap-3 before:content-[''] before:block before:w-6 before:h-[0.5px] before:bg-[#f0ede8]/30">
              Peer-to-peer · Zero servers · WebRTC
            </div>
            <h1 className="font-['DM_Serif_Display',serif] text-[clamp(52px,7vw,84px)] leading-none tracking-[-2px] text-[#f0ede8] m-0">
              Private calls.
              <br />
              <em className="italic text-[#f0ede8]/45">No compromise.</em>
            </h1>
          </div>
          <div className="pb-2">
            <p className="text-[15px] leading-[1.75] text-[#f0ede8]/55 font-normal mb-9">
              Watch together. Call together. Stream local files together. All
              peer-to-peer — no servers storing your data, no middlemen watching
              the feed.
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <Link
                to="/lobby/new"
                className="inline-flex items-center justify-center font-['Syne',sans-serif] text-[13px] font-bold tracking-[0.08em] uppercase no-underline cursor-pointer transition-all duration-150 ease-out text-[#0a0a0a] bg-[#f0ede8] px-6 py-2.5 border-[0.5px] border-transparent hover:bg-white"
              >
                New Meeting
              </Link>
              <Link
                to="/lobby/join"
                className="inline-flex items-center justify-center font-['Syne',sans-serif] text-[13px] font-bold tracking-[0.08em] uppercase no-underline cursor-pointer transition-all duration-150 ease-out text-[#f0ede8] px-6 py-2.5 border-[0.5px] border-[#f0ede8]/40 hover:bg-[#f0ede8]/10 bg-transparent"
              >
                Join Existing
              </Link>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-6 py-5 border-b-[0.5px] border-[#f0ede8]/10">
          <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.18em] uppercase text-[#f0ede8]/25 whitespace-nowrap">
            Features
          </span>
          <div className="hidden md:flex flex-1 gap-0">
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#f0ede8]/35 pr-5 border-l-0">
              01 — Video Call
            </span>
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#f0ede8]/35 px-5 border-l-[0.5px] border-[#f0ede8]/10">
              02 — Watch YouTube
            </span>
            <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#f0ede8]/35 px-5 border-l-[0.5px] border-[#f0ede8]/10">
              03 — Local Streaming
            </span>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 border-b-[0.5px] border-[#f0ede8]/10">
          <div className="py-10 md:py-[60px] md:pr-10 border-b-[0.5px] md:border-b-0 md:border-r-[0.5px] border-[#f0ede8]/10 relative transition-colors duration-200 hover:bg-[#f0ede8]/5">
            <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] text-[#f0ede8]/20 mb-8 block">
              01
            </span>
            <div className="w-9 h-9 border-[0.5px] border-[#f0ede8]/20 flex items-center justify-center mb-6">
              <IconVideo />
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#f0ede8] mb-4 tracking-[-0.3px]">
              Private Video Call
            </div>
            <p className="text-[13px] leading-[1.8] text-[#f0ede8]/40 font-normal">
              One-on-one. End-to-end. Create a room, share the link. Your camera
              feed travels directly — never through our servers.
            </p>
          </div>

          <div className="py-10 md:py-[60px] md:px-10 border-b-[0.5px] md:border-b-0 md:border-r-[0.5px] border-[#f0ede8]/10 relative transition-colors duration-200 hover:bg-[#f0ede8]/5">
            <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] text-[#f0ede8]/20 mb-8 block">
              02
            </span>
            <div className="w-9 h-9 border-[0.5px] border-[#f0ede8]/20 flex items-center justify-center mb-6">
              <IconPlay />
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#f0ede8] mb-4 tracking-[-0.3px]">
              Watch YouTube
            </div>
            <p className="text-[13px] leading-[1.8] text-[#f0ede8]/40 font-normal">
              Synchronized playback. One pauses, both pause. Turn YouTube into a
              shared experience — no plugins, no extensions.
            </p>
          </div>

          <div className="py-10 md:py-[60px] md:pl-10 border-none relative transition-colors duration-200 hover:bg-[#f0ede8]/5">
            <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.15em] text-[#f0ede8]/20 mb-8 block">
              03
            </span>
            <div className="w-9 h-9 border-[0.5px] border-[#f0ede8]/20 flex items-center justify-center mb-6">
              <IconFilm />
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#f0ede8] mb-4 tracking-[-0.3px]">
              Stream Local Files
            </div>
            <p className="text-[13px] leading-[1.8] text-[#f0ede8]/40 font-normal">
              Any file, from your drive. Stream any video directly to your
              friend — your content never touches a cloud.
            </p>
          </div>
        </section>

        <section className="py-20 flex flex-col md:grid md:grid-cols-[1fr_auto] gap-8 md:gap-[60px] items-center border-b-[0.5px] border-[#f0ede8]/10">
          <div className="font-['DM_Serif_Display',serif] text-[clamp(32px,4vw,52px)] leading-[1.1] tracking-[-1px] text-[#f0ede8]">
            Ready to connect
            <br />
            <em className="italic text-[#f0ede8]/40">without the noise?</em>
          </div>
          <div className="flex flex-row md:flex-col gap-2.5 md:min-w-[200px]">
            <Link
              to="/lobby/new"
              className="inline-flex items-center justify-center font-['Syne',sans-serif] text-[13px] font-bold tracking-[0.08em] uppercase no-underline cursor-pointer transition-all duration-150 ease-out text-[#0a0a0a] bg-[#f0ede8] px-6 py-2.5 border-[0.5px] border-transparent hover:bg-white"
            >
              Start New Room
            </Link>
            <Link
              to="/lobby/join"
              className="inline-flex items-center justify-center font-['Syne',sans-serif] text-[13px] font-bold tracking-[0.08em] uppercase no-underline cursor-pointer transition-all duration-150 ease-out text-[#f0ede8] px-6 py-2.5 border-[0.5px] border-[#f0ede8]/40 hover:bg-[#f0ede8]/10 bg-transparent"
            >
              Join Existing Room
            </Link>
          </div>
        </section>

        <footer className="py-7 flex justify-between items-center">
          <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#f0ede8]/20">
            &copy; {new Date().getFullYear()} YooTwo
            <span className="inline-block w-[3px] h-[3px] rounded-full bg-[#f0ede8]/20 align-middle mx-2" />
            All rights reserved
          </span>
          <span className="font-['DM_Mono',monospace] text-[11px] tracking-[0.06em] text-[#f0ede8]/20">
            Built by <span className="text-[#f0ede8]/45">imvbhargav</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default Home;

import { Link } from "react-router-dom";

const End = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] font-['Syne',sans-serif] relative overflow-hidden grid grid-rows-[auto_1fr_auto]">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(240,237,232,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(240,237,232,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Top Left Logo */}
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

      {/* Main Content Box */}
      <main className="relative z-10 flex items-center justify-center py-[60px] px-6">
        <div className="relative z-10 w-full max-w-3xl border border-white/[0.08] py-8 md:py-16 flex flex-col items-center text-center bg-[#0a0a0a]/80 backdrop-blur-md shadow-[0_0_60px_-15px_rgba(240,237,232,0.05)]">
          <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.2em] uppercase text-white/40 mb-6 flex items-center gap-3">
            <span className="block w-4 h-px bg-white/30" />
            Call Disconnected
            <span className="block w-4 h-px bg-white/30" />
          </p>

          <h2 className="font-['DM_Serif_Display',serif] text-[48px] md:text-[64px] leading-[1.05] tracking-[-1.5px] text-[#f0ede8] mb-6">
            Session <em className="italic text-white/40">Concluded.</em>
          </h2>

          <p className="text-[15px] leading-relaxed text-white/50 max-w-md mb-12">
            The peer-to-peer connection has been safely terminated. Thank you
            for using YooTwo for your secure communications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/lobby/new"
              className="w-full sm:w-auto px-8 py-4 bg-[#f0ede8] text-[#0a0a0a] text-[13px] font-bold tracking-[0.08em] uppercase transition-colors hover:bg-white border border-transparent whitespace-nowrap shadow-lg flex items-center justify-center"
            >
              Start New Room
            </Link>
            <Link
              to="/lobby/join"
              className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white/60 text-[13px] font-bold tracking-[0.08em] uppercase transition-colors hover:border-white/40 hover:text-white hover:bg-white/[0.04] whitespace-nowrap flex items-center justify-center"
            >
              Join Existing Room
            </Link>
          </div>

          {/* Bottom Divider & Home Link */}
          <div className="mt-12 pt-8 border-t border-white/[0.08] w-full flex justify-center">
            <Link
              to="/"
              className="font-['DM_Mono',monospace] text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-white/30 hover:text-white/80 transition-colors flex items-center gap-2 group"
            >
              <svg
                className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 12H5M5 12l7-7M5 12l7 7"
                />
              </svg>
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default End;

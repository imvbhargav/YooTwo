const End = () => {
  return (
    <>
      <h1 className="text-[3rem] font-black text-center">
        <span className=" bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">YooTwo</span>
      </h1>
      <div className='flex justify-center align-center min-h-screen md:px-56 lg:px-0'>
        <div className="w-screen h-screen flex flex-col justify-center items-center p-12">
          <h1 className="text-center text-4xl lg:text-6xl font-black bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            Thanks for using our service! We hope you enjoyed our service.
          </h1>
          <div className="flex justify-between gap-8 items-center pb-12 flex-col lg:flex-row py-24 w-full sm:w-1/2">
            <a href="/lobby/new" className="w-full bg-green-200/10 px-2 lg:px-24 py-4 lg:py-10 text-2xl lg:text-4xl hover:bg-green-400 hover:border-zinc-300 hover:text-zinc-800 transition-all duration-200">
              <button className="w-full text-center h-8">
                Start New Room.
              </button>
            </a>
            <a href="/lobby/join" className="w-full bg-blue-200/10 px-2 lg:px-24 py-4 lg:py-10 text-2xl lg:text-4xl hover:bg-blue-400 hover:border-zinc-300 hover:text-zinc-800 transition-all duration-200">
              <button className="w-full text-center h-8">
                Join Existing Room.
              </button>
            </a>
          </div>
          <a href="/"><span className="text-blue-500">&rarr;</span> Return to Home <span className="text-pink-500">&larr;</span></a>
        </div>
      </div>
    </>
  )
}

export default End;
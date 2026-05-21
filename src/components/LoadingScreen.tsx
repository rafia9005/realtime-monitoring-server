interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] h-[70vh] w-full py-12 px-6">
      <div className="relative flex items-center justify-center mb-6">
        {/* Ambient background glow */}
        <div className="absolute w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        
        {/* Premium multi-ring animated spinner */}
        {/* Outer glowing track ring */}
        <div className="w-16 h-16 rounded-full border-2 border-foreground/5 border-t-primary border-b-primary animate-spin [animation-duration:1.5s]" />
        
        {/* Inner track ring rotating in reverse */}
        <div className="absolute w-10 h-10 rounded-full border-2 border-foreground/5 border-l-primary/60 border-r-primary/60 animate-spin [animation-direction:reverse] [animation-duration:1s]" />
        
        {/* Small pinging core dot */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-primary/80 animate-ping" />
      </div>
      
      {/* Sleek, spaced typing/loading message */}
      <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 animate-pulse text-center select-none max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  );
}

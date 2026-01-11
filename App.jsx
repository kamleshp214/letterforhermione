import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Volume2, VolumeX, Sparkles, Feather, MapPin, MoveRight } from 'lucide-react';

// --- FIREBASE SETUP ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- ASSETS & STYLES ---
const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Mrs+Saint+Delafield&display=swap';
document.head.appendChild(googleFontsLink);

// --- UTILS ---
const useAudio = (url) => {
  const audio = useRef(new Audio(url));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audio.current.loop = true;
    audio.current.volume = 0.4;
    return () => audio.current.pause();
  }, []);

  const toggle = () => {
    if (playing) audio.current.pause();
    else audio.current.play().catch(e => console.log("Audio play blocked", e));
    setPlaying(!playing);
  };

  return [playing, toggle];
};

// --- SCENES ---

// 1. LUMOS (Intro)
const LumosScene = ({ onComplete }) => {
  const [ignited, setIgnited] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  };

  const ignite = () => {
    setIgnited(true);
    setTimeout(onComplete, 2500);
  };

  return (
    <div 
      className={`relative w-full h-full bg-[#050404] cursor-none overflow-hidden transition-all duration-1000 ${ignited ? 'bg-[#0f0a08]' : ''}`}
      onMouseMove={handleMouseMove}
      onClick={ignite}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className={`font-cinzel text-amber-100/30 tracking-[0.5em] text-sm transition-opacity duration-1000 ${ignited ? 'opacity-0' : 'opacity-100'}`}>
          LUMOS
        </h1>
      </div>

      {/* Wand Tip Light */}
      <div 
        className="absolute w-64 h-64 bg-amber-100/10 rounded-full blur-3xl pointer-events-none transition-all duration-75 ease-out mix-blend-screen"
        style={{ 
          top: `${mousePos.y}%`, 
          left: `${mousePos.x}%`, 
          transform: 'translate(-50%, -50%)',
          opacity: ignited ? 0 : 0.5 
        }} 
      />
      
      {/* The Flash */}
      <div 
        className={`absolute inset-0 bg-white transition-opacity duration-[2000ms] pointer-events-none ${ignited ? 'opacity-0' : 'opacity-0'}`}
        style={{ opacity: ignited ? 0 : 0 }} 
      >
          {ignited && <div className="absolute inset-0 bg-white animate-flash-fade" />}
      </div>
    </div>
  );
};

// 2. THE CORRIDOR (Narrative)
const CorridorScene = ({ onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);
  
  const lines = [
    "Sanjana...",
    "It has been quiet here without you.",
    "Walking these halls, I am reminded of how we started.",
    "Two children, long before we knew of magic.",
    "But looking at you now...",
    "I see the same spark. The same quiet strength.",
    "You have always been my Hermione.",
  ];

  const advance = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex(l => l + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0c0a08] overflow-hidden flex items-center justify-center perspective-1000" onClick={advance}>
      {/* Ambient Depth Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[radial-gradient(circle_at_center,_#2a1d15_0%,_transparent_60%)] animate-pulse-slow"></div>
        {/* Stone Texture Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-amber-200/20 blur-[1px] animate-float-particle"
          style={{
            width: Math.random() * 4 + 'px',
            height: Math.random() * 4 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDuration: (10 + Math.random() * 20) + 's',
            animationDelay: Math.random() * -10 + 's'
          }}
        />
      ))}

      {/* Text Container */}
      <div className="relative z-10 max-w-2xl px-8 text-center">
        {lines.map((line, i) => (
          <p 
            key={i}
            className={`font-cormorant text-2xl md:text-4xl text-amber-100/90 leading-relaxed transition-all duration-1000 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full
              ${i === lineIndex ? 'opacity-100 translate-z-0 scale-100 blur-0' : i < lineIndex ? 'opacity-0 -translate-y-12 blur-sm' : 'opacity-0 translate-y-12 blur-sm'}
            `}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="absolute bottom-12 w-full text-center opacity-30 animate-bounce-slow">
        <span className="font-cinzel text-xs tracking-[0.3em] text-amber-100">Click to Advance</span>
      </div>
    </div>
  );
};

// 3. THE PENSIEVE (Memory Input)
const PensieveScene = ({ onComplete, setData }) => {
  const [input, setInput] = useState('');
  
  // Simple particle system simulation for 'memory fluid'
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        this.alpha = Math.random() * 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = `rgba(147, 197, 253, ${this.alpha})`; // Light blue/silver
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Create a swirling gradient background
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      gradient.addColorStop(0, '#1e293b'); // Slate 800
      gradient.addColorStop(1, '#020617'); // Slate 950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleSubmit = () => {
    if (input.trim()) {
      setData(d => ({ ...d, memory: input }));
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
      
      <div className="relative z-10 w-full max-w-xl px-6 text-center animate-fade-in-slow">
        <h2 className="font-cinzel text-blue-100/80 text-xl md:text-2xl mb-8 tracking-widest uppercase">The Pensieve</h2>
        <p className="font-cormorant text-2xl text-blue-50/90 mb-12 italic">
          "One memory has stayed with me... tell me yours."
        </p>

        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full transform group-hover:scale-110 transition-transform duration-700"></div>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="relative w-full bg-transparent border-b border-blue-200/30 text-center font-cormorant text-2xl text-blue-50 placeholder-blue-200/20 py-4 focus:outline-none focus:border-blue-300 transition-colors"
            placeholder="A moment of magic..."
            autoFocus
          />
        </div>

        <div className="mt-12 opacity-0 animate-fade-in delay-1000">
          <button onClick={handleSubmit} className="text-blue-200/50 hover:text-blue-100 transition-colors font-cinzel text-sm tracking-widest">
            Drop memory into the water
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. THE STUDY (Address Input)
const StudyScene = ({ onComplete, setData, submitToDb }) => {
  const [address, setAddress] = useState('');
  
  const handleNext = () => {
    if (address.trim()) {
      const newData = { address };
      setData(d => ({ ...d, ...newData }));
      submitToDb(address); // Pass address directly to avoid closure staleness
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#1c1510] flex items-center justify-center overflow-hidden">
      {/* Warm Firelight Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,_#7c2d12_0%,_transparent_50%)] opacity-40 animate-pulse-slow"></div>
      
      {/* 3D Tilted Desk Effect */}
      <div className="relative z-10 w-full max-w-3xl p-8 perspective-1000">
        <div 
          className="bg-[#f0e6d2] p-12 shadow-2xl relative transform rotateX-3 rotateY-1 border-t-4 border-[#8b5a2b]/20"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(139, 90, 43, 0.1)' 
          }}
        >
          {/* Quill Icon Decoration */}
          <div className="absolute -top-6 -right-6 text-[#4a2c22] opacity-80 transform rotate-12">
            <Feather size={64} strokeWidth={1} />
          </div>

          <h2 className="font-cinzel text-[#4a2c22] text-xl tracking-widest mb-2 flex items-center gap-3">
             <MapPin size={18} /> The Owl Registry
          </h2>
          <div className="h-px w-full bg-[#4a2c22]/20 mb-8"></div>
          
          <p className="font-cormorant text-xl text-[#2c1810] mb-8 leading-relaxed">
            The owls know the way, but they need a destination. <br/>
            <span className="italic text-[#8b5a2b]">Where should the magic find you in Indore?</span>
          </p>

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-transparent border-l-4 border-[#8b5a2b]/30 pl-4 py-2 font-cormorant text-2xl text-[#2c1810] placeholder-[#8b5a2b]/30 focus:outline-none focus:border-[#8b5a2b] min-h-[100px] resize-none leading-relaxed"
            placeholder="Write here..."
          />

          <div className="mt-8 flex justify-end">
             <button 
              onClick={handleNext}
              className="group flex items-center gap-3 font-cinzel text-[#4a2c22] hover:text-[#8b5a2b] transition-colors"
             >
               Confirm Entry <MoveRight className="group-hover:translate-x-1 transition-transform" size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. THE NIGHT SKY (Finale)
const SkyScene = () => {
  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden flex flex-col items-center justify-center">
       {/* Stars */}
       {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            width: Math.random() * 2 + 'px',
            height: Math.random() * 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random(),
            animationDuration: (Math.random() * 3 + 2) + 's'
          }}
        />
      ))}

      <div className="relative z-10 text-center animate-fade-in-slow p-8">
        <Sparkles className="w-12 h-12 text-amber-100 mx-auto mb-6 opacity-80" />
        <h1 className="font-cinzel text-3xl md:text-5xl text-amber-50 mb-6 tracking-widest">
          Mischief Managed
        </h1>
        <p className="font-cormorant text-xl text-amber-100/60 max-w-md mx-auto">
          The memory has been stored. The owl has been dispatched.
        </p>
        <div className="mt-16 border-t border-amber-100/10 pt-8 w-24 mx-auto">
           <p className="font-MrsSaintDelafield text-4xl text-amber-100/40 transform -rotate-6">Always.</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---

export default function HogwartsImmersive() {
  const [scene, setScene] = useState(0); // 0: Lumos, 1: Corridor, 2: Pensieve, 3: Study, 4: Sky
  const [isPlaying, toggleAudio] = useAudio('https://upload.wikimedia.org/wikipedia/commons/c/c2/Gymnop%C3%A9die_No._1.ogg'); // Satie - Gymnopédie No.1 (Melancholic, atmospheric)
  const [user, setUser] = useState(null);
  
  // Data Collection
  const [collectionData, setCollectionData] = useState({
    memory: '',
    address: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    onAuthStateChanged(auth, setUser);
  }, []);

  const handleDbSubmit = async (finalAddress) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'wizarding_responses'), {
        ...collectionData,
        address: finalAddress, // Ensure we use the latest address
        recipient: 'Sanjana',
        timestamp: serverTimestamp(),
        type: 'immersive_experience'
      });
    } catch (e) {
      console.error("Owl lost its way", e);
    }
  };

  const nextScene = () => setScene(s => s + 1);

  return (
    <div className="w-full h-screen relative bg-black font-sans selection:bg-amber-900 selection:text-white">
      {/* Global Audio Control */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 text-white/30 hover:text-white transition-colors"
      >
        {isPlaying ? <Volume2 /> : <VolumeX />}
      </button>

      {/* Scene Render */}
      <div className="w-full h-full transition-opacity duration-1000 ease-in-out">
        {scene === 0 && <LumosScene onComplete={nextScene} />}
        {scene === 1 && <CorridorScene onComplete={nextScene} />}
        {scene === 2 && <PensieveScene onComplete={nextScene} setData={setCollectionData} />}
        {scene === 3 && <StudyScene onComplete={nextScene} setData={setCollectionData} submitToDb={handleDbSubmit} />}
        {scene === 4 && <SkyScene />}
      </div>

      <style>{`
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-MrsSaintDelafield { font-family: 'Mrs Saint Delafield', cursive; }

        @keyframes flash-fade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash-fade { animation: flash-fade 2s ease-out forwards; }

        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        .animate-float-particle { animation-timing-function: linear; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }

        @keyframes fade-in-slow {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-slow { animation: fade-in-slow 2s ease-out forwards; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }

        .perspective-1000 { perspective: 1000px; }
        .rotateX-3 { transform: rotateX(3deg); }
      `}</style>
    </div>
  );
}

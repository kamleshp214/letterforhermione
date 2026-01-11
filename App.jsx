import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Play, Volume2, VolumeX, Feather, Star, Moon, MapPin, Send } from 'lucide-react';

// --- FIREBASE SETUP ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- STYLES & ASSETS ---
// Using Google Fonts via style injection for that authentic wizarding feel
const googleFontsLink = document.createElement('link');
googleFontsLink.rel = 'stylesheet';
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Pinyon+Script&display=swap';
document.head.appendChild(googleFontsLink);

const FloatingCandle = ({ delay }) => (
  <div 
    className="absolute animate-float opacity-80"
    style={{ 
      top: `${Math.random() * 40}%`, 
      left: `${Math.random() * 90}%`, 
      animationDelay: `${delay}s`,
      animationDuration: `${4 + Math.random() * 4}s`
    }}
  >
    <div className="w-2 h-8 bg-amber-100 rounded-sm relative shadow-lg">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-orange-400 rounded-full animate-flicker blur-[1px]"></div>
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-5 bg-yellow-300 rounded-full animate-pulse opacity-50 blur-[4px]"></div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function HogwartsLetter() {
  const [step, setStep] = useState(0); // 0: Envelope, 1: Letter, 2: Reflections, 3: Address, 4: End
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState(null);
  const audioRef = useRef(null);
  
  // Form State
  const [formData, setFormData] = useState({
    moment: '',
    message: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Init
  useEffect(() => {
    const initAuth = async () => {
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (e) {
            console.error("Auth failed", e);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Audio Toggle
  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://upload.wikimedia.org/wikipedia/commons/e/e3/Waltz_of_the_Flowers_%28by_Tchaikovsky%29.ogg'); // Royalty free classical waltz suitable for magical vibes
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed interaction required"));
    }
    setIsPlaying(!isPlaying);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      // Save to private user collection
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'wizarding_responses'), {
        ...formData,
        recipient: 'Sanjana',
        timestamp: serverTimestamp()
      });
      nextStep();
    } catch (error) {
      console.error("Error sending owl:", error);
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  
  const EnvelopeSection = () => (
    <div className="flex flex-col items-center justify-center h-full text-center z-10 cursor-pointer" onClick={() => { toggleAudio(); nextStep(); }}>
      <div className="bg-[#f0e6d2] w-64 h-40 shadow-2xl rounded-sm relative flex items-center justify-center transform transition hover:scale-105 duration-700 border-2 border-[#8b5a2b]">
        {/* Wax Seal */}
        <div className="absolute rounded-full bg-red-800 w-12 h-12 shadow-md flex items-center justify-center border-2 border-red-900 z-20">
          <span className="font-serif text-amber-200 text-xl font-bold">H</span>
        </div>
        <div className="font-cinzel text-[#2c1810] tracking-widest text-sm mt-8 opacity-80">
          To Sanjana
        </div>
      </div>
      <p className="mt-8 text-amber-100/70 font-cinzel text-sm animate-pulse">Tap to break the seal</p>
    </div>
  );

  const LetterSection = () => (
    <div className="w-full max-w-2xl bg-[#f0e6d2] p-8 md:p-12 shadow-2xl rounded-sm mx-4 relative overflow-hidden animate-fade-in parchment-texture">
      <div className="border-4 border-double border-[#8b5a2b]/20 p-6 h-full relative">
        <h1 className="font-pinyon text-4xl md:text-5xl text-[#4a2c22] mb-6">Dear Sanjana,</h1>
        
        <div className="font-cormorant text-lg md:text-xl text-[#2c1810] leading-relaxed space-y-4">
          <p>
            It is strange how the castle waits for us, isn’t it?
          </p>
          <p>
            I have known you since we were small, back before we knew about platforms or potions. But watching you finally step into this world feels... inevitable. 
          </p>
          <p>
            They say the wand chooses the wizard, but I think the story chooses the person, too. I’ve always seen it in you—that quiet intelligence, the loyalty that runs deep, the way you care about things so completely. 
          </p>
          <p>
            You’ve always been <span className="italic font-semibold text-[#6d4c41]">my Hermione</span>. Even before you knew who she was.
          </p>
          <p>
            Welcome home, my friend. The magic has been waiting for you.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={nextStep}
            className="font-cinzel text-[#4a2c22] border-b border-[#4a2c22] hover:text-[#8b5a2b] transition-colors pb-1 flex items-center gap-2"
          >
            Turn the page <Feather className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ReflectionsSection = () => (
    <div className="w-full max-w-2xl bg-[#f0e6d2] p-8 md:p-12 shadow-2xl rounded-sm mx-4 relative animate-fade-in parchment-texture">
       <div className="border-4 border-double border-[#8b5a2b]/20 p-6 h-full">
        <h2 className="font-cinzel text-2xl text-[#4a2c22] mb-8 text-center border-b border-[#8b5a2b]/20 pb-4">Reflections in the Pensieve</h2>
        
        <div className="space-y-8 font-cormorant">
          <div>
            <label className="block text-[#5d4037] text-xl mb-2 italic">
              Which moment of magic stayed with you the longest?
            </label>
            <textarea 
              name="moment"
              value={formData.moment}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b-2 border-[#8b5a2b]/30 focus:border-[#8b5a2b] outline-none text-[#2c1810] text-xl min-h-[80px] placeholder-[#8b5a2b]/30 resize-none transition-colors"
              placeholder="Was it the feathers levitating, or the Patronus in the woods?"
            />
          </div>

          <div>
            <label className="block text-[#5d4037] text-xl mb-2 italic">
              A message to your oldest friend...
            </label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b-2 border-[#8b5a2b]/30 focus:border-[#8b5a2b] outline-none text-[#2c1810] text-xl min-h-[80px] placeholder-[#8b5a2b]/30 resize-none transition-colors"
              placeholder="Write something that time cannot erase..."
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={nextStep}
            className="font-cinzel text-[#4a2c22] border-b border-[#4a2c22] hover:text-[#8b5a2b] transition-colors pb-1 flex items-center gap-2"
          >
            Continue <Star className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const AddressSection = () => (
    <div className="w-full max-w-2xl bg-[#f0e6d2] p-8 md:p-12 shadow-2xl rounded-sm mx-4 relative animate-fade-in parchment-texture">
       <div className="border-4 border-double border-[#8b5a2b]/20 p-6 h-full">
        <div className="text-center mb-6">
          <Moon className="w-8 h-8 text-[#4a2c22] mx-auto mb-2 opacity-50" />
          <h2 className="font-cinzel text-2xl text-[#4a2c22]">The Owl Registry</h2>
        </div>
        
        <div className="font-cormorant text-lg text-[#2c1810] text-center mb-8 space-y-2">
          <p>The owls of Hogwarts sometimes deliver small tokens of magic to those who believe.</p>
          <p className="italic text-[#5d4037]">Please inscribe your current dwelling in Indore, so the magic knows exactly where to find you.</p>
        </div>

        <div className="mb-8">
           <label className="block text-[#5d4037] font-cinzel text-sm mb-2 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Residence in Indore
            </label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full bg-[#e6dac0] border border-[#8b5a2b]/30 p-4 rounded-sm focus:border-[#8b5a2b] outline-none text-[#2c1810] font-cormorant text-xl placeholder-[#8b5a2b]/40 resize-none h-32 shadow-inner"
              placeholder="e.g. The house near the old banyan tree..."
            />
        </div>

        <div className="mt-4 flex justify-center">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#4a2c22] text-[#f0e6d2] font-cinzel px-8 py-3 rounded-sm hover:bg-[#2c1810] transition-colors flex items-center gap-3 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Dispatching Owl...' : 'Send by Owl Post'} <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const FinaleSection = () => (
    <div className="text-center animate-fade-in z-10 p-6">
      <div className="mb-6 animate-bounce-slow">
        <span className="text-6xl filter drop-shadow-glow">🦉</span>
      </div>
      <h1 className="font-cinzel text-3xl md:text-5xl text-amber-100 mb-4 tracking-wider text-shadow">
        Mischief Managed
      </h1>
      <p className="font-cormorant text-xl text-amber-100/80 max-w-md mx-auto leading-relaxed">
        Your message has been carried into the night sky. May magic always find you, Sanjana.
      </p>
      
      <div className="mt-12 opacity-50">
        <p className="font-cinzel text-xs text-amber-200 uppercase tracking-[0.3em]">
          Always
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] selection:bg-[#4a2c22] selection:text-[#f0e6d2]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a100c] via-[#0f0a08] to-[#000000]"></div>
      
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            width: Math.random() * 3 + 'px',
            height: Math.random() * 3 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7,
            animationDuration: Math.random() * 3 + 2 + 's'
          }}
        />
      ))}

      {/* Floating Candles */}
      {[...Array(6)].map((_, i) => (
        <FloatingCandle key={i} delay={i * 1.5} />
      ))}

      {/* Audio Control */}
      <button 
        onClick={toggleAudio}
        className="absolute top-4 right-4 z-50 text-amber-100/50 hover:text-amber-100 transition-colors p-2"
      >
        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center p-4">
        {step === 0 && <EnvelopeSection />}
        {step === 1 && <LetterSection />}
        {step === 2 && <ReflectionsSection />}
        {step === 3 && <AddressSection />}
        {step === 4 && <FinaleSection />}
      </div>

      {/* Global CSS for custom animations/fonts */}
      <style>{`
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-pinyon { font-family: 'Pinyon Script', cursive; }
        
        .parchment-texture {
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
          box-shadow: inset 0 0 60px rgba(74, 44, 34, 0.3);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(0.9); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-flicker { animation: flicker 0.1s infinite alternate; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; }
        .animate-bounce-slow { animation: float 3s ease-in-out infinite; }
        
        .text-shadow { text-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
      `}</style>
    </div>
  );
}

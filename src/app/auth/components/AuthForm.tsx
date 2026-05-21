'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Clock, Shield, Leaf, ChevronLeft, CheckCircle } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';


// ── Bubble animation ──────────────────────────────────────────────────────────
interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const bubbles: Bubble[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * canvas.height,
      size: 8 + Math.random() * 40,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 0.08 + Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 0.4,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += b.drift;
        if (b.y + b.size < 0) {
          b.y = canvas.height + b.size;
          b.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(147, 197, 253, ${b.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // inner highlight
        const grad = ctx.createRadialGradient(b.x - b.size * 0.3, b.y - b.size * 0.3, 0, b.x, b.y, b.size);
        grad.addColorStop(0, `rgba(255,255,255,${b.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(147,197,253,0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Washing machine portal SVG ────────────────────────────────────────────────
function WashingPortal() {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-[spin_12s_linear_infinite]" />
      <div className="absolute inset-2 rounded-full border border-blue-300/20 animate-[spin_8s_linear_infinite_reverse]" />
      <div className="absolute inset-4 rounded-full border-2 border-yellow-400/20 animate-[spin_16s_linear_infinite]" />

      {/* Glow backdrop */}
      <div className="absolute inset-6 rounded-full bg-blue-500/10 blur-xl" />

      {/* Main portal circle */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.3),0_0_120px_rgba(59,130,246,0.2)]">
        {/* Dark blue water background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950" />

        {/* Foam / water effect */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-blue-700/80 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 h-8 bg-white/20 blur-sm rounded-full" />
        <div className="absolute bottom-6 left-4 right-4 h-6 bg-white/30 blur-md rounded-full" />

        {/* Clothes tumbling */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 animate-[spin_3s_ease-in-out_infinite]">
            <div className="absolute top-2 left-4 w-10 h-8 bg-yellow-400 rounded-lg opacity-90 rotate-12" />
            <div className="absolute top-8 right-2 w-8 h-10 bg-white rounded-lg opacity-80 -rotate-6" />
            <div className="absolute bottom-2 left-2 w-12 h-7 bg-blue-300 rounded-lg opacity-85 rotate-3" />
          </div>
        </div>

        {/* Bubble overlay inside portal */}
        <div className="absolute top-3 left-6 w-3 h-3 rounded-full border border-white/40 bg-white/10" />
        <div className="absolute top-8 right-8 w-2 h-2 rounded-full border border-white/30 bg-white/10" />
        <div className="absolute bottom-10 left-10 w-4 h-4 rounded-full border border-white/30 bg-white/10" />
      </div>

      {/* Gold ring accent */}
      <div className="absolute inset-5 rounded-full border-2 border-yellow-400/40 pointer-events-none" />
    </div>
  );
}

// ── Feature icon cards ────────────────────────────────────────────────────────
const features = [
  { icon: Clock, label: 'Pickup &\nDelivery' },
  { icon: Shield, label: 'Premium\nCare' },
  { icon: Leaf, label: 'Eco\nFriendly' },
];

// ── Phone OTP Flow ────────────────────────────────────────────────────────────
type PhoneStep = 'enter_phone' | 'enter_otp' | 'success';

interface PhoneOTPFlowProps {
  onBack: () => void;
}

function PhoneOTPFlow({ onBack }: PhoneOTPFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<PhoneStep>('enter_phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Phone number is required.';
    if (digits.length !== 10) return 'Enter a valid 10-digit Indian mobile number.';
    if (!/^[6-9]/.test(digits)) return 'Mobile number must start with 6, 7, 8, or 9.';
    return '';
  };

  const handleSendOTP = () => {
    const err = validatePhone(phoneNumber);
    if (err) { setPhoneError(err); return; }
    setPhoneError('');
    setIsLoading(true);
    // Simulate OTP send (UI only)
    setTimeout(() => {
      setIsLoading(false);
      setStep('enter_otp');
      setResendTimer(30);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) { setOtpError('Please enter the complete 6-digit OTP.'); return; }
    // UI-only: accept any 6-digit OTP as valid
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 1500);
    }, 1200);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    otpRefs.current[0]?.focus();
  };

  // ── Step: Enter Phone ──
  if (step === 'enter_phone') {
    return (
      <div className="flex flex-col gap-5">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0d1f3c] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center mx-auto mb-3">
            <Phone size={24} className="text-yellow-500" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0d1f3c]">Continue with Phone</h3>
          <p className="text-sm text-slate-500 mt-1">We'll send a 6-digit OTP to your Indian mobile number.</p>
        </div>

        {/* Phone input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mobile Number</label>
          <div className={`flex items-center gap-2 bg-white border-2 rounded-2xl px-4 py-3 transition-all ${phoneError ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20'}`}>
            <span className="text-base leading-none select-none">🇮🇳</span>
            <span className="text-sm font-bold text-slate-700 select-none">+91</span>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(val);
                if (phoneError) setPhoneError(validatePhone(val));
              }}
              onBlur={() => setPhoneError(validatePhone(phoneNumber))}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
              inputMode="numeric"
            />
          </div>
          {phoneError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
              {phoneError}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1.5">Standard SMS charges may apply.</p>
        </div>

        {/* Send OTP button */}
        <button
          type="button"
          onClick={handleSendOTP}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending OTP…
            </span>
          ) : (
            <>Send OTP <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    );
  }

  // ── Step: Enter OTP ──
  if (step === 'enter_otp') {
    const maskedPhone = `+91 XXXXX${phoneNumber.slice(-5)}`;
    return (
      <div className="flex flex-col gap-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => { setStep('enter_phone'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0d1f3c] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Change Number
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center mx-auto mb-3">
            <Phone size={24} className="text-yellow-500" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0d1f3c]">Enter OTP</h3>
          <p className="text-sm text-slate-500 mt-1">
            A 6-digit code was sent to <span className="font-semibold text-[#0d1f3c]">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-150
                  ${digit ? 'border-yellow-400 bg-yellow-50 text-[#0d1f3c]' : 'border-slate-200 bg-white text-slate-700'}
                  ${otpError ? 'border-red-400 bg-red-50' : ''}
                  focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20`}
              />
            ))}
          </div>
          {otpError && (
            <p className="text-xs text-red-500 mt-2 text-center flex items-center justify-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
              {otpError}
            </p>
          )}
        </div>

        {/* Verify button */}
        <button
          type="button"
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.join('').length < 6}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying…
            </span>
          ) : (
            <>Verify & Login <ArrowRight size={16} /></>
          )}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-slate-500">
          Didn't receive the code?{' '}
          {resendTimer > 0 ? (
            <span className="text-slate-400">Resend in <span className="font-semibold text-[#0d1f3c]">{resendTimer}s</span></span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Resend OTP
            </button>
          )}
        </p>
      </div>
    );
  }

  // ── Step: Success ──
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
        <CheckCircle size={32} className="text-green-500" />
      </div>
      <h3 className="text-xl font-extrabold text-[#0d1f3c]">Verified!</h3>
      <p className="text-sm text-slate-500 text-center">Authentication successful. Redirecting to your dashboard…</p>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AuthForm() {
  const [tab, setTab] = useState<'login' | 'signup' | 'phone'>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      
      toast.success('Successfully logged in!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: fullName,
            phone: phone, // Pass the phone number to be captured by the SQL trigger
          },
        },
      });
      if (error) throw error;
      
      toast.success('Registration successful! Check your email to verify.');
      setTab('login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing in with Google');
      setIsLoading(false);
    }
  };

  const isPhoneTab = tab === 'phone';

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row font-sans">
      {/* ── LEFT: Dark blue marketing panel ── */}
      <div className="relative lg:w-[45%] flex flex-col items-center justify-between py-10 px-8 overflow-hidden bg-[#0a1628]">
        {/* Animated bubble canvas */}
        <BubbleCanvas />

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#0d1f3c] to-[#071020] opacity-90 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-yellow-500/5 to-transparent pointer-events-none" />

        {/* Portal graphic */}
        <div className="relative z-10 mt-4 lg:mt-8">
          <WashingPortal />
        </div>

        {/* Marketing copy */}
        <div className="relative z-10 text-center lg:text-left w-full max-w-sm mx-auto lg:mx-0 mt-6 lg:mt-0">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Fresh Clothes.
          </h2>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-yellow-400 leading-tight">
            Zero Hassle.
          </h2>
          <p className="mt-3 text-white/70 text-base">
            Join <span className="font-bold text-white">Linedry</span> Today.
          </p>
        </div>

        {/* Feature icon cards */}
        <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-sm mx-auto mt-8 pb-4">
          {features.map(({ icon: FeatureIcon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 px-2 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
                <FeatureIcon size={18} className="text-yellow-400" />
              </div>
              <span className="text-white text-xs font-bold text-center leading-tight whitespace-pre-line">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Auth card ── */}
      <div className="lg:w-[55%] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-10 px-4 min-h-screen lg:min-h-0 relative">
        <Link 
          href="/" 
          className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0d1f3c] transition-colors bg-white/50 hover:bg-white px-3 py-2 rounded-full shadow-sm backdrop-blur-sm border border-slate-200"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl px-6 sm:px-10 py-10 mt-12 lg:mt-0">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <AppImage
              src="/assets/images/app_logo.png"
              alt="Linedry hanger logo"
              width={56}
              height={56}
              className="mb-2"
            />
            <span className="text-3xl font-extrabold text-[#0d1f3c] tracking-tight">Linedry</span>
            <span className="text-sm text-[#0d1f3c]/60 mt-0.5">Clothes Care. Simplified.</span>
          </div>

          {/* Tab switcher — hidden when in phone flow */}
          {!isPhoneTab && (
            <div className="flex bg-slate-100 rounded-full p-1 mb-8 max-w-sm mx-auto">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                  tab === 'login' ? 'bg-[#0d1f3c] text-yellow-400 shadow-md' : 'text-[#0d1f3c] hover:text-[#0d1f3c]/70'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-200 ${
                  tab === 'signup' ? 'bg-[#0d1f3c] text-yellow-400 shadow-md' : 'text-[#0d1f3c] hover:text-[#0d1f3c]/70'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── Form panels ── */}
          <div className="relative overflow-hidden">

            {/* PHONE OTP FLOW */}
            {isPhoneTab && (
              <div className="transition-all duration-300 opacity-100">
                <PhoneOTPFlow onBack={() => setTab('login')} />
              </div>
            )}

            {/* LOGIN FORM */}
            {!isPhoneTab && (
              <>
                <div
                  className={`transition-all duration-300 ${
                    tab === 'login' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none absolute inset-0'
                  }`}
                >
                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <Lock size={16} className="text-slate-400 shrink-0" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="············"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label="Toggle password visibility"
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me + Forgot */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded accent-yellow-400 border-slate-300"
                        />
                        <span className="text-sm text-slate-600">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        Forgot password?
                      </Link>
                    </div>

                    {/* Login CTA */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30 mt-1"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                      Login to Linedry <ArrowRight size={16} />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400">or continue with</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 border-2 border-yellow-400/60 rounded-2xl py-2.5 text-xs font-semibold text-slate-700 hover:bg-yellow-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab('phone')}
                        className="flex items-center justify-center gap-2 border-2 border-yellow-400/60 rounded-2xl py-2.5 text-xs font-semibold text-slate-700 hover:bg-yellow-50 transition-all"
                      >
                        <Phone size={14} className="text-slate-600" />
                        Continue with Phone
                      </button>
                    </div>
                  </form>
                </div>

                {/* SIGNUP FORM */}
                <div
                  className={`transition-all duration-300 ${
                    tab === 'signup' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none absolute inset-0'
                  }`}
                >
                  <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                      <div className="flex items-center gap-3 bg-white border-2 border-yellow-400 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <User size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span className="text-sm font-semibold text-slate-700">+91</span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-slate-400 shrink-0">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                        <Lock size={16} className="text-slate-400 shrink-0" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="············"
                          className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label="Toggle password visibility"
                        >
                          {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Create Account CTA */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30 mt-1"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                      Create Account <ArrowRight size={16} />
                    </button>

                    {/* Already have account */}
                    <p className="text-center text-sm text-slate-500 mt-1">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('login')}
                        className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                      >
                        Login
                      </button>
                    </p>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

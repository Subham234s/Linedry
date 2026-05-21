'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, ChevronLeft, CheckCircle, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ForgotStep = 'email' | 'otp' | 'new_password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>('email');

  // Step 1 — Email
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Step 2 — OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 — New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── Validators ──────────────────────────────────────────────────────────────
  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(val)) return 'Include at least one uppercase letter.';
    if (!/[0-9]/.test(val)) return 'Include at least one number.';
    return '';
  };

  // ── Step 1: Send OTP to email ───────────────────────────────────────────────
  const handleSendOTP = () => {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setIsLoadingEmail(true);
    setTimeout(() => {
      setIsLoadingEmail(false);
      setStep('otp');
      setResendTimer(30);
    }, 1200);
  };

  // ── Step 2: OTP handlers ────────────────────────────────────────────────────
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
    const entered = otp.join('');
    if (entered.length < 6) { setOtpError('Please enter the complete 6-digit OTP.'); return; }
    setIsLoadingOtp(true);
    setTimeout(() => {
      setIsLoadingOtp(false);
      setStep('new_password');
    }, 1200);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  // ── Step 3: Set new password ────────────────────────────────────────────────
  const handleSetPassword = () => {
    const pwErr = validatePassword(newPassword);
    const cfErr = newPassword !== confirmPassword ? 'Passwords do not match.' : '';
    setPasswordError(pwErr);
    setConfirmError(cfErr);
    if (pwErr || cfErr) return;
    setIsLoadingPassword(true);
    setTimeout(() => {
      setIsLoadingPassword(false);
      setStep('success');
      setTimeout(() => router.push('/auth'), 2000);
    }, 1200);
  };

  // ── Password strength indicator ─────────────────────────────────────────────
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: '25%' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  // ── Shared spinner ──────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row font-sans">
      {/* ── LEFT: Dark blue marketing panel (same as AuthForm) ── */}
      <div className="relative lg:w-[45%] flex flex-col items-center justify-center py-12 px-8 overflow-hidden bg-[#0a1628]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#0d1f3c] to-[#071020] opacity-90 pointer-events-none" />

        {/* Decorative floating circles */}
        <div className="absolute top-16 left-10 w-24 h-24 rounded-full border border-blue-300/10 animate-[spin_20s_linear_infinite]" />
        <div className="absolute top-32 right-16 w-16 h-16 rounded-full border border-yellow-400/10 animate-[spin_14s_linear_infinite_reverse]" />
        <div className="absolute bottom-24 left-20 w-20 h-20 rounded-full border border-blue-300/10 animate-[spin_18s_linear_infinite]" />
        <div className="absolute bottom-40 right-10 w-12 h-12 rounded-full border border-yellow-400/10 animate-[spin_10s_linear_infinite_reverse]" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Key icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(250,204,21,0.15)]">
            <KeyRound size={36} className="text-yellow-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
            Reset Your
          </h2>
          <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400 leading-tight mb-4">
            Password
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            We'll send a one-time code to your registered email. Verify it and set a new secure password to regain access to your Linedry account.
          </p>

          {/* Steps indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {(['email', 'otp', 'new_password', 'success'] as ForgotStep[]).map((s, i) => {
              const stepIndex = ['email', 'otp', 'new_password', 'success'].indexOf(step);
              const thisIndex = i;
              const isDone = thisIndex < stepIndex;
              const isActive = thisIndex === stepIndex;
              return (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-yellow-400 text-[#0d1f3c]'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {isDone ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div className={`w-6 h-0.5 rounded-full transition-all duration-300 ${isDone ? 'bg-green-500' : 'bg-white/10'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-center gap-8 mt-2">
            {['Email', 'OTP', 'Password', 'Done'].map((label, i) => {
              const stepIndex = ['email', 'otp', 'new_password', 'success'].indexOf(step);
              return (
                <span key={label} className={`text-[10px] font-semibold transition-colors ${i <= stepIndex ? 'text-yellow-400' : 'text-white/30'}`}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form card ── */}
      <div className="lg:w-[55%] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-10 px-4 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 sm:px-10 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <AppImage
              src="/assets/images/app_logo.png"
              alt="Linedry hanger logo"
              width={48}
              height={48}
              className="mb-2"
            />
            <span className="text-2xl font-extrabold text-[#0d1f3c] tracking-tight">Linedry</span>
            <span className="text-xs text-[#0d1f3c]/60 mt-0.5">Clothes Care. Simplified.</span>
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0d1f3c]">Forgot Password?</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  No worries! Enter your registered email and we'll send you a verification code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                <div
                  className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all ${
                    emailError
                      ? 'border-red-400 ring-2 ring-red-400/20' :'border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20'
                  }`}
                >
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={() => setEmailError(validateEmail(email))}
                    placeholder="you@example.com"
                    className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoadingEmail}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30"
              >
                {isLoadingEmail ? (
                  <><Spinner /> Sending OTP…</>
                ) : (
                  <>Send Verification Code <ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/auth" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Back to Login
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0d1f3c] transition-colors w-fit"
              >
                <ChevronLeft size={16} />
                Change Email
              </button>

              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center mx-auto mb-3">
                  <Mail size={24} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0d1f3c]">Check Your Email</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-[#0d1f3c]">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3 text-center">Enter Verification Code</label>
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

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isLoadingOtp || otp.join('').length < 6}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30"
              >
                {isLoadingOtp ? (
                  <><Spinner /> Verifying…</>
                ) : (
                  <>Verify Code <ArrowRight size={16} /></>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Didn't receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-slate-400">
                    Resend in <span className="font-semibold text-[#0d1f3c]">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  >
                    Resend Code
                  </button>
                )}
              </p>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'new_password' && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} className="text-yellow-500" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0d1f3c]">Create New Password</h3>
                <p className="text-sm text-slate-500 mt-1.5">
                  Your identity is verified. Set a strong new password for your account.
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">New Password</label>
                <div
                  className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all ${
                    passwordError
                      ? 'border-red-400 ring-2 ring-red-400/20' :'border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20'
                  }`}
                >
                  <Lock size={16} className="text-slate-400 shrink-0" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(validatePassword(e.target.value));
                    }}
                    placeholder="············"
                    className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                    {passwordError}
                  </p>
                )}
                {/* Strength bar */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className={`text-xs mt-1 font-semibold ${
                      strength.label === 'Weak' ? 'text-red-400' :
                      strength.label === 'Fair' ? 'text-yellow-500' :
                      strength.label === 'Good' ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {strength.label} password
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1.5">Min. 8 chars, one uppercase, one number.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm New Password</label>
                <div
                  className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all ${
                    confirmError
                      ? 'border-red-400 ring-2 ring-red-400/20'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-green-400 ring-2 ring-green-400/20' :'border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20'
                  }`}
                >
                  <Lock size={16} className="text-slate-400 shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError(e.target.value !== newPassword ? 'Passwords do not match.' : '');
                    }}
                    placeholder="············"
                    className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
                    {confirmError}
                  </p>
                )}
                {confirmPassword && confirmPassword === newPassword && !confirmError && (
                  <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSetPassword}
                disabled={isLoadingPassword}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1f3c] font-bold py-3.5 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] shadow-md shadow-yellow-400/30"
              >
                {isLoadingPassword ? (
                  <><Spinner /> Updating Password…</>
                ) : (
                  <>Set New Password <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0d1f3c]">Password Updated!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your password has been reset successfully. You can now log in with your new credentials.
              </p>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">Redirecting to login…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

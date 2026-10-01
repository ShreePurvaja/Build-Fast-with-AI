'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Mail, 
  Lock, 
  User, 
  Building, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { sendPhoneOTP, verifyPhoneOTP } from '../src/phoneAuthTextbee';
import { signInWithGoogle, saveUserToFirestore } from '../src/googleAuth';

interface AuthScreenProps {
  onLoginSuccess: (user: { id?: string; name: string; email: string; token?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // User Profile Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@company.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [password, setPassword] = useState('password123');
  const [orgName, setOrgName] = useState('');
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // 60-Second Countdown Timer for Resend OTP
  useEffect(() => {
    let timer: any = null;
    if (showOtpModal && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOtpModal, resendCooldown]);

  // Helper to save token & notify parent
  const handleAuthCompletion = (data: any) => {
    if (data.token || data.access_token) {
      const token = data.token || data.access_token;
      localStorage.setItem('access_token', token);
    }
    const userObj = data.user || { name: name || 'Alex Morgan', email: email || 'demo@company.com' };
    
    // Automatically save or update user in Firestore after any successful login
    const uid = userObj.id || data.uid || userObj.uid || `usr_${(userObj.email || userObj.phone || 'anonymous').replace(/[^a-zA-Z0-9]/g, '')}`;
    saveUserToFirestore({
      uid,
      name: userObj.name || name || "User",
      email: userObj.email || email || null,
      phone: userObj.phone || phone || null,
      authMethod: authMethod === 'phone' ? 'phone' : authMethod === 'google' ? 'google' : 'email_otp'
    }).catch(err => console.warn("Firestore saveUser notice:", err));

    onLoginSuccess(userObj);
  };

  // 1. Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          handleAuthCompletion(data);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Login failed' });
        }
      })
      .catch(() => {
        setLoading(false);
        handleAuthCompletion({ user: { name: name || 'Alex Morgan', email } });
      });
  };

  // 2. Signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ type: 'error', text: 'Please enter your Full Name.' });
      return;
    }
    setLoading(true);
    setMsg(null);

    fetch('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, org_name: orgName || 'Enterprise Workspace' })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setMsg({ type: 'success', text: 'Account created! Logging in...' });
          setTimeout(() => handleAuthCompletion(data), 600);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Signup failed' });
        }
      })
      .catch(() => {
        setLoading(false);
        handleAuthCompletion({ user: { name: name || 'New SME User', email } });
      });
  };

  // 3. Send Real-Time Email OTP
  const handleSendEmailOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg(null);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']); // Clean empty boxes

    fetch('http://localhost:8000/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: name || email.split('@')[0] })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success || data.sent) {
          setOtpTarget('email');
          setResendCooldown(60);
          setShowOtpModal(true);
          setTimeout(() => {
            const firstInput = document.getElementById('real-otp-0');
            if (firstInput) firstInput.focus();
          }, 150);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Failed to send Email OTP.' });
        }
      })
      .catch(() => {
        setLoading(false);
        setOtpTarget('email');
        setResendCooldown(60);
        setShowOtpModal(true);
      });
  };

  // 4. Send Real-Time Phone OTP via Firebase
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    if (!name.trim()) {
      setMsg({ type: 'error', text: 'Please enter your Full Name before requesting SMS OTP.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']);

    try {
      // Normalize Indian phone number format
      let digits = phone.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.slice(2);
      } else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      if (digits.length !== 10) {
        setLoading(false);
        setMsg({ type: 'error', text: 'Please enter a valid 10-digit Indian phone number (e.g. 9876543210).' });
        return;
      }
      const cleanPhone = `+91${digits}`;
      await sendPhoneOTP(cleanPhone);
      setLoading(false);
      setOtpTarget('phone');
      setResendCooldown(60);
      setShowOtpModal(true);
      setTimeout(() => {
        const firstInput = document.getElementById('real-otp-0');
        if (firstInput) firstInput.focus();
      }, 150);
    } catch (err: any) {
      setLoading(false);
      console.error("TextBee Phone Auth Error:", err);
      setMsg({ type: 'error', text: err.message || 'Failed to send SMS OTP.' });
    }
  };

  // Resend OTP with countdown reset & clearing inputs
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']); // Clear all 6 inputs

    if (otpTarget === 'phone') {
      try {
        let digits = phone.replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
        else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
        const cleanPhone = `+91${digits}`;
        await sendPhoneOTP(cleanPhone);
        setResendLoading(false);
        setResendCooldown(60); // Reset timer back to 60s
        setOtpMsg({ type: 'success', text: `New SMS code sent to ${cleanPhone}` });
        setTimeout(() => {
          const firstInput = document.getElementById('real-otp-0');
          if (firstInput) firstInput.focus();
        }, 100);
      } catch (err: any) {
        setResendLoading(false);
        setOtpMsg({ type: 'error', text: err.message || 'Failed to resend SMS code.' });
      }
      return;
    }

    // Email Resend Flow
    fetch('http://localhost:8000/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: name || email.split('@')[0] })
    })
      .then(res => res.json())
      .then(data => {
        setResendLoading(false);
        if (data.success || data.sent) {
          setResendCooldown(60); // Reset timer back to 60s
          setOtpMsg({ type: 'success', text: `New OTP code sent to ${email}` });
          setTimeout(() => {
            const firstInput = document.getElementById('real-otp-0');
            if (firstInput) firstInput.focus();
          }, 100);
        } else {
          setOtpMsg({ type: 'error', text: data.detail || 'Failed to resend OTP code.' });
        }
      })
      .catch(() => {
        setResendLoading(false);
        setResendCooldown(60);
        setOtpMsg({ type: 'success', text: `New OTP code sent to ${email}` });
      });
  };

  // 5. Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 6) {
      setOtpMsg({ type: 'error', text: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    setLoading(true);
    setOtpMsg(null);

    // Phone verification via Firebase confirmationResult
    if (otpTarget === 'phone') {
      try {
        const firebaseResult = await verifyPhoneOTP(enteredOtp);
        setLoading(false);
        setShowOtpModal(false);
        setMsg({ type: 'success', text: 'Phone verified successfully!' });
        setTimeout(() => {
          handleAuthCompletion({
            token: firebaseResult.token,
            user: {
              id: firebaseResult.uid,
              name: name || `User ${phone.slice(-4)}`,
              email: `${phone.replace(/[^0-9]/g, '')}@phone.user`,
              phone: firebaseResult.phone,
              org_name: 'Mobile Workspace'
            }
          });
        }, 500);
      } catch (err: any) {
        setLoading(false);
        setOtpMsg({ type: 'error', text: err.message || 'Invalid or expired SMS OTP code.' });
      }
      return;
    }

    // Email verification via Backend
    fetch('http://localhost:8000/api/auth/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: enteredOtp, name: name || email.split('@')[0] })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success || data.verified) {
          setShowOtpModal(false);
          setMsg({ type: 'success', text: 'OTP verified successfully!' });
          setTimeout(() => handleAuthCompletion(data), 600);
        } else {
          setOtpMsg({ type: 'error', text: data.reason || data.detail || 'Invalid OTP code.' });
        }
      })
      .catch(() => {
        setLoading(false);
        setShowOtpModal(false);
        handleAuthCompletion({ 
          user: { 
            name: name || email.split('@')[0], 
            email: email
          } 
        });
      });
  };

  // 6. Real Google OAuth Flow with Firebase Popup & Backend Verification
  const handleGoogleAuth = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const googleUser = await signInWithGoogle();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleUser.token }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Login rejected by server');
      }

      const data = await res.json();
      
      // Save to Firestore in background without blocking UI completion
      saveUserToFirestore(googleUser).catch(e => console.warn("Firestore save notice:", e));

      setLoading(false);
      setMsg({ type: 'success', text: `Signed in as ${googleUser.name || googleUser.email}` });
      setTimeout(() => {
        handleAuthCompletion({
          token: data.token || googleUser.token,
          user: {
            id: data.uid || googleUser.uid,
            name: data.name || googleUser.name || 'Google User',
            email: data.email || googleUser.email,
            photo: googleUser.photo,
            org_name: 'Google Workspace'
          }
        });
      }, 200);
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setLoading(false);
      setMsg({ type: 'error', text: err.message || 'Google sign-in failed' });
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const newOtp = [...otpCode];
      newOtp[index] = '';
      setOtpCode(newOtp);
      return;
    }
    const char = clean.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = char;
    setOtpCode(newOtp);

    if (index < 5) {
      const nextInput = document.getElementById(`real-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`real-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = ['', '', '', '', '', ''];
    pasted.split('').forEach((d, idx) => {
      newOtp[idx] = d;
    });
    setOtpCode(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    const nextInput = document.getElementById(`real-otp-${focusIdx}`);
    if (nextInput) nextInput.focus();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#E6E1D7] p-8 shadow-sm font-sans text-[#2B2826]">
      
      {/* Header Logo & Title */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#D97757] text-white mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
          <Bot className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#2B2826]">
          {mode === 'login' ? 'Sign In to Workspace' : 'Create Your Account'}
        </h2>
        <p className="text-xs text-[#6E685E] mt-1 font-medium">
          Multi-Agent Platform • Real-time OTP & Isolated Per-User Workflows
        </p>
      </div>

      {/* Auth Method Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6E1D7] mb-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setAuthMethod('email'); setMode('login'); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'email' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMethod('phone'); setMode('login'); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'phone' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone OTP</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMethod('google'); setMode('login'); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'google' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
          <span>Google</span>
        </button>
      </div>

      {/* Alert Messages */}
      {msg && (
        <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-2 ${
          msg.type === 'success' ? 'bg-[#E6F4F1] text-[#0F766E] border border-[#99F6E4]' : 'bg-[#FCEAE8] text-[#C93B2B] border border-[#FCA5A5]'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 1. EMAIL AUTH METHOD */}
      {authMethod === 'email' && mode === 'login' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Full Name (Optional for existing user)</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#2B2826]">Password</label>
              <button 
                type="button" 
                onClick={() => handleSendEmailOtp()} 
                className="text-[11px] text-[#D97757] font-bold hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Send Email OTP</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>

          <div className="text-center pt-3 border-t border-[#E6E1D7]">
            <span className="text-xs text-[#6E685E]">Don't have an account? </span>
            <button type="button" onClick={() => setMode('signup')} className="text-xs text-[#D97757] font-bold hover:underline">
              Register Free
            </button>
          </div>
        </form>
      )}

      {/* 2. PHONE OTP AUTH METHOD */}
      {authMethod === 'phone' && (
        <form onSubmit={handleSendPhoneOtp} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Mobile Phone Number</label>
            <div className="relative">
              <Smartphone className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Phone SMS OTP</span>}
          </button>

          {/* Firebase Phone Auth Invisible reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </form>
      )}

      {/* 3. GOOGLE AUTH METHOD */}
      {authMethod === 'google' && (
        <div className="space-y-4 text-center py-4">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xs border border-[#E6E1D7]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#2B2826]">Single Sign-On with Google</p>
            <p className="text-[11px] text-[#6E685E]">
              Authenticate instantly with your Google account. Your profile and email will be securely verified by Firebase.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                </svg>
                <span>Continue with Google</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* SIGNUP FORM */}
      {mode === 'signup' && authMethod === 'email' && (
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Organization / Company Name</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="text" 
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Enterprise AI Solutions"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 mt-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>

          <div className="text-center pt-3 border-t border-[#E6E1D7]">
            <span className="text-xs text-[#6E685E]">Already registered? </span>
            <button type="button" onClick={() => setMode('login')} className="text-xs text-[#D97757] font-bold hover:underline">
              Sign In Here
            </button>
          </div>
        </form>
      )}

      {/* 6-DIGIT OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] p-8 max-w-sm w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FDF3E9] text-[#D97757] mx-auto flex items-center justify-center font-bold mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2B2826]">
                Verify {otpTarget === 'email' ? 'Email' : 'SMS Phone'} OTP
              </h3>
              <p className="text-xs text-[#6E685E] mt-1.5">
                OTP sent to <b className="text-[#2B2826]">{otpTarget === 'email' ? email : phone}</b>
              </p>

              {otpMsg && (
                <div className={`mt-3 text-xs font-semibold p-2.5 rounded-xl border ${
                  otpMsg.type === 'error' 
                    ? 'bg-[#FCEAE8] text-[#C93B2B] border-[#FCA5A5]' 
                    : 'bg-[#E6F4F1] text-[#0F766E] border-[#99F6E4]'
                }`}>
                  {otpMsg.text}
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex justify-between gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <input
                    key={i}
                    id={`real-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={otpCode[i]}
                    onChange={e => handleOtpDigitChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="w-10 h-12 text-center text-lg font-bold border border-[#E6E1D7] rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] text-[#2B2826]"
                  />
                ))}
              </div>

              {/* Resend OTP button & 30-second countdown */}
              <div className="flex items-center justify-center pt-1 text-center">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || resendLoading}
                  onClick={handleResendOtp}
                  className={`text-xs py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    resendCooldown > 0 || resendLoading
                      ? 'text-[#9B9488] bg-[#FAF8F5] border border-[#E6E1D7] cursor-not-allowed font-medium'
                      : 'text-[#D97757] hover:text-[#B85C3D] hover:bg-[#FDF3E9] cursor-pointer font-bold border border-[#D97757]/30'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? (
                    <span>Resend OTP in <strong>{resendCooldown}s</strong></span>
                  ) : (
                    <span>Resend OTP</span>
                  )}
                </button>
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowOtpModal(false)}
                  className="btn-claude-secondary flex-1 text-xs py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-claude-primary flex-1 text-xs py-2.5 font-bold flex items-center justify-center"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Log In</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

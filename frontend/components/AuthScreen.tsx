'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Mail, 
  User, 
  Building, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { sendPhoneOTP, verifyPhoneOTP } from '../src/phoneAuthTextbee';
import { signInWithGoogle, saveUserToFirestore } from '../src/googleAuth';

interface AuthScreenProps {
  onLoginSuccess: (user: { id?: string; name: string; email: string; token?: string; org_name?: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // User Profile Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [orgName, setOrgName] = useState('');
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string; action?: 'to_login' | 'to_signup' } | null>(null);
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
    const userObj = data.user || { 
      name: name || 'User', 
      email: email || (phone ? `${phone.replace(/[^0-9]/g, '')}@phone.user` : 'user@company.com'),
      org_name: orgName || 'Enterprise Workspace'
    };
    
    // Automatically save or update user in Firestore after any successful passwordless auth
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

  // 1. Send Passwordless Real-Time Email OTP (Sign In or Create Account)
  const handleSendEmailOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setMsg({ type: 'error', text: 'Please enter your Full Name.' });
        return;
      }
      if (!orgName.trim()) {
        setMsg({ type: 'error', text: 'Please enter your Organization / Company Name.' });
        return;
      }
    }

    setLoading(true);
    setMsg(null);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']);

    fetch('http://localhost:8000/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: cleanEmail, 
        name: name.trim() || cleanEmail.split('@')[0],
        org_name: orgName.trim() || 'AI Workspace',
        mode: mode
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.exists) {
          setMsg({ 
            type: 'error', 
            text: data.detail || 'An account with this email already exists. Please sign in instead.',
            action: 'to_login'
          });
          return;
        }
        if (data.not_found) {
          setMsg({ 
            type: 'error', 
            text: data.detail || 'No account found with this email. Please create an account first.',
            action: 'to_signup'
          });
          return;
        }

        if (data.success || data.sent) {
          setOtpTarget('email');
          setResendCooldown(60);
          setShowOtpModal(true);
          setTimeout(() => {
            const firstInput = document.getElementById('real-otp-0');
            if (firstInput) firstInput.focus();
          }, 150);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Failed to send Email OTP. Please check the email.' });
        }
      })
      .catch((err) => {
        setLoading(false);
        setMsg({ type: 'error', text: 'Server connection error. Please ensure backend is running.' });
      });
  };

  // 2. Send Passwordless Phone OTP via TextBee/Firebase
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    if (mode === 'signup') {
      if (!name.trim()) {
        setMsg({ type: 'error', text: 'Please enter your Full Name.' });
        return;
      }
      if (!orgName.trim()) {
        setMsg({ type: 'error', text: 'Please enter your Organization / Company Name.' });
        return;
      }
    }

    setLoading(true);
    setMsg(null);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']);

    try {
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
      
      await sendPhoneOTP(cleanPhone, {
        mode,
        name: name.trim(),
        org_name: orgName.trim()
      });

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
      console.error("Phone Auth Error:", err);
      const errMsg = err.message || 'Failed to send SMS OTP.';
      if (errMsg.includes('already exists')) {
        setMsg({ type: 'error', text: errMsg, action: 'to_login' });
      } else if (errMsg.includes('No account found')) {
        setMsg({ type: 'error', text: errMsg, action: 'to_signup' });
      } else {
        setMsg({ type: 'error', text: errMsg });
      }
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpMsg(null);
    setOtpCode(['', '', '', '', '', '']);

    if (otpTarget === 'phone') {
      try {
        let digits = phone.replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
        else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
        const cleanPhone = `+91${digits}`;
        await sendPhoneOTP(cleanPhone, { mode, name: name.trim(), org_name: orgName.trim() });
        setResendLoading(false);
        setResendCooldown(60);
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

    // Email Resend
    fetch('http://localhost:8000/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        name: name.trim() || email.split('@')[0],
        org_name: orgName.trim() || 'AI Workspace',
        mode: mode
      })
    })
      .then(res => res.json())
      .then(data => {
        setResendLoading(false);
        if (data.success || data.sent) {
          setResendCooldown(60);
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
        setOtpMsg({ type: 'error', text: 'Network error resending OTP.' });
      });
  };

  // 3. Verify OTP Code (Passwordless Login & Signup completion)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 6) {
      setOtpMsg({ type: 'error', text: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    setLoading(true);
    setOtpMsg(null);

    // Phone verification
    if (otpTarget === 'phone') {
      try {
        let digits = phone.replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
        else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
        const cleanPhone = `+91${digits}`;

        const firebaseResult = await verifyPhoneOTP(enteredOtp, cleanPhone, {
          name: name.trim(),
          org_name: orgName.trim(),
          mode
        });
        setLoading(false);
        setShowOtpModal(false);
        setMsg({ type: 'success', text: mode === 'signup' ? 'Phone verified! Account created.' : 'Phone verified! Logging in...' });
        setTimeout(() => {
          handleAuthCompletion({
            token: firebaseResult.token,
            user: firebaseResult.user || {
              id: firebaseResult.uid,
              name: name || `User ${cleanPhone.slice(-4)}`,
              email: `${cleanPhone.replace(/[^0-9]/g, '')}@phone.user`,
              phone: firebaseResult.phone,
              org_name: orgName || 'Mobile Workspace'
            }
          });
        }, 500);
      } catch (err: any) {
        setLoading(false);
        setOtpMsg({ type: 'error', text: err.message || 'Invalid or expired SMS OTP code.' });
      }
      return;
    }

    // Email verification
    fetch('http://localhost:8000/api/auth/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        otp: enteredOtp, 
        name: name.trim() || email.split('@')[0],
        org_name: orgName.trim() || 'AI Workspace',
        mode
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success || data.verified) {
          setShowOtpModal(false);
          setMsg({ type: 'success', text: mode === 'signup' ? 'Account verified and created!' : 'OTP verified! Logging in...' });
          setTimeout(() => handleAuthCompletion(data), 500);
        } else {
          setOtpMsg({ type: 'error', text: data.reason || data.detail || 'Invalid OTP code.' });
        }
      })
      .catch(() => {
        setLoading(false);
        setOtpMsg({ type: 'error', text: 'Server error while verifying OTP.' });
      });
  };

  // 4. One-Click Passwordless Google OAuth Flow
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
      
      saveUserToFirestore(googleUser).catch(e => console.warn("Firestore save notice:", e));

      setLoading(false);
      setMsg({ type: 'success', text: `Verified as ${googleUser.name || googleUser.email}` });
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
      setMsg({ type: 'error', text: err.message || 'Google authentication failed' });
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
          Multi-Agent Platform • 100% Passwordless Real-Time OTP Verification
        </p>
      </div>

      {/* Mode Switcher Tabs (Sign In vs Create Account) */}
      <div className="flex bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6E1D7] mb-5 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setMode('login'); setMsg(null); }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'login' 
              ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' 
              : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setMsg(null); }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'signup' 
              ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' 
              : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Auth Method Tabs (Email OTP vs Phone OTP vs Google) */}
      <div className="grid grid-cols-3 gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6E1D7] mb-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setAuthMethod('email'); setMsg(null); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'email' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMethod('phone'); setMsg(null); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'phone' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone OTP</span>
        </button>

        <button
          type="button"
          onClick={() => { setAuthMethod('google'); setMsg(null); }}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            authMethod === 'google' ? 'bg-white text-[#D97757] shadow-2xs border border-[#E6E1D7]' : 'text-[#6E685E] hover:text-[#2B2826]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
          <span>Google</span>
        </button>
      </div>

      {/* Alert Messages with Smart Action Button (e.g. Switch to Sign In if already exists) */}
      {msg && (
        <div className={`p-3.5 rounded-2xl mb-4 text-xs font-semibold flex flex-col gap-2 ${
          msg.type === 'success' ? 'bg-[#E6F4F1] text-[#0F766E] border border-[#99F6E4]' : 'bg-[#FCEAE8] text-[#C93B2B] border border-[#FCA5A5]'
        }`}>
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="leading-snug">{msg.text}</span>
          </div>

          {msg.action === 'to_login' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setMsg(null); }}
              className="mt-1 self-start bg-white px-3 py-1.5 rounded-lg border border-[#FCA5A5] text-[#C93B2B] hover:bg-[#FCEAE8] font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
            >
              <span>Click Here to Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {msg.action === 'to_signup' && (
            <button
              type="button"
              onClick={() => { setMode('signup'); setMsg(null); }}
              className="mt-1 self-start bg-white px-3 py-1.5 rounded-lg border border-[#FCA5A5] text-[#C93B2B] hover:bg-[#FCEAE8] font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
            >
              <span>Click Here to Create Account</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* 1. EMAIL AUTH METHOD (100% PASSWORDLESS OTP) */}
      {authMethod === 'email' && (
        <form onSubmit={handleSendEmailOtp} className="space-y-4">
          
          {/* Full Name & Organization (Only for Account Creation) */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Full Name</label>
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
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Organization / Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Innovations"
                    className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-[11px] text-[#6E685E] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D97757] shrink-0" />
            <span>
              {mode === 'signup' 
                ? 'We will send a 6-digit OTP code to verify your email ownership.'
                : 'A secure 6-digit code will be sent to your email. No password needed.'}
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
              <span>{mode === 'signup' ? 'Verify & Create Account' : 'Send Sign-In Code'}</span>
            )}
          </button>

          <div className="text-center pt-3 border-t border-[#E6E1D7]">
            {mode === 'login' ? (
              <>
                <span className="text-xs text-[#6E685E]">Don't have an account? </span>
                <button type="button" onClick={() => { setMode('signup'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Create Account Free
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-[#6E685E]">Already registered? </span>
                <button type="button" onClick={() => { setMode('login'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Sign In Here
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* 2. PHONE OTP AUTH METHOD (100% PASSWORDLESS) */}
      {authMethod === 'phone' && (
        <form onSubmit={handleSendPhoneOtp} className="space-y-4">
          
          {/* Full Name & Organization (Only for Account Creation) */}
          {mode === 'signup' && (
            <>
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
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Organization / Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-[#9B9488]" />
                  <input 
                    type="text" 
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Innovations"
                    className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[#2B2826] block mb-1">Mobile Phone Number (India)</label>
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

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-[11px] text-[#6E685E] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D97757] shrink-0" />
            <span>
              {mode === 'signup' 
                ? 'We will send a 6-digit SMS verification code to verify this phone number.'
                : 'A 6-digit SMS login code will be delivered instantly to your phone.'}
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
              <span>{mode === 'signup' ? 'Verify & Create Account' : 'Send Phone SMS OTP'}</span>
            )}
          </button>

          <div className="text-center pt-3 border-t border-[#E6E1D7]">
            {mode === 'login' ? (
              <>
                <span className="text-xs text-[#6E685E]">Don't have an account? </span>
                <button type="button" onClick={() => { setMode('signup'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Create Account Free
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-[#6E685E]">Already registered? </span>
                <button type="button" onClick={() => { setMode('login'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Sign In Here
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* 3. GOOGLE AUTH METHOD (100% PASSWORDLESS 1-CLICK) */}
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
            <p className="text-xs font-bold text-[#2B2826]">
              {mode === 'signup' ? 'Create Account with Google' : 'Sign In with Google'}
            </p>
            <p className="text-[11px] text-[#6E685E]">
              Zero passwords required. Your verified Google identity creates or accesses your secure workspace instantly.
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

          <div className="text-center pt-3 border-t border-[#E6E1D7]">
            {mode === 'login' ? (
              <>
                <span className="text-xs text-[#6E685E]">Need a new account? </span>
                <button type="button" onClick={() => { setMode('signup'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Create Account
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-[#6E685E]">Already registered? </span>
                <button type="button" onClick={() => { setMode('login'); setMsg(null); }} className="text-xs text-[#D97757] font-bold hover:underline">
                  Sign In Here
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 6-DIGIT REAL-TIME OTP VERIFICATION MODAL */}
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
                {mode === 'signup' ? 'Verify originality code sent to ' : 'Login code sent to '}
                <b className="text-[#2B2826]">{otpTarget === 'email' ? email : phone}</b>
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

              {/* Resend OTP button with 60-second countdown */}
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
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                    <span>{mode === 'signup' ? 'Verify & Register' : 'Verify & Log In'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

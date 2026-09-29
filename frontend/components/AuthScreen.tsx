'use client';

import React, { useState } from 'react';
import { Bot, Mail, Lock, User, Building, KeyRound, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Form States
  const [email, setEmail] = useState('demo@company.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
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
          onLoginSuccess(data.user);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Login failed' });
        }
      })
      .catch(() => {
        // Fallback for offline API
        setLoading(false);
        onLoginSuccess({ name: name || 'Alex Morgan', email });
      });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    fetch('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, org_name: orgName })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setMsg({ type: 'success', text: 'Account created successfully! Logging in...' });
          setTimeout(() => onLoginSuccess(data.user), 1000);
        } else {
          setMsg({ type: 'error', text: data.detail || 'Signup failed' });
        }
      })
      .catch(() => {
        setLoading(false);
        onLoginSuccess({ name: name || 'New SME User', email });
      });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    fetch('http://localhost:8000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setGeneratedOtp(data.otp_demo || '123456');
          setShowOtpModal(true);
        } else {
          setMsg({ type: 'error', text: 'Failed to send OTP.' });
        }
      })
      .catch(() => {
        setLoading(false);
        setGeneratedOtp('482910');
        setShowOtpModal(true);
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    setLoading(true);

    fetch('http://localhost:8000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: enteredOtp, new_password: newPassword })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setShowOtpModal(false);
          setMode('login');
          setMsg({ type: 'success', text: 'Password reset successfully! Please sign in.' });
        } else {
          setMsg({ type: 'error', text: data.detail || 'Invalid OTP code.' });
        }
      })
      .catch(() => {
        setLoading(false);
        setShowOtpModal(false);
        setMode('login');
        setMsg({ type: 'success', text: 'OTP verified (offline)! Please sign in.' });
      });
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input field
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E6E1D7] p-8 shadow-sm">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#D97757] text-white mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
            <Bot className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#2B2826]">
            {mode === 'login' && 'Sign in to AI Workforce'}
            {mode === 'signup' && 'Create Your SME Workspace'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#6E685E] mt-1 font-medium">
            {mode === 'login' && 'Manage your Indic voice & multi-agent automation platform'}
            {mode === 'signup' && 'Get started with plain-language AI worker generation'}
            {mode === 'forgot' && 'Enter your account email to receive a 6-digit OTP code'}
          </p>
        </div>

        {/* Status Alerts */}
        {msg && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-2 ${
            msg.type === 'success' ? 'bg-[#E6F4F1] text-[#0F766E] border border-[#99F6E4]' : 'bg-[#FCEAE8] text-[#C93B2B] border border-[#FCA5A5]'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
                <button type="button" onClick={() => setMode('forgot')} className="text-[11px] text-[#D97757] font-semibold hover:underline">
                  Forgot Password?
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
              className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2"
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

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
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
              <label className="text-xs font-bold text-[#2B2826] block mb-1">Create Password</label>
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
              className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Workspace</span>}
            </button>

            <div className="text-center pt-3 border-t border-[#E6E1D7]">
              <span className="text-xs text-[#6E685E]">Already registered? </span>
              <button type="button" onClick={() => setMode('login')} className="text-xs text-[#D97757] font-bold hover:underline">
                Sign In Here
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2B2826] block mb-1">Registered Email Address</label>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-claude-primary text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send 6-Digit OTP</span>}
            </button>

            <div className="text-center pt-3 border-t border-[#E6E1D7]">
              <button type="button" onClick={() => setMode('login')} className="text-xs text-[#6E685E] font-semibold hover:underline">
                ← Back to Login
              </button>
            </div>
          </form>
        )}

      </div>

      {/* 6-DIGIT OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] p-8 max-w-sm w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FDF3E9] text-[#D97757] mx-auto flex items-center justify-center font-bold mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-[#2B2826]">Verify OTP Code</h3>
              <p className="text-xs text-[#6E685E] mt-1">
                Enter the 6-digit OTP code sent to <b>{email}</b>
              </p>
              {generatedOtp && (
                <div className="mt-2 bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold py-1 px-3 rounded-lg border border-[#FDE68A]">
                  Demo OTP Code: <b>{generatedOtp}</b>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6-Digit OTP Inputs */}
              <div className="flex justify-between gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[i]}
                    onChange={e => handleOtpDigitChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-bold border border-[#E6E1D7] rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  />
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowOtpModal(false)}
                  className="btn-claude-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-claude-primary flex-1 text-xs py-2 font-bold"
                >
                  Confirm & Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

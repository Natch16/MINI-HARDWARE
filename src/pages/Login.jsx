import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authController } from '../controllers/userController.js';
import logoImg from '/logo-hardware.png';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (authController.isLoggedIn()) {
      navigate('/account');
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Please enter your email.';
    if (!password) newErrors.password = 'Please enter your password.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setGeneralError('');
    const result = authController.login({ email: email.trim(), password });
    if (!result.ok) {
      setGeneralError(result.error);
      return;
    }

    setSuccess(true);
    const next = searchParams.get('next') || '/account';
    setTimeout(() => navigate(next), 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-[#f0f4f0]">
      <div className="bg-white rounded-[18px] border-[3px] border-green shadow-[0_8px_32px_rgba(0,75,35,0.13)] p-7 sm:p-8 w-full max-w-[480px] text-center">

        {/* Logo */}
        {!logoError ? (
          <img
            src={logoImg}
            alt="JUDY'S Mini Hardware Logo"
            className="w-[280px] max-w-[90%] h-auto mx-auto mb-1 block object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="text-[1.1rem] font-extrabold text-forest mb-2.5">
            <i className="fa-solid fa-screwdriver-wrench text-green mr-1.5" />
            JUDY&apos;S Mini Hardware
          </div>
        )}

        <h1 className="text-forest text-[1.75rem] font-extrabold mb-1.5">Welcome Back!</h1>
        <p className="text-green text-[0.92rem] font-semibold mb-7 leading-relaxed">
          Sign in to your account to place<br />orders and track deliveries.
        </p>

        {/* Success banner */}
        {success && (
          <div className="bg-[#e8f5e9] border border-green text-forest rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-3.5 text-left">
            ✅ Signed in! Taking you to your account...
          </div>
        )}

        {/* General error */}
        {generalError && (
          <div className="bg-[#fce4ec] text-[#c62828] rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-3.5 text-left">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5">
            Email Address
          </label>
          <div className="relative mb-4">
            <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-[42px] pr-11 py-3 border-2 border-[#ccc] rounded-[10px] text-[0.97rem] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus:border-green transition-colors"
            />
          </div>
          {errors.email && (
            <p className="text-left text-[#cc0000] text-[0.8rem] -mt-3 mb-2.5">{errors.email}</p>
          )}

          {/* Password */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5">
            Password
          </label>
          <div className="relative mb-4">
            <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-[42px] pr-11 py-3 border-2 border-[#ccc] rounded-[10px] text-[0.97rem] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus:border-green transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label="Show/Hide password"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[#999] text-[1.1rem] p-1.5 rounded-full flex items-center justify-center hover:text-green hover:bg-green/10 transition-colors"
            >
              <i className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
            </button>
          </div>
          {errors.password && (
            <p className="text-left text-[#cc0000] text-[0.8rem] -mt-3 mb-2.5">{errors.password}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-forest text-white rounded-[10px] font-extrabold text-base uppercase tracking-[1.5px] hover:bg-green transition-colors shadow-[0_4px_14px_rgba(0,75,35,0.25)] mt-2 cursor-pointer border-0"
          >
            LOGIN
          </button>
        </form>

        <hr className="border-0 border-t border-[#e0e0e0] my-5 sm:my-6" />

        <p className="text-[0.9rem] text-dark font-semibold">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-green font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

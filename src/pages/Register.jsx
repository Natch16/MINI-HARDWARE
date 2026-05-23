import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authController } from '../controllers/userController.js';
import logoImg from '/logo-hardware.png';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!name.trim())        newErrors.name     = 'Full name is required.';
    if (!email.trim())       newErrors.email    = 'Please enter a valid email.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirm) newErrors.confirm = 'Passwords do not match.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setGeneralError('');
    const result = authController.register({ name: name.trim(), email: email.trim(), password });
    if (!result.ok) {
      setGeneralError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/account'), 600);
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

        <h1 className="text-forest text-[1.75rem] font-extrabold mb-1.5">Create Account</h1>
        <p className="text-green text-[0.92rem] font-semibold mb-7 leading-relaxed">
          Register to place orders and<br />track your deliveries.
        </p>

        {/* Success banner */}
        {success && (
          <div className="bg-[#e8f5e9] border border-green text-forest rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-3.5 text-left">
            ✅ Account created! Taking you to your dashboard...
          </div>
        )}

        {/* General error */}
        {generalError && (
          <div className="bg-[#fce4ec] text-[#c62828] rounded-lg px-3.5 py-2.5 text-[0.88rem] mb-3.5 text-left">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5">
            Full Name
          </label>
          <div className="relative mb-1">
            <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              className="w-full pl-[42px] pr-11 py-3 border-2 border-[#ccc] rounded-[10px] text-[0.97rem] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus:border-green transition-colors"
            />
          </div>
          {errors.name && (
            <p className="text-left text-[#cc0000] text-[0.8rem] mb-2.5">{errors.name}</p>
          )}

          {/* Email */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5 mt-3">
            Email Address
          </label>
          <div className="relative mb-1">
            <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full pl-[42px] pr-11 py-3 border-2 border-[#ccc] rounded-[10px] text-[0.97rem] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus:border-green transition-colors"
            />
          </div>
          {errors.email && (
            <p className="text-left text-[#cc0000] text-[0.8rem] mb-2.5">{errors.email}</p>
          )}

          {/* Password */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5 mt-3">
            Password
          </label>
          <div className="relative mb-1">
            <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
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
            <p className="text-left text-[#cc0000] text-[0.8rem] mb-2.5">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <label className="block text-left font-bold text-[0.9rem] text-dark mb-1.5 mt-3">
            Confirm Password
          </label>
          <div className="relative mb-1">
            <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] text-base pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full pl-[42px] pr-11 py-3 border-2 border-[#ccc] rounded-[10px] text-[0.97rem] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] focus:outline-none focus:border-green transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(prev => !prev)}
              aria-label="Show/Hide confirm password"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[#999] text-[1.1rem] p-1.5 rounded-full flex items-center justify-center hover:text-green hover:bg-green/10 transition-colors"
            >
              <i className={`fa-regular ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`} />
            </button>
          </div>
          {errors.confirm && (
            <p className="text-left text-[#cc0000] text-[0.8rem] mb-2.5">{errors.confirm}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-forest text-white rounded-[10px] font-extrabold text-base uppercase tracking-[1.5px] hover:bg-green transition-colors shadow-[0_4px_14px_rgba(0,75,35,0.25)] mt-4 cursor-pointer border-0"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <hr className="border-0 border-t border-[#e0e0e0] my-5 sm:my-6" />

        <p className="text-[0.9rem] text-dark font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-green font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

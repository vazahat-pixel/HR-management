import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(email, password);

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }

        } catch (err) {
            setError('Failed to log in');
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Welcome Back</h2>
                <p className="text-zinc-500 mt-1.5 text-xs font-medium">Sign in to access your HR portal</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-lg text-center"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                        <HiOutlineMail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all font-medium text-sm"
                            placeholder="admin@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between ml-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                        <Link to="/auth/forgot-password" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">Forgot?</Link>
                    </div>
                    <div className="relative group">
                        <HiOutlineLockClosed className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all font-medium text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-bold text-sm rounded-xl shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                    {isLoading ? (
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign In
                            <HiOutlineArrowRight className="w-4 h-4" />
                        </>
                    )}
                </motion.button>
            </form>

            <div className="text-center mt-6">
                <p className="text-[11px] text-zinc-500 font-medium">
                    Don't have an account? <span onClick={() => alert("Dummy Action: Please contact your HR department to create an account.")} className="text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors">Contact HR</span>
                </p>
            </div>
        </div>
    );
};

export default Login;

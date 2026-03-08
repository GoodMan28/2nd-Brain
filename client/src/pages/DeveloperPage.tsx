import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CircuitBackground } from '../components/ui/CircuitBackground';
import { BACKEND_URL } from '../config';
export function DeveloperPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`${BACKEND_URL}/api/v1/contact`, formData);
            // await axios.post(`http://localhost:3000/api/v1/contact`, formData);

            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message. Please try again later or reach out via email directly.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] relative overflow-hidden flex flex-col font-sans">
            {/* Animated Circuit Board Background */}
            <CircuitBackground />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#6366F1]/10 blur-[120px] pointer-events-none" />

            {/* Header / Nav */}
            <header className="relative z-10 px-6 py-6 w-full max-w-4xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
                    <div className="p-2 rounded-full bg-[#1E293B] border border-slate-700/50 group-hover:bg-[#2D3748] transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-medium text-sm">Back to app</span>
                </Link>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 py-12 w-full max-w-3xl mx-auto">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center space-y-6 mb-16"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#6366F1] to-[#38BDF8] opacity-75 blur-md animate-pulse"></div>
                        <div className="relative w-32 h-32 rounded-full border-2 border-[#6366F1]/50 overflow-hidden bg-[#1E293B] flex items-center justify-center shadow-2xl">
                            <img src="/image.png" alt="Abhineet Anand" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Abhineet Anand</h1>
                        <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                            Full Stack Engineer & Productivity Enthusiast. Architecting digital ecosystems and Second Brain productivity workflows.
                        </p>
                    </div>

                    {/* Glassmorphic Social Links */}
                    <div className="flex gap-4 pt-2">
                        <a href="https://github.com/GoodMan28" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg text-slate-300 hover:text-white">
                            <Github size={22} />
                        </a>
                        <a href="https://www.linkedin.com/in/abhineet-anand-17403a279/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg text-slate-300 hover:text-[#0A66C2]">
                            <Linkedin size={22} />
                        </a>
                        <a href="mailto:abhineetanand91@gmail.com" className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg text-slate-300 hover:text-white">
                            <Mail size={22} />
                        </a>
                    </div>
                </motion.div>

                {/* Contact Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full"
                >
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-3xl blur opacity-30 pointer-events-none"></div>
                        <div className="relative bg-[#1E293B]/80 backdrop-blur-xl border border-slate-700/50 p-8 md:p-10 rounded-3xl shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 text-center">Want to connect for working together?</h2>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2 border border-green-500/30">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                                    <p className="text-slate-400">Thanks for reaching out. I'll get back to you soon.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-6 text-sm text-[#6366F1] hover:text-white underline transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#0F172A]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-[#0F172A]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1 uppercase tracking-wider">Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-[#0F172A]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-[#6366F1] transition-all resize-none"
                                            placeholder="What would you like to build together?"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#6366F1] hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#6366F1]/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

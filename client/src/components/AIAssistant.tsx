import { Send, Sparkles, Link } from 'lucide-react';

export function AIAssistant() {
    return (
        <aside className="w-80 h-screen fixed right-0 top-0 bg-white/80 backdrop-blur-xl border-l border-slate-200 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] flex flex-col z-30 hidden xl:flex">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <div className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-5 h-5 fill-indigo-100" />
                    <h2 className="font-bold text-lg">AI Assistant</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Welcome / Context */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-50">
                    <p className="text-sm text-slate-600 mb-3">
                        I'm analyzing your knowledge base. Here are some connections I found:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-200 transition-colors">
                            <Link className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">React & Scalability</h4>
                                <p className="text-xs text-slate-500 mt-1">Both mention "component composition" as a key factor.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-200 transition-colors">
                            <Link className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800">GenAI Patterns</h4>
                                <p className="text-xs text-slate-500 mt-1">Linked to your notes on "LLM Fine-tuning".</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area (Placeholder) */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">AI</div>
                        <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl rounded-tl-sm text-sm">
                            How can I help you connect your ideas today?
                        </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">Me</div>
                        <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-md shadow-indigo-200">
                            Find notes related to 'System Design'
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white/50">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ask your second brain..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg text-primary shadow-sm hover:shadow hover:bg-indigo-50 transition-all">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

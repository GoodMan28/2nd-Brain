import { Tags, Settings } from 'lucide-react';

export function TagsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
            <div className="bg-zinc-50 p-6 rounded-full mb-6 border border-zinc-100">
                <Tags className="w-12 h-12 text-zinc-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Tags Management</h2>
            <p className="text-zinc-500 max-w-md">Organize your taxonomy.</p>
        </div>
    );
}

export function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
            <div className="bg-zinc-50 p-6 rounded-full mb-6 border border-zinc-100">
                <Settings className="w-12 h-12 text-zinc-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Settings</h2>
            <p className="text-zinc-500 max-w-md">Customize your Second Brain experience.</p>
        </div>
    );
}

import React, { useState } from 'react';
import { X, Sliders, Key, Sparkles, Check, Cpu } from 'lucide-react';
import type { AISettings, AIProvider } from '../../types';
import { aiService, USER_GROQ_API_KEY } from '../../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsSaved }) => {
  const current = aiService.getSettings();
  const [provider, setProvider] = useState<AIProvider>(current.provider || 'groq');
  const [apiKey, setApiKey] = useState(current.apiKey || USER_GROQ_API_KEY);
  const [model, setModel] = useState(current.model || 'openai/gpt-oss-20b');
  const [temperature, setTemperature] = useState(current.temperature ?? 0.3);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AISettings = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || 'openai/gpt-oss-20b',
      temperature: Number(temperature),
      customEndpoint: provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : current.customEndpoint
    };
    aiService.saveSettings(updated);
    onSettingsSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleResetToDefault = () => {
    setProvider('groq');
    setApiKey(USER_GROQ_API_KEY);
    setModel('openai/gpt-oss-20b');
    setTemperature(0.3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-white">
                AI Service Settings
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by Groq High-Speed Cloud Inference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Provider Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">AI Provider</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('groq');
                  setModel('openai/gpt-oss-120b');
                  if (!apiKey) setApiKey(USER_GROQ_API_KEY);
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1 ${
                  provider === 'groq'
                    ? 'bg-orange-950/50 text-orange-300 border-orange-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="font-bold">⚡ Groq (Active)</span>
                <span className="text-[10px] text-slate-400">Ultra-Fast LPU</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4o-mini');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1 ${
                  provider === 'openai'
                    ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>OpenAI</span>
                <span className="text-[10px] text-slate-400">GPT-4o Mini</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider('demo');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1 ${
                  provider === 'demo'
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>Offline Demo</span>
                <span className="text-[10px] text-slate-400">Simulated AI</span>
              </button>
            </div>
          </div>

          {provider === 'demo' ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200/90 space-y-1">
              <span className="font-semibold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Demo Mode Active
              </span>
              <p className="text-[11px] text-slate-300">
                Responses are generated offline without calling external AI servers.
              </p>
            </div>
          ) : (
            <>
              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    API Key
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Restore Default Key
                  </button>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Model Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-orange-400" />
                  Model Selection
                </label>
                {provider === 'groq' ? (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setModel('openai/gpt-oss-20b')}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        model === 'openai/gpt-oss-20b'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-medium text-[11px] text-white flex items-center justify-between">
                        <span>gpt-oss-20b</span>
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-1 py-0.2 rounded">Recommended</span>
                      </div>
                      <div className="text-[10px] text-slate-400">High TPM & Ultra-Fast (20B)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModel('openai/gpt-oss-120b')}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        model === 'openai/gpt-oss-120b'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-medium text-[11px] text-white">gpt-oss-120b</div>
                      <div className="text-[10px] text-slate-400">Deep (8k TPM limit)</div>
                    </button>
                  </div>
                ) : null}
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. openai/gpt-oss-120b"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </>
          )}

          {/* Temperature */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Sampling Temperature</span>
              <span className="font-mono text-indigo-400">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sliders className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

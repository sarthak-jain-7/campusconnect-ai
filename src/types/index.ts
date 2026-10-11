export type PromptVersion = 'v1_original' | 'v2_improved';

export type AIProvider = 'groq' | 'openai' | 'gemini' | 'custom' | 'demo';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  reasoning?: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  activePromptVersion?: PromptVersion;
}

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature: number;
  customEndpoint?: string;
}

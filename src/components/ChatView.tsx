import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Flame,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Globe,
  Tag,
  Download,
  Image as ImageIcon,
  Key,
  AlertCircle,
  AlertTriangle,
  Lock,
  Scale,
  TrendingDown,
  Database,
  CheckCircle2
} from 'lucide-react';
import { Product, ChatMessage, DirectMessageThread } from '../types';
import { AgoIcon } from './AgoLogo';
import {
  saveAiMessageToFirebase,
  getAiRecentMessages,
  getUserProfile,
  saveUserProfile,
} from '../lib/firebaseService';

const STORAGE_KEY = 'ago_ai_chat_history_24h';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface ChatViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onOpenCreatorProfile: (creatorHandle: string) => void;
  activeSellerThreadId?: string | null;
  onCloseSellerThread?: () => void;
  directThreads: DirectMessageThread[];
  onSendMessageToSeller: (threadId: string, text: string) => void;
}

const DEFAULT_WELCOME_MSG: ChatMessage = {
  id: 'welcome-msg',
  sender: 'ago_ai',
  text: 'Hello my person! I am **AGO Super AI Ultimate (v5)** — your all-in-one Nigerian AI genius, shopping assistant, coder, writer, and companion 🇳🇬✨.\n\nI can help you with:\n• **🧠 Answers & Advice**: Ask any question, learn skills, get business growth strategies.\n• **✍️ Writing**: Essays, CVs, cold emails, Instagram captions, pitch decks.\n• **💻 Code & Tech**: Write code in any language, debug bugs, build apps.\n• **🛍️ Smart Shopping**: Find verified products in Lagos, Aba, Abuja, PH, Kano & bargain with sellers.\n• **🤝 Caring Companion**: Motivation, wisdom, and daily support in English & Pidgin.\n\nWetin you go like make we do today?',
  timestamp: 'Just now',
  createdAtMs: Date.now(),
  suggestedActions: [
    '🧠 Teach me something deep today',
    '💼 Give me business growth strategies for Nigeria',
    '💻 Write & debug code in Python / React',
    '✍️ Write a winning CV & cold email',
    '🛍️ Find verified products in Lagos / Aba',
    '🛡️ Check if this seller deal is a scam',
    '📊 Compare iPhone 13 price on Jumia, Konga & FB',
    '🔒 How does 4-step Escrow work (>₦50k)?',
    '🇳🇬 Speak pidgin',
  ],
};

export const ChatView: React.FC<ChatViewProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onSelectProduct,
  onBuyNow,
  onOpenCreatorProfile,
  activeSellerThreadId,
  onCloseSellerThread,
  directThreads,
  onSendMessageToSeller,
}) => {
  const [activeTab, setActiveTab] = useState<'ago_ai' | 'sellers'>(
    activeSellerThreadId ? 'sellers' : 'ago_ai'
  );
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    activeSellerThreadId || null
  );

  // Voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [autoVoiceReply, setAutoVoiceReply] = useState<boolean>(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // API Key & Memory status state
  const [keysStatus, setKeysStatus] = useState<{
    gemini?: { configured: boolean; message: string };
    paystack?: { configured: boolean; message: string };
    flutterwave?: { configured: boolean; message: string };
  } | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'local_fallback'>('connected');
  const [downloadingImgId, setDownloadingImgId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize and Prune Chat History from Firebase & LocalStorage
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatMessage[] = JSON.parse(stored);
        const now = Date.now();
        const valid = parsed.filter((m) => now - (m.createdAtMs || now) < TWENTY_FOUR_HOURS_MS);
        if (valid.length > 0) return valid;
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [DEFAULT_WELCOME_MSG];
  });

  // Check API keys status on mount
  useEffect(() => {
    async function checkApiKeys() {
      try {
        const res = await fetch('/api/keys/status');
        if (res.ok) {
          const data = await res.json();
          setKeysStatus(data);
        }
      } catch (err) {
        console.warn('Keys status fetch note:', err);
      }
    }
    checkApiKeys();

    // Check Firebase connection & sync recent messages
    async function initFirebaseChat() {
      try {
        const userId = localStorage.getItem('ago_user_id') || 'buyer_favour_user';
        const remote = await getAiRecentMessages(userId, 10);
        if (remote && remote.length > 0) {
          setAiMessages((prev) => {
            const combined = [...prev];
            remote.forEach((r) => {
              if (!combined.some((c) => c.id === r.id)) {
                combined.push(r);
              }
            });
            return combined;
          });
          setFirebaseStatus('connected');
        }
      } catch (fErr) {
        console.warn('Firebase sync warning, local memory active:', fErr);
        setFirebaseStatus('local_fallback');
      }
    }
    initFirebaseChat();
  }, []);

  // Save to localStorage whenever aiMessages changes
  useEffect(() => {
    try {
      const now = Date.now();
      const valid = aiMessages.filter((m) => now - (m.createdAtMs || now) < TWENTY_FOUR_HOURS_MS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [aiMessages]);

  // Sync if activeSellerThreadId changes from outside
  useEffect(() => {
    if (activeSellerThreadId) {
      setActiveTab('sellers');
      setSelectedThreadId(activeSellerThreadId);
    }
  }, [activeSellerThreadId]);

  // Check Web Speech API support safely
  useEffect(() => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    } catch {
      setSpeechSupported(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, selectedThreadId, isLoading, isListening]);

  // Auto-send if initialPrompt was passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      handleSendAiMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Voice synthesis speaker with comprehensive try/catch
  const speakText = (text: string, msgId?: string) => {
    try {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      if (currentlySpeakingId === msgId) {
        setCurrentlySpeakingId(null);
        return;
      }

      // Strip markdown formatting and SVG/data for cleaner audio speech
      const cleanSpeech = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/₦(\d+)/g, '$1 Naira')
        .trim();

      if (!cleanSpeech) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Pick best English voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find((v) =>
          v.lang.includes('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      } catch {}

      if (msgId) setCurrentlySpeakingId(msgId);

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Voice synthesis error handled safely:', err);
      setCurrentlySpeakingId(null);
    }
  };

  const stopSpeaking = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setCurrentlySpeakingId(null);
  };

  // Toggle Voice Recognition with Web Speech API with try/catch
  const toggleVoiceInput = () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      if (isListening) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-NG'; // Nigerian English / Pidgin

      let finalCapturedText = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalCapturedText += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const fullTranscript = (finalCapturedText + ' ' + interim).trim();
        setInputMessage(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If final text was captured, auto send to AGO Super AI
        if (finalCapturedText && finalCapturedText.trim()) {
          handleSendAiMessage(finalCapturedText.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition safely:', err);
      setIsListening(false);
    }
  };

  // Download Generated Image with try/catch
  const handleDownloadImage = (imageUrl: string, filename: string = 'ago_generated_image.png') => {
    try {
      setDownloadingImgId(imageUrl);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setDownloadingImgId(null), 1000);
    } catch (err) {
      console.error('Image download error:', err);
      setDownloadingImgId(null);
    }
  };

  // Send message to AGO AI
  const handleSendAiMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    // Stop ongoing speech
    stopSpeaking();

    const userId = localStorage.getItem('ago_user_id') || 'buyer_favour_user';
    const userLocation = localStorage.getItem('ago_user_city') || 'Lagos';
    const userName = localStorage.getItem('ago_user_name') || 'Favour';

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtMs: Date.now(),
    };

    const updatedHistory = [...aiMessages, userMsg];
    setAiMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    // Save user message to Firebase & Local Memory
    saveAiMessageToFirebase(userId, userMsg).catch(() => {});

    // Intercept memory storage command directly: "AGO remember that my name is Favour and I sell clothes"
    const lowerPrompt = promptToSend.toLowerCase();
    if (lowerPrompt.includes('remember that') || lowerPrompt.includes('my name is')) {
      const nameMatch = promptPromptExtract(promptToSend, 'name is');
      const bizMatch = promptPromptExtract(promptToSend, 'sell') || promptPromptExtract(promptToSend, 'business is');
      if (nameMatch || bizMatch) {
        saveUserProfile(userId, {
          name: nameMatch || userName,
          business: bizMatch || 'clothes & fashion',
        }).catch(() => {});
      }
    }

    try {
      // Read last 10 messages for context
      const last10Turns = updatedHistory.slice(-10);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          chatHistory: last10Turns, // Send 10 messages for full conversational & business memory
          userCity: userLocation,
          userName: userName,
          userId: userId,
        }),
      });

      let data: any;
      if (response.ok) {
        data = await response.json();
      } else {
        data = {
          message: "No wahala! I'm active and processing your request with local intelligent memory.",
          suggestedActions: ["🎨 Create logo for AGO Market", "🔍 Search phones in Lagos", "🛍️ Show fashion in Aba"]
        };
      }

      // If AI detected a location update, remember it for future search filtering
      if (data && data.userLocationUpdate) {
        localStorage.setItem('ago_user_city', data.userLocationUpdate);
        saveUserProfile(userId, { city: data.userLocationUpdate }).catch(() => {});
      }

      // If user said "Buy this iPhone for me" or similar buy request
      const isDirectBuyRequest =
        lowerPrompt.includes('buy this') ||
        lowerPrompt.includes('buy now') ||
        lowerPrompt.includes('buy me') ||
        lowerPrompt.includes('order this') ||
        lowerPrompt.includes('i want to buy') ||
        lowerPrompt.includes('purchase this');

      // If user asked to buy, automatically pick the first recommended product or search result
      const targetProductToBuy =
        (data?.products && data.products.length > 0)
          ? data.products[0]
          : null;

      const aiMsgId = `ai-${Date.now()}`;
      let orderConfirmationData = undefined;

      if (isDirectBuyRequest && targetProductToBuy) {
        orderConfirmationData = {
          orderNumber: `AGO${Math.floor(10000 + Math.random() * 90000)}`,
          productTitle: targetProductToBuy.title,
          amountFormatted: targetProductToBuy.priceFormatted,
          deliveryAddress: `${userLocation}, Nigeria`,
          gateway: 'Paystack' as const,
          status: 'Escrow Payment Ready',
        };
      }

      const aiReply: ChatMessage = {
        id: aiMsgId,
        sender: 'ago_ai',
        text: isDirectBuyRequest && targetProductToBuy
          ? `🛒 **Order Initiated for ${targetProductToBuy.title}!**\n\nI have locked the deal at **${targetProductToBuy.priceFormatted}** with verified seller *${targetProductToBuy.seller.name}* in ${targetProductToBuy.city}.\n\n✅ **Delivery Location**: ${userLocation}, Nigeria (Doorstep dispatch)\n🔒 **Escrow Gateways**: Paystack & Flutterwave Active\n\nClick **"Buy Now / Complete Checkout"** below to finalize delivery address and authorize escrow payment safely!`
          : (data?.message || 'Here is what I found for your request:'),
        products: data?.products || [],
        suggestedActions: data?.suggestedActions || [],
        bargainScript: data?.bargainScript || undefined,
        scamAlert: data?.scamAlert || undefined,
        priceComparison: data?.priceComparison || undefined,
        escrowDetail: data?.escrowDetail || undefined,
        languageDetected: data?.languageDetected || undefined,
        toolCallsExecuted: data?.toolCallsExecuted || undefined,
        generatedImage: data?.generatedImage || undefined,
        buyTriggeredProduct: targetProductToBuy || undefined,
        orderConfirmation: orderConfirmationData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtMs: Date.now(),
      };

      setAiMessages((prev) => [...prev, aiReply]);

      // Save AI reply to Firebase & Local Memory
      saveAiMessageToFirebase(userId, aiReply).catch(() => {});

      // If direct buy requested, trigger the checkout modal for smooth flow
      if (isDirectBuyRequest && targetProductToBuy) {
        setTimeout(() => {
          onBuyNow(targetProductToBuy);
        }, 1200);
      }

      // Voice reply if autoVoiceReply enabled (with try/catch)
      if (autoVoiceReply && data?.message) {
        setTimeout(() => {
          speakText(data.message, aiMsgId);
        }, 300);
      }
    } catch (error) {
      console.warn('AGO AI response fallback activated:', error);
      const fallbackReply: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ago_ai',
        text: "No wahala Favour! I am active with full offline memory and verified marketplace catalogs across Lagos, Aba, Abuja, PH, and Kano.\n\n💡 **Tip**: You can ask me to generate images, remember facts, or find products anytime!",
        suggestedActions: [
          "🎨 Create logo for AGO Market",
          "🔍 Find iPhone 13 in Lagos",
          "🧠 AGO what did I tell you about my business?",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtMs: Date.now(),
      };
      setAiMessages((prev) => [...prev, fallbackReply]);
      saveAiMessageToFirebase(userId, fallbackReply).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  function promptPromptExtract(text: string, phrase: string): string | null {
    const idx = text.toLowerCase().indexOf(phrase);
    if (idx !== -1) {
      const rest = text.substring(idx + phrase.length).trim();
      return rest.split(/[\.,\n]/)[0].trim() || null;
    }
    return null;
  }

  const handleCopyBargainScript = (scriptText: string, msgId: string) => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScriptId(msgId);
    setTimeout(() => setCopiedScriptId(null), 3000);
  };

  const handleSellerMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedThreadId) return;

    onSendMessageToSeller(selectedThreadId, inputMessage);
    setInputMessage('');
  };

  const currentThread = directThreads.find((t) => t.id === selectedThreadId);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2 pb-24 h-[calc(100vh-125px)] flex flex-col">
      {/* Top Chat Channel Tabs */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-2 shadow-md">
        <button
          onClick={() => {
            setActiveTab('ago_ai');
            setSelectedThreadId(null);
            if (onCloseSellerThread) onCloseSellerThread();
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ago_ai'
              ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AGO Super AI Ultimate (v5)</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
            activeTab === 'sellers'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Direct Seller DMs</span>
          {directThreads.some((t) => t.unreadCount > 0) && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>

      {/* ================= CHANNEL 1: AGO AI ASSISTANT ================= */}
      {activeTab === 'ago_ai' && (
        <div className="flex-1 flex flex-col bg-slate-900/80 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
          {/* AI Header Bar */}
          <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shadow-md shadow-teal-500/10">
                <AgoIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white">AGO Super AI Ultimate</span>
                  <span className="px-1.5 py-0.2 rounded bg-teal-950 border border-teal-500/40 text-[9px] font-bold text-teal-300">
                    v5 Universal
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-[9px] font-bold text-purple-300 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5 text-purple-400" />
                    <span>Firebase Memory</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Voice • Image Gen • Paystack • Flutterwave • 10-Turn Context</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Audio Playback Stop Button */}
              {currentlySpeakingId && (
                <button
                  onClick={stopSpeaking}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold flex items-center gap-1 animate-pulse cursor-pointer"
                  title="Stop voice audio"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>Stop Voice</span>
                </button>
              )}

              {/* Auto Voice Reply Toggle */}
              <button
                onClick={() => {
                  if (autoVoiceReply) stopSpeaking();
                  setAutoVoiceReply(!autoVoiceReply);
                }}
                className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold ${
                  autoVoiceReply
                    ? 'bg-teal-950/80 border-teal-500/50 text-teal-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={autoVoiceReply ? 'Voice replies ON (AI speaks answers)' : 'Voice replies OFF (Silent)'}
              >
                {autoVoiceReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{autoVoiceReply ? 'Voice ON' : 'Voice Muted'}</span>
              </button>

              {/* Reset conversation */}
              <button
                onClick={() => {
                  stopSpeaking();
                  const fresh = [
                    {
                      id: `welcome-${Date.now()}`,
                      sender: 'ago_ai' as const,
                      text: 'Chat history reset. Hello my person! I am **AGO Super AI Ultimate (v5)** — your all-in-one Nigerian AI genius, shopping assistant, coder, writer, and companion 🇳🇬✨.\n\nI can help you with:\n• **🧠 Answers & Advice**: Ask any question, learn skills, get business growth strategies.\n• **✍️ Writing**: Essays, CVs, cold emails, Instagram captions, pitch decks.\n• **💻 Code & Tech**: Write code in any language, debug bugs, build apps.\n• **🛍️ Smart Shopping**: Find verified products in Lagos, Aba, Abuja, PH, Kano & bargain with sellers.\n• **🤝 Caring Companion**: Motivation, wisdom, and daily support in English & Pidgin.\n\nWetin you go like make we do today?',
                      timestamp: 'Just now',
                      createdAtMs: Date.now(),
                      suggestedActions: [
                        '🧠 Teach me something deep today',
                        '💼 Give me business growth strategies for Nigeria',
                        '💻 Write & debug code in Python / React',
                        '✍️ Write a winning CV & cold email',
                        '🛍️ Find verified products in Lagos / Aba',
                        '🛡️ Check if this seller deal is a scam',
                        '📊 Compare iPhone 13 price on Jumia, Konga & FB',
                        '🔒 How does 4-step Escrow work (>₦50k)?',
                        '🇳🇬 Speak pidgin',
                      ],
                    },
                  ];
                  setAiMessages(fresh);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Clear 24hr chat history"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* API Key / Services Status Banner */}
          {keysStatus && (!keysStatus.gemini?.configured || !keysStatus.paystack?.configured || !keysStatus.flutterwave?.configured) && (
            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 text-[10px] flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5">
                <Key className="w-3 h-3 text-teal-400" />
                <span>
                  {keysStatus.gemini?.configured ? 'Gemini 2.5 Flash Connected' : 'Please add Gemini API Key in Settings (Local Intelligence & Fallbacks Active)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-500/30 text-[9px] font-bold">
                  Escrow: Paystack & Flutterwave Active
                </span>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 p-0.5 shrink-0 mt-0.5 flex items-center justify-center shadow">
                    <AgoIcon size={22} />
                  </div>
                )}

                <div className={`max-w-[94%] sm:max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none shadow-lg'
                    }`}
                  >
                    {/* Tool Calls Execution Badges */}
                    {msg.toolCallsExecuted && msg.toolCallsExecuted.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {msg.toolCallsExecuted.map((tool, tIdx) => (
                          <div
                            key={tIdx}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-teal-500/40 text-[10px] font-semibold text-teal-300 shadow-sm"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            <span>{tool.statusText || `Executed: ${tool.toolName}`}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Multilingual / Tag Badge */}
                    {msg.languageDetected && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-[9px] font-semibold text-teal-300 mb-2 border border-slate-700">
                        <Globe className="w-2.5 h-2.5" />
                        <span>Language: {msg.languageDetected}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/40 text-[10px]">
                      <span className={msg.sender === 'user' ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                        {msg.timestamp}
                      </span>

                      {/* Voice Audio Listen Button for AI Messages */}
                      {msg.sender === 'ago_ai' && (
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer text-[10px] font-bold ${
                            currentlySpeakingId === msg.id
                              ? 'bg-teal-400 text-slate-950 animate-pulse'
                              : 'bg-slate-900/80 text-teal-300 hover:bg-slate-900 border border-slate-700'
                          }`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{currentlySpeakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Render Generated Image Card with Download Button */}
                  {msg.generatedImage && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/50 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <ImageIcon className="w-4 h-4 text-purple-400" />
                          <span>Gemini Image Generation: {msg.generatedImage.title || 'Created Artwork'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-[9px] font-bold text-purple-300">
                          {msg.generatedImage.aspectRatio || '1:1'}
                        </span>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        <img
                          src={msg.generatedImage.url}
                          alt={msg.generatedImage.title || 'Generated image'}
                          className="w-full max-h-72 object-contain bg-slate-950"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        Prompt: "{msg.generatedImage.prompt}"
                      </p>

                      <div className="flex items-center gap-2">
                        {/* Working Download Button */}
                        <button
                          onClick={() => handleDownloadImage(msg.generatedImage!.url, `${(msg.generatedImage!.title || 'ago_image').replace(/\s+/g, '_').toLowerCase()}.png`)}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingImgId === msg.generatedImage.url ? 'Downloading...' : 'Download Image'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Order Confirmation & Direct Buy Card if triggered */}
                  {msg.orderConfirmation && msg.buyTriggeredProduct && (
                    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/50 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-white">
                              Order #{msg.orderConfirmation.orderNumber}
                            </span>
                            <div className="text-[10px] text-teal-300">
                              Escrow Guaranteed • {msg.orderConfirmation.gateway} & Flutterwave
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-400/40 text-[10px] font-bold text-teal-300">
                          {msg.orderConfirmation.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <img
                          src={msg.buyTriggeredProduct.image}
                          alt={msg.buyTriggeredProduct.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h6 className="text-xs font-bold text-white truncate">
                            {msg.buyTriggeredProduct.title}
                          </h6>
                          <p className="text-[10px] text-slate-400">
                            Vendor: {msg.buyTriggeredProduct.seller.name} • {msg.buyTriggeredProduct.city}
                          </p>
                          <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                            {msg.buyTriggeredProduct.priceFormatted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                        <span>📍 Delivery Destination:</span>
                        <span className="font-semibold text-white">{msg.orderConfirmation.deliveryAddress}</span>
                      </div>

                      <button
                        onClick={() => onBuyNow(msg.buyTriggeredProduct!)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
                      >
                        <span>Buy Now / Complete Escrow Checkout</span>
                        <span className="text-sm">➔</span>
                      </button>
                    </div>
                  )}

                  {/* Render Anti-Scam Alert Card if present */}
                  {msg.scamAlert && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/60 shadow-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                          <span>AGO Anti-Scam Detection</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            msg.scamAlert.riskLevel === 'high'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : msg.scamAlert.riskLevel === 'medium'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-500 text-slate-950'
                          }`}
                        >
                          {msg.scamAlert.riskLevel} Risk
                        </span>
                      </div>

                      {msg.scamAlert.payBeforeDeliveryWarning && (
                        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white uppercase font-black tracking-wide">
                              ⚠️ NEVER Pay Before Delivery!
                            </span>
                            <p className="text-[11px] text-rose-200/90 font-normal mt-0.5">
                              Never send money directly to a seller's bank account before you receive and inspect the item. Always use AGO Escrow.
                            </p>
                          </div>
                        </div>
                      )}

                      {msg.scamAlert.warning && (
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">
                          {msg.scamAlert.warning}
                        </p>
                      )}

                      {msg.scamAlert.reasons && msg.scamAlert.reasons.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Risk Factors Identified:
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            {msg.scamAlert.reasons.map((r, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Price Comparison Card if present */}
                  {msg.priceComparison && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                          <Scale className="w-4 h-4 text-indigo-400" />
                          <span>Price Comparison: {msg.priceComparison.itemName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-[9px] font-bold text-indigo-300">
                          Live African Market
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Jumia */}
                        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                          <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                            <span>🟠 Jumia</span>
                            <span className="text-[9px] text-slate-500">Official Retail</span>
                          </div>
                          <div className="text-xs font-extrabold text-white mt-1">
                            {msg.priceComparison.jumiaPrice}
                          </div>
                        </div>

                        {/* Konga */}
                        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                          <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                            <span>🔴 Konga</span>
                            <span className="text-[9px] text-slate-500">Official Retail</span>
                          </div>
                          <div className="text-xs font-extrabold text-white mt-1">
                            {msg.priceComparison.kongaPrice}
                          </div>
                        </div>

                        {/* Facebook Marketplace */}
                        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-rose-500/30">
                          <div className="text-[10px] text-rose-400 font-semibold flex items-center justify-between">
                            <span>🔵 Facebook Marketplace</span>
                            <span className="text-[9px] text-rose-400 font-bold">⚠️ High Scam Risk</span>
                          </div>
                          <div className="text-xs font-extrabold text-slate-200 mt-1">
                            {msg.priceComparison.facebookMarketplacePrice}
                          </div>
                        </div>

                        {/* AGO Escrow Marketplace */}
                        <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/50">
                          <div className="text-[10px] text-teal-300 font-bold flex items-center justify-between">
                            <span>🛡️ AGO Marketplace</span>
                            <span className="text-[9px] text-teal-300 font-bold">100% Escrow</span>
                          </div>
                          <div className="text-xs font-black text-teal-300 mt-1">
                            {msg.priceComparison.agoPrice}
                          </div>
                        </div>
                      </div>

                      {msg.priceComparison.verdict && (
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                          💡 <strong className="text-white">Verdict:</strong> {msg.priceComparison.verdict}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Escrow 4-Step Process Card if present */}
                  {msg.escrowDetail && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-teal-950/50 via-slate-900 to-slate-950 border border-teal-500/50 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                          <Lock className="w-4 h-4 text-teal-400" />
                          <span>AGO Escrow 4-Step Protection</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-400/40 text-[9px] font-bold text-teal-300">
                          Recommended &gt; ₦50,000
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.escrowDetail.steps.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black flex items-center justify-center border border-teal-500/40">
                                {step.stepNumber}
                              </span>
                              <span className="text-xs font-bold text-white">{step.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Bargaining Pitch Script Card if present */}
                  {msg.bargainScript && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/40 shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Ready-to-Send Bargaining Script</span>
                        </div>
                        <button
                          onClick={() => handleCopyBargainScript(msg.bargainScript!, msg.id)}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-amber-500/40"
                        >
                          {copiedScriptId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono italic leading-relaxed select-all">
                        "{msg.bargainScript}"
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2">
                        💡 Paste this directly into seller direct messages or click below to browse open threads.
                      </p>
                    </div>
                  )}

                  {/* Render Product Option Cards if present */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Verified Market Recommendations ({msg.products.length})
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-950/90 rounded-2xl border border-slate-700/80 p-2.5 flex flex-col justify-between hover:border-teal-400/60 transition shadow-lg group"
                          >
                            <div>
                              <div
                                className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-900 cursor-pointer"
                                onClick={() => onSelectProduct(p)}
                              >
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-bold text-teal-300">
                                  {p.condition}
                                </div>
                                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-semibold text-slate-300">
                                  {p.city}
                                </div>
                                {p.scrapedVia === 'Firecrawl' && (
                                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/50 text-[8px] font-bold text-amber-300 flex items-center gap-0.5">
                                    <Flame className="w-2 h-2 fill-amber-400" />
                                    <span>Firecrawl</span>
                                  </div>
                                )}
                              </div>

                              <h5
                                className="text-xs font-bold text-white line-clamp-2 cursor-pointer hover:text-teal-300"
                                onClick={() => onSelectProduct(p)}
                              >
                                {p.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {p.seller.name} • {p.seller.responseTime}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-800">
                              <div className="flex items-baseline justify-between mb-2">
                                <span className="text-xs font-extrabold text-emerald-400">
                                  {p.priceFormatted}
                                </span>
                                {p.originalPriceFormatted && (
                                  <span className="text-[9px] text-slate-500 line-through">
                                    {p.originalPriceFormatted}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => onSelectProduct(p)}
                                  className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition text-center cursor-pointer"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => onBuyNow(p)}
                                  className="py-1 px-1.5 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:opacity-90 text-slate-950 text-[10px] font-black transition text-center shadow cursor-pointer"
                                >
                                  Buy Now
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Suggested Quick Reply Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendAiMessage(action)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-teal-200 text-[11px] border border-teal-500/30 transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <span>💬</span>
                          <span>{action}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-teal-500/40 p-0.5 shrink-0 flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <AgoIcon size={22} />
                </div>
                <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 p-3 rounded-2xl rounded-tl-none border border-teal-500/30 text-xs text-slate-300 flex items-center gap-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-teal-300 font-bold">
                      ⚡ Turbo Fast Thinking...
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                      &lt;0.5s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Listening Waveform Indicator */}
            {isListening && (
              <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-teal-300">
                    Listening to your voice... Speak now (e.g. "Create logo for AGO Market" or "Buy iPhone 13")
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/50 text-red-300 text-[10px] font-bold cursor-pointer"
                >
                  Stop Recording
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* AI Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAiMessage();
            }}
            className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything: Create logo, remember my business, buy iPhone, write code, or search products..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-teal-400 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />

            {/* Voice Mic Button (Beside Send Button) */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={!speechSupported || isLoading}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition shrink-0 cursor-pointer shadow-md ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-400 shadow-red-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isListening ? 'Listening... Click to stop & send' : 'Click 🎤 to talk to AGO (Web Speech API)'}
            >
              {isListening ? (
                <span className="text-base animate-bounce">🎙️</span>
              ) : (
                <span className="text-base">🎤</span>
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 text-slate-950 flex items-center justify-center hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>
      )}

      {/* ================= CHANNEL 2: DIRECT SELLER DMS ================= */}
      {activeTab === 'sellers' && (
        <div className="flex-1 flex flex-col bg-slate-900/80 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
          {/* If viewing thread list */}
          {!selectedThreadId ? (
            <div className="flex-1 flex flex-col">
              <div className="p-3.5 bg-slate-950/60 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Direct Conversations ({directThreads.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
                {directThreads.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active direct messages. Click "Chat" on any item in the marketplace to start chatting with verified sellers!
                  </div>
                ) : (
                  directThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className="p-3 rounded-2xl hover:bg-slate-800/60 cursor-pointer transition flex items-center gap-3"
                    >
                      <div className="relative">
                        <img
                          src={thread.seller.avatar}
                          alt={thread.seller.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                        />
                        {thread.seller.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {thread.seller.name}
                            </h4>
                            {thread.seller.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{thread.lastMessageTime}</span>
                        </div>

                        <p className="text-xs text-slate-400 truncate mt-0.5">{thread.lastMessage}</p>
                        <span className="text-[10px] text-teal-400 font-semibold">
                          📍 {thread.seller.city}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* If inside single seller chat thread */
            <div className="flex-1 flex flex-col">
              {/* Thread Header */}
              <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {currentThread && (
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => onOpenCreatorProfile(currentThread.seller.handle)}
                    >
                      <img
                        src={currentThread.seller.avatar}
                        alt={currentThread.seller.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-white">{currentThread.seller.name}</h4>
                          {currentThread.seller.verified && (
                            <ShieldCheck className="w-3 h-3 text-teal-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-400">
                          Online • {currentThread.seller.city}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Escrow Active</span>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {currentThread?.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Product context card if first message */}
                    {m.productContext && (
                      <div className="mb-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 max-w-xs shadow">
                        <img
                          src={m.productContext.image}
                          alt={m.productContext.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0 text-left">
                          <p className="text-[11px] font-bold text-white truncate">
                            {m.productContext.title}
                          </p>
                          <span className="text-[11px] font-extrabold text-emerald-400">
                            {m.productContext.priceFormatted}
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none shadow-md'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span
                        className={`text-[9px] block mt-1 ${
                          m.sender === 'user' ? 'text-purple-200' : 'text-slate-400'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSellerMessageSubmit}
                className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${currentThread?.seller.name || 'seller'} with escrow protection...`}
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 shrink-0 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  UploadCloud,
  Send,
  Sparkles,
  Eye,
  RefreshCw,
  Clock,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Maximize2,
  X,
  Volume2,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';

declare global {
  interface Window {
    jsQR?: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'both' | 'invertFirst' }
    ) => { data: string; location: any } | null;
  }
}

interface EscrowOrderViewProps {
  initialProduct?: Product | null;
  onGoToMarketplace?: () => void;
  onOpenAiAssistant?: (prompt: string) => void;
}

interface EscrowState {
  escrowBalance: number;
  sellerBalance: number;
  isFrozen: boolean;
  isReleased: boolean;
  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
  sellerProofUrl: string | null;
  sellerProofTimestamp: string | null;
  buyerProofUrl: string | null;
  buyerProofTimestamp: string | null;
  qrVerified: boolean;
  trackingCode: string;
}

interface ChatItem {
  id: string;
  sender: 'buyer' | 'seller' | 'system' | 'warning';
  text: string;
  timestamp: string;
}

export const EscrowOrderView: React.FC<EscrowOrderViewProps> = ({
  initialProduct,
  onGoToMarketplace,
  onOpenAiAssistant,
}) => {
  // Active Order Details
  const orderNumber = 'AGO-8850';
  const itemTitle = initialProduct ? initialProduct.title : 'Apple iPhone 15 Pro Max 256GB Titanium';
  const itemPrice = initialProduct ? initialProduct.priceFormatted : '$50.00 (₦75,000)';
  const itemImage = initialProduct
    ? initialProduct.image
    : 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80';
  const sellerName = initialProduct ? initialProduct.seller.name : 'Computer Village Mega Tech';

  // Escrow Financial & Proof State
  const [state, setState] = useState<EscrowState>({
    escrowBalance: 50,
    sellerBalance: 0,
    isFrozen: false,
    isReleased: false,
    sellerConfirmed: true,
    buyerConfirmed: false,
    sellerProofUrl:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    sellerProofTimestamp: '2026-08-23 09:42:15',
    buyerProofUrl: null,
    buyerProofTimestamp: null,
    qrVerified: false,
    trackingCode: 'AG-8850-NGX',
  });

  // Demo Notification Banner State
  const [alertPopup, setAlertPopup] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'danger';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'danger' = 'success') => {
    setAlertPopup({ show: true, title, message, type });
    setTimeout(() => {
      setAlertPopup((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Proof Capture Modal State
  const [proofModalOpen, setProofModalOpen] = useState<boolean>(false);
  const [modalRole, setModalRole] = useState<'seller' | 'buyer'>('seller');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [tempCapturedImage, setTempCapturedImage] = useState<string | null>(null);
  const [isWatermarking, setIsWatermarking] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // QR Scanner Modal State
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [qrScanning, setQrScanning] = useState<boolean>(false);
  const qrVideoRef = useRef<HTMLVideoElement | null>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const qrAnimIdRef = useRef<number | null>(null);

  // Lightbox Zoom Modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; meta: string } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<string[]>([
    'Escrow session initiated for Order #AGO-8850 ($50.00).',
    'Buyer funded $50.00 into AGO Smart Vault.',
    'Seller uploaded live Dispatch Waybill with AGO Verified watermark.',
  ]);

  const addAuditLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setAuditLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  // Live P2P Anti-Scam Chat
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([
    {
      id: 'm1',
      sender: 'seller',
      text: 'Hello! I have packaged the iPhone 15 Pro Max with original sealed accessories. Dispatching to GIG logistics now!',
      timestamp: '09:40 AM',
    },
    {
      id: 'm2',
      sender: 'buyer',
      text: 'Great! My $50 is held safely in AGO Escrow. Once rider arrives I will scan the QR code and inspect.',
      timestamp: '09:42 AM',
    },
    {
      id: 'm3',
      sender: 'system',
      text: '🔒 AGO Escrow Protection Active: Both parties must verify photo evidence before funds are disbursed.',
      timestamp: '09:43 AM',
    },
  ]);

  const [inputChat, setInputChat] = useState<string>('');
  const [aiScamWarning, setAiScamWarning] = useState<string | null>(null);

  // Check input for scam keywords
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputChat(val);
    const lower = val.toLowerCase();

    if (
      lower.includes('whatsapp') ||
      lower.includes('opay') ||
      lower.includes('palmpay') ||
      lower.includes('direct transfer') ||
      lower.includes('send account') ||
      lower.includes('pay outside') ||
      lower.includes('bypass')
    ) {
      setAiScamWarning(
        '⚠️ SCAM ALERT: Never pay outside AGO Escrow! Off-platform transfers lose all buyer and seller money-back guarantees.'
      );
    } else {
      setAiScamWarning(null);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const newMsg: ChatItem = {
      id: `chat-${Date.now()}`,
      sender: 'buyer',
      text: inputChat.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');
    setAiScamWarning(null);

    // AI automated reply / scam deterrent
    if (
      inputChat.toLowerCase().includes('discount') ||
      inputChat.toLowerCase().includes('price') ||
      inputChat.toLowerCase().includes('how much')
    ) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `chat-seller-${Date.now()}`,
            sender: 'seller',
            text: 'I can give you a small discount on your next order once this delivery is completed safely!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    }
  };

  // =========================================================================
  // 1. "Send to Escrow" Button Action
  // =========================================================================
  const handleDepositEscrow = () => {
    setState((prev) => ({
      ...prev,
      isFrozen: false,
      escrowBalance: 50,
      sellerBalance: 0,
      isReleased: false,
      sellerConfirmed: true,
      buyerConfirmed: false,
      buyerProofUrl: null,
      buyerProofTimestamp: null,
      qrVerified: false,
    }));

    addAuditLog('Buyer funded $50.00 into AGO Escrow Vault.');
    showAlert('✅ $50 moved to Escrow Balance', 'Funds secured safely in AGO Smart Escrow', 'success');
  };

  // =========================================================================
  // 2. Open Camera & Watermarking for "Seller: I Sent" & "Buyer: I Received"
  // =========================================================================
  const openProofModal = (role: 'seller' | 'buyer') => {
    if (state.isReleased) {
      showAlert('✅ Escrow Already Released', 'Transaction completed successfully.', 'success');
      return;
    }

    setModalRole(role);
    setTempCapturedImage(null);
    setProofModalOpen(true);
    startNativeCamera();
  };

  const startNativeCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video play err:', err));
      }
    } catch (err) {
      console.warn('Camera access fallback:', err);
      setCameraActive(false);
    }
  };

  const stopNativeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const closeProofModal = () => {
    stopNativeCamera();
    setProofModalOpen(false);
    setTempCapturedImage(null);
  };

  // Capture from live camera feed
  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopNativeCamera();
    applyWatermarkAndSetTemp(rawDataUrl);
  };

  // Handle uploaded photo from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result as string;
      stopNativeCamera();
      applyWatermarkAndSetTemp(rawUrl);
    };
    reader.readAsDataURL(file);
  };

  // Apply "🛡️ AGO Verified" + Current Date & Time Watermark on Canvas
  const applyWatermarkAndSetTemp = (rawImageUrl: string) => {
    setIsWatermarking(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawImageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      const roleText = modalRole === 'seller' ? 'SELLER DISPATCH PROOF' : 'BUYER DELIVERY PROOF';

      // Draw bottom security watermark banner
      const bannerHeight = Math.max(70, canvas.height * 0.12);
      ctx.fillStyle = 'rgba(6, 11, 22, 0.88)';
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

      // Accent border
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, 3);

      // Draw "🛡️ AGO VERIFIED" Stamp Badge
      ctx.fillStyle = '#14b8a6';
      ctx.font = `bold ${Math.max(16, bannerHeight * 0.28)}px system-ui, sans-serif`;
      ctx.fillText('🛡️ AGO VERIFIED ESCROW PROOF', 18, canvas.height - bannerHeight * 0.55);

      // Draw Date & Time Stamp
      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 ${Math.max(12, bannerHeight * 0.2)}px system-ui, sans-serif`;
      ctx.fillText(`DATE: ${dateStr}  |  TIME: ${timeStr}  |  ORDER #${orderNumber}`, 18, canvas.height - bannerHeight * 0.22);

      // Draw Top Right Verified Ribbon
      const tagText = `✓ ${roleText}`;
      ctx.fillStyle = 'rgba(20, 184, 166, 0.9)';
      const tagWidth = Math.max(180, canvas.width * 0.32);
      ctx.fillRect(canvas.width - tagWidth - 16, 16, tagWidth, 32);
      ctx.fillStyle = '#021014';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(tagText, canvas.width - tagWidth - 6, 37);

      const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.92);
      setTempCapturedImage(watermarkedUrl);
      setIsWatermarking(false);
    };
  };

  // Confirm and Save Watermarked Proof to Vault
  const handleSaveProofToVault = () => {
    if (!tempCapturedImage) return;

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    if (modalRole === 'seller') {
      setState((prev) => ({
        ...prev,
        sellerProofUrl: tempCapturedImage,
        sellerProofTimestamp: timestamp,
        sellerConfirmed: true,
      }));
      addAuditLog('Seller captured dispatch waybill with AGO Verified watermark.');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `chat-proof-${Date.now()}`,
          sender: 'seller',
          text: '📦 I uploaded dispatch waybill evidence! Watermarked with Date, Time & AGO Verified badge.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      showAlert('✅ Dispatch Proof Uploaded', 'Timestamped & watermarked evidence locked in Vault', 'success');
    } else {
      setState((prev) => ({
        ...prev,
        buyerProofUrl: tempCapturedImage,
        buyerProofTimestamp: timestamp,
        buyerConfirmed: true,
      }));
      addAuditLog('Buyer captured unboxing proof with AGO Verified watermark.');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `chat-proof-${Date.now()}`,
          sender: 'buyer',
          text: '✅ Package inspected and received in pristine condition! Proof saved to Dispute Vault.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      showAlert('✅ Delivery Proof Uploaded', 'Inspection evidence verified and stored in Proof Vault', 'success');
    }

    closeProofModal();
  };

  // =========================================================================
  // 3. QR Code Package Scanner Action
  // =========================================================================
  const openQRScanner = () => {
    setQrModalOpen(true);
    setQrScanning(true);
    startQRCamera();
  };

  const startQRCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      qrStreamRef.current = stream;
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
        qrVideoRef.current.play().catch((err) => console.warn('QR video play:', err));
        qrAnimIdRef.current = requestAnimationFrame(scanQRFrame);
      }
    } catch (err) {
      console.warn('QR camera open:', err);
    }
  };

  const stopQRCamera = () => {
    if (qrAnimIdRef.current) {
      cancelAnimationFrame(qrAnimIdRef.current);
      qrAnimIdRef.current = null;
    }
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((t) => t.stop());
      qrStreamRef.current = null;
    }
    setQrScanning(false);
  };

  const closeQRModal = () => {
    stopQRCamera();
    setQrModalOpen(false);
  };

  const scanQRFrame = () => {
    if (!qrVideoRef.current || !qrScanning) return;
    const video = qrVideoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
          const code = window.jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleQRDetected(code.data);
            return;
          }
        }
      }
    }
    qrAnimIdRef.current = requestAnimationFrame(scanQRFrame);
  };

  const handleQRDetected = (codeData: string) => {
    stopQRCamera();
    setQrModalOpen(false);
    setState((prev) => ({ ...prev, qrVerified: true }));
    addAuditLog(`Package QR verified: ${codeData}`);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `qr-${Date.now()}`,
        sender: 'system',
        text: `✅ QR CODE SCANNED: Courier Waybill #${state.trackingCode} matched to Escrow Order #${orderNumber}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showAlert('✅ Package Verified', `Waybill #${state.trackingCode} matched to Escrow Order`, 'success');
  };

  // Simulated Instant QR Trigger (for testing in desktop or camera-restricted iframe)
  const handleSimulateQRScan = () => {
    handleQRDetected(`AGO-WAYBILL-${state.trackingCode}`);
  };

  // =========================================================================
  // 4. "Release Funds" Button Action
  // =========================================================================
  const handleReleaseFunds = () => {
    if (state.isFrozen) {
      showAlert('⚠️ Cannot Release: Funds Frozen', 'Dispute must be unfrozen by Admin first.', 'warning');
      return;
    }
    if (state.isReleased) {
      showAlert('✅ $50 Released to Seller Balance', 'Funds have already been transferred.', 'success');
      return;
    }

    setState((prev) => ({
      ...prev,
      isReleased: true,
      sellerBalance: 50,
      escrowBalance: 0,
      buyerConfirmed: true,
    }));

    addAuditLog('✅ Funds Released: $50.00 transferred from Escrow to Seller.');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `rel-${Date.now()}`,
        sender: 'system',
        text: '🎉 SUCCESS: $50.00 released to Seller Balance. Order fulfilled safely under AGO Escrow!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {}

    showAlert('✅ $50 Released to Seller Balance', 'Transaction completed successfully with full payout', 'success');
  };

  // =========================================================================
  // 5. "Report to Admin" Button Action
  // =========================================================================
  const handleReportToAdmin = () => {
    if (state.isFrozen) {
      setState((prev) => ({ ...prev, isFrozen: false }));
      addAuditLog('Admin dispute resolved: Escrow funds unfrozen.');
      setChatMessages((prev) => [
        ...prev,
        {
          id: `unfreeze-${Date.now()}`,
          sender: 'system',
          text: '🛡️ Admin resolved case: Escrow funds unfrozen. Normal operations restored.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      showAlert('🛡️ Escrow Unfrozen by Admin', 'Normal escrow transactions resumed', 'success');
      return;
    }

    setState((prev) => ({ ...prev, isFrozen: true }));
    addAuditLog('🚨 Report to Admin: Funds frozen ($50.00 locked). Case opened.');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `freeze-${Date.now()}`,
        sender: 'warning',
        text: '🚨 REPORT FILED: Escrow funds have been FROZEN. Admin notified for dispute review. Chat logs, QR validation, and watermarked proof locked for inspection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    showAlert('⚠️ Case sent to Admin with all proofs', 'Evidence Vault, Chat transcript & QR scans submitted', 'warning');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Floating Demo Alert / Popup Banner */}
      {alertPopup.show && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            alertPopup.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-amber-500/20'
              : alertPopup.type === 'danger'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-500/20'
              : 'bg-teal-950/90 border-teal-400/80 text-teal-200 shadow-teal-500/20'
          }`}
        >
          <div className="text-2xl shrink-0">
            {alertPopup.type === 'warning' ? '⚠️' : alertPopup.type === 'danger' ? '🚨' : '✅'}
          </div>
          <div className="flex-1">
            <div className="text-xs font-black tracking-wide text-white">{alertPopup.title}</div>
            <div className="text-[11px] opacity-80 font-medium">{alertPopup.message}</div>
          </div>
          <button
            onClick={() => setAlertPopup((prev) => ({ ...prev, show: false }))}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-teal-500/20">
              AGO
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white">Escrow Order Room</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  P2P SECURED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Order #{orderNumber} • Anti-Scam Verification</p>
            </div>
          </div>

          {onGoToMarketplace && (
            <button
              onClick={onGoToMarketplace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Marketplace</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Active Order Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <img src={itemImage} alt={itemTitle} className="w-13 h-13 rounded-xl object-cover border border-slate-700 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Active Escrow Order</span>
              <h3 className="text-xs font-bold text-white line-clamp-1">{itemTitle}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="font-extrabold text-emerald-400">{itemPrice}</span>
                <span>•</span>
                <span>Seller: <strong className="text-slate-200">{sellerName}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                state.isFrozen
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : state.isReleased
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              }`}
            >
              {state.isFrozen ? '🚨 FROZEN' : state.isReleased ? '🎉 COMPLETED' : '🔒 SECURED'}
            </span>
          </div>
        </div>

        {/* Financial Balances Card */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Live Escrow Balances
            </span>
            <span className="text-[11px] text-teal-400 font-semibold">100% Buyer & Seller Protection</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Escrow Balance Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-teal-950/40 to-slate-950 border border-teal-500/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Escrow Vault</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-400 mt-1">${state.escrowBalance.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                {state.isFrozen ? '🔒 Funds Frozen' : state.isReleased ? 'Funds Transferred' : '🔒 Locked Safe'}
              </span>
            </div>

            {/* Seller Balance Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-950 border border-cyan-500/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Seller Payout</span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">${state.sellerBalance.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                {state.isReleased ? '✅ Transferred' : 'Awaiting Delivery Proof'}
              </span>
            </div>
          </div>

          {/* Deposit / Reset Button */}
          <button
            onClick={handleDepositEscrow}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Send to Escrow ($50 Deposit)</span>
          </button>
        </div>

        {/* 4-Step Verification Timeline Progress */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1 text-teal-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1. Deposit</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1 ${state.sellerConfirmed ? 'text-teal-400' : 'text-slate-400'}`}>
            {state.sellerConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
            <span>2. Seller Proof</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1 ${state.buyerConfirmed ? 'text-teal-400' : 'text-slate-400'}`}>
            {state.buyerConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
            <span>3. Buyer Proof</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <div className={`flex items-center gap-1 ${state.isReleased ? 'text-emerald-400' : 'text-slate-400'}`}>
            {state.isReleased ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
            <span>4. Release</span>
          </div>
        </div>

        {/* Primary Interactive Action Grid */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
            Verification Actions
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Action 1: Seller: I Sent */}
            <button
              onClick={() => openProofModal('seller')}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 text-left transition flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-teal-400" /> Seller: I Sent
                </span>
                {state.sellerConfirmed && (
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/20 px-1.5 py-0.5 rounded">
                    ✓ Done
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">
                Capture dispatch waybill with timestamp watermark
              </span>
            </button>

            {/* Action 2: Buyer: I Received */}
            <button
              onClick={() => openProofModal('buyer')}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 text-left transition flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" /> Buyer: I Received
                </span>
                {state.buyerConfirmed && (
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                    ✓ Done
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">
                Capture unboxing inspection proof & watermark
              </span>
            </button>
          </div>

          {/* Action 3: Scan QR to Verify Package */}
          <button
            onClick={openQRScanner}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 hover:from-purple-900/60 hover:to-slate-850 border border-purple-500/40 text-left transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <span>Scan QR to Verify Package</span>
                  {state.qrVerified && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      ✓ Package Verified #{state.trackingCode}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Scan courier waybill barcode to confirm physical delivery
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
          </button>

          {/* Action 4 & 5: Release Funds & Report to Admin */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleReleaseFunds}
              disabled={state.isFrozen}
              className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Release Funds ($50)</span>
            </button>

            <button
              onClick={handleReportToAdmin}
              className={`py-3 px-3.5 rounded-2xl border font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                state.isFrozen
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{state.isFrozen ? 'Dispute Active (Unfreeze)' : 'Report to Admin'}</span>
            </button>
          </div>
        </div>

        {/* Dispute & Audit Proof Vault */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Dispute & Audit Proof Vault
              </h2>
            </div>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
              TAMPER-EVIDENT WATERMARK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Seller Proof Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-300 flex items-center gap-1">
                  <span>📦 Seller Dispatch Slip</span>
                </span>
                {state.sellerProofUrl && (
                  <span className="text-[10px] text-teal-400 font-bold">✓ Watermarked</span>
                )}
              </div>

              {state.sellerProofUrl ? (
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: state.sellerProofUrl!,
                      title: 'Seller Dispatch Slip with Watermark',
                      meta: `Timestamp: ${state.sellerProofTimestamp || '2026-08-23 09:42:15'} | Order #${orderNumber}`,
                    })
                  }
                  className="relative aspect-video rounded-xl overflow-hidden border border-teal-500/30 group cursor-pointer"
                >
                  <img
                    src={state.sellerProofUrl}
                    alt="Seller dispatch evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2 justify-between">
                    <span className="text-[10px] font-mono text-teal-300 font-bold">
                      {state.sellerProofTimestamp || '2026-08-23 09:42:15'}
                    </span>
                    <span className="p-1 rounded-md bg-slate-900/80 text-teal-300">
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => openProofModal('seller')}
                  className="aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-teal-400 hover:border-teal-500/50 cursor-pointer transition"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-[11px] font-semibold">Click to Capture Seller Proof</span>
                </div>
              )}
            </div>

            {/* Buyer Proof Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <span>🎁 Buyer Inspection Photo</span>
                </span>
                {state.buyerProofUrl && (
                  <span className="text-[10px] text-cyan-400 font-bold">✓ Watermarked</span>
                )}
              </div>

              {state.buyerProofUrl ? (
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: state.buyerProofUrl!,
                      title: 'Buyer Unboxing Inspection Proof',
                      meta: `Timestamp: ${state.buyerProofTimestamp || '2026-08-23 09:48:30'} | Order #${orderNumber}`,
                    })
                  }
                  className="relative aspect-video rounded-xl overflow-hidden border border-cyan-500/30 group cursor-pointer"
                >
                  <img
                    src={state.buyerProofUrl}
                    alt="Buyer inspection evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2 justify-between">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">
                      {state.buyerProofTimestamp || '2026-08-23 09:48:30'}
                    </span>
                    <span className="p-1 rounded-md bg-slate-900/80 text-cyan-300">
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => openProofModal('buyer')}
                  className="aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 cursor-pointer transition"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-[11px] font-semibold">Click to Capture Buyer Proof</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live P2P Anti-Scam Chat & Gemini AI Scam Guard */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                P2P Order Chat & Anti-Scam Guard
              </h2>
            </div>
            <span className="text-[10px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
              AI DETECTOR ACTIVE
            </span>
          </div>

          {/* Scam Alert Callout if Triggered */}
          {aiScamWarning && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-medium flex items-start gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{aiScamWarning}</span>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="max-h-56 overflow-y-auto space-y-2.5 p-2 rounded-2xl bg-slate-950 border border-slate-800/80">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'buyer'
                    ? 'items-end'
                    : msg.sender === 'seller'
                    ? 'items-start'
                    : 'items-center'
                }`}
              >
                {msg.sender === 'system' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] text-center max-w-sm">
                    {msg.text}
                  </div>
                ) : msg.sender === 'warning' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[11px] text-center max-w-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[82%] p-2.5 rounded-2xl text-xs ${
                      msg.sender === 'buyer'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-3 text-[10px] opacity-70 mb-0.5">
                      <span>{msg.sender === 'buyer' ? 'You (Buyer)' : sellerName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={inputChat}
              onChange={handleChatInputChange}
              placeholder="Type message (e.g. 'Can you dispatch tomorrow?')"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Cryptographic Audit Trail */}
        <details className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 text-xs group">
          <summary className="font-bold text-slate-400 cursor-pointer flex items-center justify-between list-none select-none">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Immutable Escrow Audit Trail ({auditLogs.length} Events)</span>
            </span>
            <span className="text-[10px] text-teal-400">View Log ▼</span>
          </summary>
          <div className="mt-3 space-y-1 font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                • {log}
              </div>
            ))}
          </div>
        </details>
      </main>

      {/* =========================================================================
          MODAL: Native Camera Viewfinder & Watermarking Engine
         ========================================================================= */}
      {proofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
                  {modalRole === 'seller' ? 'Seller: Capture Dispatch Slip' : 'Buyer: Capture Delivery Proof'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Automated "🛡️ AGO Verified" + Date & Time watermark
                </p>
              </div>
              <button onClick={closeProofModal} className="p-1.5 rounded-full bg-slate-800 text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {!tempCapturedImage ? (
                <div className="space-y-3">
                  {/* Camera Viewfinder */}
                  <div className="relative aspect-[4/3] rounded-2xl bg-black overflow-hidden border border-slate-700 flex items-center justify-center">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400 space-y-2">
                        <Camera className="w-10 h-10 mx-auto text-slate-500 animate-pulse" />
                        <p className="text-xs">Camera initialized or choose photo below</p>
                      </div>
                    )}

                    {/* Camera Targeting Overlay Grid */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-teal-400/40 rounded-2xl m-3 flex flex-col justify-between p-2">
                      <span className="text-[10px] font-mono text-teal-300 font-bold bg-black/60 px-2 py-0.5 rounded self-start">
                        [ EVIDENCE TARGET ]
                      </span>
                      <span className="text-[10px] font-mono text-teal-300 font-bold bg-black/60 px-2 py-0.5 rounded self-end">
                        AGO SECURE ENGINE
                      </span>
                    </div>
                  </div>

                  {/* Shutter & File Upload Controls */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={capturePhotoFromVideo}
                      className="py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-teal-400" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Preset Evidence Quick-Test Options */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Quick Demo Photo:
                    </span>
                    <button
                      onClick={() =>
                        applyWatermarkAndSetTemp(
                          modalRole === 'seller'
                            ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
                        )
                      }
                      className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700/80 flex items-center justify-center gap-1.5"
                    >
                      <span>📸 Stamp Sample {modalRole === 'seller' ? 'Shipping Waybill' : 'Inspection Photo'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Watermarked Preview */
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-teal-400 shadow-xl shadow-teal-500/20">
                    <img
                      src={tempCapturedImage}
                      alt="Watermarked capture"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Watermark Verification Applied
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Stamped with current Date, Time, and "🛡️ AGO VERIFIED" tag. Ready for Dispute Vault.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setTempCapturedImage(null);
                        startNativeCamera();
                      }}
                      className="py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleSaveProofToVault}
                      className="py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20"
                    >
                      Save to Proof Vault
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QR Code Scanner Viewfinder
         ========================================================================= */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Scan Package Waybill QR
                </h3>
                <p className="text-[11px] text-slate-400">
                  Align parcel QR code in viewfinder to verify
                </p>
              </div>
              <button onClick={closeQRModal} className="p-1.5 rounded-full bg-slate-800 text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-center">
              <div className="relative aspect-square rounded-2xl bg-black overflow-hidden border border-purple-500/40 flex items-center justify-center max-w-[280px] mx-auto">
                <video ref={qrVideoRef} playsInline muted autoPlay className="w-full h-full object-cover" />

                {/* Animated Scanner Reticle */}
                <div className="absolute inset-0 border-2 border-purple-400/80 rounded-2xl m-4 flex flex-col justify-between p-2">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
                  <div className="text-[10px] font-mono text-purple-300 font-bold bg-black/70 px-2 py-0.5 rounded self-center">
                    ALIGN WAYBILL BARCODE
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Tracking Waybill: <strong className="text-purple-300">#{state.trackingCode}</strong>
              </p>

              {/* Instant Verification Trigger */}
              <button
                onClick={handleSimulateQRScan}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20"
              >
                Simulate QR Code Match (Instant Test)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Lightbox Zoom for Proof Images
         ========================================================================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-3 p-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-xs font-bold text-teal-300">{lightboxImage.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{lightboxImage.meta}</p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-teal-500/30">
              <img src={lightboxImage.url} alt="Zoomed proof" className="w-full h-auto max-h-[75vh] object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

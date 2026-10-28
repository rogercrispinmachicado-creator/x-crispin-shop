import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  QrCode,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  History,
  Clock,
  Trash2,
} from 'lucide-react';
import jsQR from 'jsqr';
import { productService } from '../../services/productService';
import { storage } from '../../services/storage';
import { Product, ScannedItemHistory } from '../../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (slug: string) => void;
}

const formatTimeAgo = (isoString: string): string => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return new Date(isoString).toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Reciente';
  }
};

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanTab, setScanTab] = useState<'camera' | 'history' | 'upload' | 'demo'>('camera');
  const [scannedHistory, setScannedHistory] = useState<ScannedItemHistory[]>(() =>
    storage.getScannedHistory()
  );

  // Play audio beep upon detection
  const playBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // AudioContext might be blocked until user gesture, ignore safely
    }

    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // Ignore vibration errors
      }
    }
  }, []);

  // Handle successful detection
  const handleDetectedCode = useCallback(
    (codeText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);

      const product = productService.resolveFromScannedCode(codeText);
      if (product) {
        playBeep();
        setDetectedProduct(product);
        setUnrecognizedCode(null);

        // Save scanned item to local storage history
        const updatedHistory = storage.addScannedItem({
          productId: product.id,
          nombre: product.nombre,
          slug: product.slug,
          sku: product.sku,
          precio: product.precio,
          imagen: product.imagenes[0] || '',
          categoriaNombre: product.categoriaNombre,
          rawCode: codeText,
        });
        setScannedHistory(updatedHistory);

        // Auto navigate to product details after a brief visual confirmation
        setTimeout(() => {
          onProductFound(product.slug);
          onClose();
        }, 800);
      } else {
        setUnrecognizedCode(codeText);
        setDetectedProduct(null);
        // Allow scanning again after 2 seconds
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    },
    [isProcessing, onProductFound, onClose, playBeep]
  );

  // Stop current camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchEnabled(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setHasCameraPermission(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta el acceso a la cámara web.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as { torch?: boolean }) : {};
      setTorchSupported(Boolean(capabilities.torch));

      // Start the scan loop
      startScanLoop();
    } catch (err) {
      console.warn('Camera access error:', err);
      setHasCameraPermission(false);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permiso denegado para acceder a la cámara. Habilita los permisos en tu navegador o usa la opción de subir imagen / probar demo.'
          : 'No se pudo iniciar la cámara. Verifica que ningún otro programa la esté usando o prueba subir una imagen con código QR.';
      setCameraError(message);
    }
  }, [facingMode, stopCamera]);

  // Main scanning loop with jsQR
  const startScanLoop = useCallback(() => {
    const scan = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            handleDetectedCode(code.data);
            return; // Stop current loop turn
          }
        }
      }

      if (!isProcessing) {
        animationFrameIdRef.current = requestAnimationFrame(scan);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(scan);
  }, [handleDetectedCode, isProcessing]);

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const nextState = !torchEnabled;
      await track.applyConstraints({
        advanced: [{ torch: nextState } as MediaTrackConstraintSet],
      });
      setTorchEnabled(nextState);
    } catch (e) {
      console.warn('Could not toggle torch:', e);
    }
  };

  // Flip front / back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process uploaded image with QR code
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            handleDetectedCode(code.data);
          } else {
            setUnrecognizedCode('No se detectó un código QR válido en la imagen.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manual code submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleDetectedCode(manualCode.trim());
    }
  };

  // Select item from history
  const handleSelectFromHistory = (item: ScannedItemHistory) => {
    stopCamera();
    onProductFound(item.slug);
    onClose();
  };

  // Remove single item from history
  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = storage.removeScannedItem(id);
    setScannedHistory(updated);
  };

  // Clear all history
  const handleClearHistory = () => {
    storage.clearScannedHistory();
    setScannedHistory([]);
  };

  // Init and cleanup
  useEffect(() => {
    if (isOpen) {
      setScannedHistory(storage.getScannedHistory());
      setIsProcessing(false);
      setDetectedProduct(null);
      setUnrecognizedCode(null);
      if (scanTab === 'camera') {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanTab, startCamera, stopCamera]);

  if (!isOpen) return null;

  // Demo products for instant evaluation
  const demoProducts = productService.getFeatured(6);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="qr-scanner-title" className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Escanear Código QR</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  En Vivo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Apunta la cámara al código QR de un producto para ver sus detalles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setScanTab('camera')}
            className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              scanTab === 'camera'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Cámara</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setScanTab('history');
            }}
            className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              scanTab === 'history'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Recientes</span>
            {scannedHistory.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full border border-cyan-500/30 font-mono">
                {scannedHistory.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setScanTab('upload');
            }}
            className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              scanTab === 'upload'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setScanTab('demo');
            }}
            className={`flex-1 py-3 px-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              scanTab === 'demo'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Demo</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Camera Tab */}
          {scanTab === 'camera' && (
            <div className="p-4 sm:p-5 flex flex-col items-center space-y-4">
              {/* Viewport Box */}
              <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning reticle overlay */}
                {hasCameraPermission && !detectedProduct && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    {/* Outer dark vignette */}
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-cyan-400/80 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
                      {/* Reticle corner accents */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400"></div>

                      {/* Animated scanning laser beam */}
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse my-auto"></div>
                    </div>

                    <span className="mt-4 px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-[11px] font-medium text-slate-300 rounded-full border border-slate-700/60 shadow-xs">
                      Centra el código QR dentro del marco
                    </span>
                  </div>
                )}

                {/* Success Overlay on detection */}
                {detectedProduct && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      ¡Producto Identificado!
                    </span>
                    <h4 className="text-base font-black text-white line-clamp-2 max-w-xs">
                      {detectedProduct.nombre}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      SKU: <span className="font-mono text-cyan-400">{detectedProduct.sku}</span> • Bs. {detectedProduct.precio}
                    </p>
                    <span className="mt-4 text-[11px] text-cyan-300 flex items-center gap-1">
                      <span>Redirigiendo a ficha técnica...</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}

                {/* Camera Error / Permission Fallback */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Acceso a Cámara no disponible</h4>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      {cameraError}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reintentar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanTab('demo')}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Probar Códigos Demo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              {hasCameraPermission && (
                <div className="flex items-center justify-center gap-3 w-full">
                  {torchSupported && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        torchEnabled
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Alternar linterna"
                    >
                      {torchEnabled ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
                      <span>{torchEnabled ? 'Linterna Activada' : 'Linterna'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-3 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    title="Cambiar entre cámara trasera y frontal"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span>Girar Cámara</span>
                  </button>
                </div>
              )}

              {/* Recent Scans In-View Bar */}
              {scannedHistory.length > 0 && (
                <div className="w-full pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Escaneos Recientes</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold">
                        {scannedHistory.length}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setScanTab('history');
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Ver todos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Horizontal scrollable cards */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {scannedHistory.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectFromHistory(item)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all text-left shrink-0 max-w-[210px] cursor-pointer group"
                        title={`Ver detalles de ${item.nombre}`}
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                            {item.nombre}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono font-bold text-cyan-300">Bs. {item.precio}</span>
                            <span className="text-slate-500">{formatTimeAgo(item.scannedAt)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {scanTab === 'history' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Historial de Productos Escaneados</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded-full">
                      {scannedHistory.length}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Artículos escaneados mediante QR o código de barras guardados en tu dispositivo
                  </p>
                </div>

                {scannedHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors font-bold flex items-center gap-1 cursor-pointer"
                    title="Borrar todo el historial de escaneos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>

              {scannedHistory.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">No tienes productos en tu historial</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Los productos que escanees con la cámara o cargues mediante imagen aparecerán aquí automáticamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setScanTab('camera');
                      startCamera();
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Abrir Cámara</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {scannedHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFromHistory(item)}
                      className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                            {item.nombre}
                          </h5>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span className="font-mono text-cyan-400 font-bold">Bs. {item.precio}</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              {item.sku}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatTimeAgo(item.scannedAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar de historial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-2 text-slate-500 group-hover:text-cyan-400 transition-colors">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {scanTab === 'upload' && (
            <div className="p-6 space-y-4 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-3xl p-8 transition-colors cursor-pointer flex flex-col items-center space-y-3 bg-slate-950/40 hover:bg-slate-950/80"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Selecciona una foto o captura de pantalla con código QR
                  </p>
                  <p className="text-xs text-slate-400">
                    Formatos compatibles: JPG, PNG, WEBP
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Examinar Archivos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {unrecognizedCode && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">No se encontró coincidencia</p>
                    <p className="text-[11px] opacity-80">{unrecognizedCode}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demo Preset Tab for Instant Evaluation */}
          {scanTab === 'demo' && (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Códigos QR de Productos de Prueba:</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Haz clic en cualquier producto para simular el escaneo instantáneo con cámara y guardarlo en tu historial:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {demoProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleDetectedCode(prod.slug)}
                    className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {prod.nombre}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {prod.sku} • Bs. {prod.precio}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual SKU input footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ingresar SKU o nombre de producto manual..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>Buscar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

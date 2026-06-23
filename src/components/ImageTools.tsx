import React, { useState, useRef } from 'react';
import { Minimize, Maximize, FileOutput, FileImage, Files, Copy, Check, Upload, Download, RefreshCw, AlertCircle } from 'lucide-react';

interface ImageToolsProps {
  toolId: string;
}

export default function ImageTools({ toolId }: ImageToolsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- GENERAL IMAGE BASE STATES ---
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [sourceMeta, setSourceMeta] = useState<{ name: string; size: number; width: number; height: number; type: string } | null>(null);
  const [imgOutputUrl, setImgOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const triggerCopy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- 1. COMPRESSOR SPECIFIC ---
  const [compressQuality, setCompressQuality] = useState(0.7); // 70% default

  // --- 2. RESIZER SPECIFIC ---
  const [targetWidth, setTargetWidth] = useState<number | ''>(300);
  const [targetHeight, setTargetHeight] = useState<number | ''>(300);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [nativeRatio, setNativeRatio] = useState<number>(1);

  // --- COMPUTE FILE SIZE HELPER ---
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- FILE SELECT TRIGGER ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorStatus(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      // Load image on memory to extract resolution dimensions
      const img = new Image();
      img.onload = () => {
        const metadata = {
          name: file.name,
          size: file.size,
          width: img.width,
          height: img.height,
          type: file.type
        };
        setSourceMeta(metadata);
        setSourceImg(dataUrl);

        // Prepopulate resizer sizes
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        setNativeRatio(img.width / img.height);

        // Trigger dynamic action immediately based on tool ID
        processImage(dataUrl, metadata, img);
        setLoading(false);
      };
      img.onerror = () => {
        setErrorStatus('Failed to load image file. Verify corruption parameters.');
        setLoading(false);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setErrorStatus('Failed reading file bytes.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // --- IMAGE PROCESS CORE (CANVAS OPERATIONS) ---
  const processImage = (
    imgData: string = sourceImg!,
    meta: typeof sourceMeta = sourceMeta!,
    preloadedImg?: HTMLImageElement,
    overrideQuality?: number,
    overrideWidth?: number,
    overrideHeight?: number
  ) => {
    if (!imgData) return;

    const img = preloadedImg || new Image();
    const runCanvas = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dimension configurations
      let w = overrideWidth || (toolId === 'image-resizer' ? (Number(targetWidth) || meta.width) : meta.width);
      let h = overrideHeight || (toolId === 'image-resizer' ? (Number(targetHeight) || meta.height) : meta.height);

      canvas.width = w;
      canvas.height = h;

      // Flatten transparency with solid backgrounds when converting PNG -> JPG
      if (toolId === 'png-to-jpg' || (toolId === 'image-compressor' && meta.type === 'image/png')) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);

      // Export based on tool definitions
      let mime = meta.type;
      let qual = overrideQuality || compressQuality;

      if (toolId === 'jpg-to-png') {
        mime = 'image/png';
      } else if (toolId === 'png-to-jpg' || toolId === 'image-compressor') {
        mime = 'image/jpeg';
      }

      // Convert to base64 export block
      if (toolId === 'image-to-base64') {
        setImgOutputUrl(imgData); // simply copy source base64
        setOutputSize(imgData.length);
      } else {
        const outUrl = canvas.toDataURL(mime, mime === 'image/jpeg' ? qual : undefined);
        setImgOutputUrl(outUrl);
        // Estimate file size from base64 string
        const base64Length = outUrl.split(',')[1].length;
        const sizeInBytes = Math.ceil((base64Length * 3) / 4) - (outUrl.indexOf('=') > -1 ? (outUrl.length - outUrl.indexOf('=')) : 0);
        setOutputSize(sizeInBytes);
      }
    };

    if (preloadedImg) {
      runCanvas();
    } else {
      img.onload = runCanvas;
      img.src = imgData;
    }
  };

  const handleResizeWidthChange = (valStr: string) => {
    if (valStr === '') {
      setTargetWidth('');
      return;
    }
    const val = Math.max(1, Math.round(Number(valStr)));
    setTargetWidth(val);
    if (aspectLocked && nativeRatio) {
      setTargetHeight(Math.max(1, Math.round(val / nativeRatio)));
    }
  };

  const handleResizeHeightChange = (valStr: string) => {
    if (valStr === '') {
      setTargetHeight('');
      return;
    }
    const val = Math.max(1, Math.round(Number(valStr)));
    setTargetHeight(val);
    if (aspectLocked && nativeRatio) {
      setTargetWidth(Math.max(1, Math.round(val * nativeRatio)));
    }
  };

  const triggerDownload = () => {
    if (!imgOutputUrl || !sourceMeta) return;
    const link = document.createElement('a');
    let ext = sourceMeta.name.split('.').pop() || 'png';
    
    if (toolId === 'jpg-to-png') ext = 'png';
    else if (toolId === 'png-to-jpg') ext = 'jpg';

    link.href = imgOutputUrl;
    link.download = `toolhub_processed_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FILE PICKER & ACTIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              {toolId === 'image-compressor' && <Minimize className="w-5 h-5 text-rose-500" />}
              {toolId === 'image-resizer' && <Maximize className="w-5 h-5 text-rose-500" />}
              {toolId === 'image-to-base64' && <FileOutput className="w-5 h-5 text-rose-500" />}
              {toolId === 'jpg-to-png' && <FileImage className="w-5 h-5 text-rose-500" />}
              {toolId === 'png-to-jpg' && <Files className="w-5 h-5 text-rose-500" />}
              Upload and Convert
            </h3>

            {/* Input File Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-rose-500 rounded-2xl p-8 text-center cursor-pointer transition bg-zinc-50 dark:bg-zinc-950/40 relative group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Upload className="w-10 h-10 text-zinc-400 group-hover:text-rose-500 mx-auto mb-3 transition-transform duration-300 group-hover:-translate-y-1" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Drag & drop your photo file here</p>
              <p className="text-xs text-zinc-400 mt-1">or Click to search desktop folders. (Supports PNG, JPG, WEBP, GIF)</p>
            </div>

            {errorStatus && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 dark:bg-rose-950/30 text-xs">
                <AlertCircle className="w-4 h-4" />
                {errorStatus}
              </div>
            )}

            {/* Source Photo Specifications */}
            {sourceMeta && (
              <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-xl grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-zinc-400">File Name</span>
                  <span className="font-semibold text-zinc-800 dark:text-white truncate block">{sourceMeta.name}</span>
                </div>
                <div>
                  <span className="block text-zinc-400">Original Size</span>
                  <span className="font-bold text-zinc-800 dark:text-white font-mono">{formatBytes(sourceMeta.size)}</span>
                </div>
                <div>
                  <span className="block text-zinc-400">Resolution</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{sourceMeta.width} x {sourceMeta.height} px</span>
                </div>
                <div>
                  <span className="block text-zinc-400">Mimetype</span>
                  <span className="font-medium text-zinc-500 uppercase font-mono">{sourceMeta.type.split('/')[1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE TOOL CONFIG PARAMETERS */}
          {sourceImg && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <h4 className="text-md font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-850 pb-2">Adjust Compression Settings</h4>

              {/* 1. COMPRESSOR ARRAYS */}
              {toolId === 'image-compressor' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-650 dark:text-zinc-300">Target Output Quality</span>
                    <span className="text-rose-600 font-mono font-bold">{Math.round(compressQuality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={compressQuality}
                    onChange={(e) => { setCompressQuality(Number(e.target.value)); processImage(sourceImg, sourceMeta, undefined, Number(e.target.value)); }}
                    className="w-full h-2 bg-gradient-to-r from-rose-200 to-rose-600 h-2 bg-zinc-200 dark:bg-zinc-850 rounded-lg cursor-pointer accent-rose-500"
                  />
                  <p className="text-xs text-zinc-400">Lower values reduce file sizes dramatically, while higher percentages maintain absolute pixel clarity.</p>
                </div>
              )}

              {/* 2. RESIZER ARRAYS */}
              {toolId === 'image-resizer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 font-bold mb-1">Target Width (Pixels)</label>
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => handleResizeWidthChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 font-bold mb-1">Target Height (Pixels)</label>
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => handleResizeHeightChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="aspect-lock"
                      checked={aspectLocked}
                      onChange={(e) => setAspectLocked(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <label htmlFor="aspect-lock" className="text-xs text-zinc-500 font-semibold cursor-pointer">Lock Aspect Ratio ({nativeRatio.toFixed(2)})</label>
                  </div>

                  <button
                    onClick={() => processImage()}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition"
                  >
                    Apply New Dimensions
                  </button>
                </div>
              )}

              {/* 5. JPG TO PNG OR TRANS CONVERTERS CONTROLS */}
              {(toolId === 'jpg-to-png' || toolId === 'png-to-jpg') && (
                <div>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Auto Conversion Ready! Your downloaded file will build instantly under target codec.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GENERATED RESULTS */}
        <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm uppercase text-zinc-400 font-bold tracking-wider mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Results output</h3>

            {sourceImg && imgOutputUrl ? (
              <div className="space-y-4">
                
                {/* 3. BASE64 STRING VIEW */}
                {toolId === 'image-to-base64' ? (
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-zinc-400 uppercase">Embedding String</span>
                    <textarea
                      readOnly
                      value={imgOutputUrl}
                      className="w-full h-44 text-xs font-mono bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 select-all"
                    />
                    <button
                      onClick={() => triggerCopy(imgOutputUrl, 'img_b64')}
                      className="w-full py-2 border border-rose-500 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition"
                    >
                      {copied === 'img_b64' ? 'Copied base64 URI!' : 'Copy raw base64 URI'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Visual Photo Rendering */}
                    <div className="bg-white p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs inline-block max-w-full overflow-hidden">
                      <img src={imgOutputUrl} alt="Processed output preview" className="max-h-56 object-contain rounded-lg mx-auto" />
                    </div>

                    <div className="mt-4 space-y-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Processed Output Capacity</span>
                        <span className="font-bold font-mono text-zinc-800 dark:text-white">
                          {outputSize ? formatBytes(outputSize) : 'Estimating...'}
                        </span>
                      </div>
                      
                      {outputSize && sourceMeta && outputSize < sourceMeta.size && (
                        <div className="text-xs text-emerald-600 font-bold">
                          Successfully reduced size by {Math.round(((sourceMeta.size - outputSize) / sourceMeta.size) * 100)}%!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 text-center py-16">Provide source image elements to trigger conversion workflows.</p>
            )}
          </div>

          {sourceImg && imgOutputUrl && toolId !== 'image-to-base64' && (
            <button
              onClick={triggerDownload}
              className="mt-6 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Download Pro Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

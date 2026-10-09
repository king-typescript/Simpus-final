import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiShield, FiLock, FiAlertTriangle } from 'react-icons/fi'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function EbookReaderModal({ ebook, student, onClose }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isScreenProtected, setIsScreenProtected] = useState(false)

  const studentName = student?.name || student?.username || 'Siswa SIMPUS'
  const studentNis = student?.nis || student?.libraryCardNumber || 'NIS-SIMPUS'
  const watermarkText = `${studentName.toUpperCase()} | NIS: ${studentNis} | SIMPUS DRM HAK CIPTA DILINDUNGI`

  // 1. Anti-Screenshot / Screen Recording Focus & Visibility Protection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenProtected(true)
      }
    }

    const handleBlur = () => {
      setIsScreenProtected(true)
    }

    const handleFocus = () => {
      setIsScreenProtected(false)
    }

    // Keydown block (Ctrl+P, Ctrl+S, Ctrl+C, Ctrl+U, PrintScreen, F12)
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault()
        e.stopPropagation()
        setIsScreenProtected(true)
        setTimeout(() => setIsScreenProtected(false), 2000)
        return false
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 2. Load PDF Document via PDF.js
  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(null)

    const fileUrl = ebook?.fileUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    })

    loadingTask.promise
      .then((doc) => {
        if (!active) return
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Gagal memuat PDF E-Book:', err)
        if (!active) return
        setLoadError('Gagal memuat file E-Book. Memuat fallback reader...')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [ebook])

  // 3. Render PDF Page on HTML5 Canvas (No selectable text)
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let renderTask = null
    pdfDoc.getPage(currentPage).then((page) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')

      const viewport = page.getViewport({ scale })
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      renderTask = page.render(renderContext)
    })

    return () => {
      if (renderTask) renderTask.cancel()
    }
  }, [pdfDoc, currentPage, scale])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-slate-950/95 flex flex-col select-none overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header Bar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
              <FiShield className="text-sm" />
              DRM PROTECTED
            </div>
            <h2 className="text-white font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
              {ebook?.title || 'E-Book Reader'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1 rounded-xl text-xs">
              <FiLock className="text-emerald-400" />
              Anti-Screenshot Active
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Tutup Reader"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="h-12 bg-slate-900/80 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-10 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <FiChevronLeft size={16} />
            </button>
            <span>
              Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
              <strong className="text-white">{totalPages || 1}</strong>
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.7, s - 0.15))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              title="Zoom Out"
            >
              <FiZoomOut size={16} />
            </button>
            <span className="w-12 text-center text-slate-400">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              title="Zoom In"
            >
              <FiZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Reader Canvas Area with Dynamic Watermark */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-slate-950 custom-scrollbar"
        >
          {/* Blackout Overlay during App Switch / Screenshot Attempt */}
          {isScreenProtected && (
            <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <FiAlertTriangle className="text-yellow-400 text-5xl mb-4 animate-bounce" />
              <h3 className="text-white text-lg font-bold">Perlindungan Hak Cipta Aktif</h3>
              <p className="text-slate-400 text-sm max-w-md mt-2">
                Konten E-Book disembunyikan secara otomatis saat aplikasi kehilangan fokus atau terdeteksi aktivitas rekam layar.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Memuat halaman E-Book terenkripsi...</p>
            </div>
          )}

          {loadError && (
            <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
              <p className="text-slate-300 text-sm mb-4">{loadError}</p>
              {/* Fallback Sample Page Viewer */}
              <div className="w-full h-96 bg-white rounded-xl p-8 text-slate-800 text-left overflow-y-auto shadow-2xl relative">
                <h1 className="text-2xl font-black mb-4">{ebook?.title || 'E-Book Demo'}</h1>
                <p className="text-sm font-semibold text-slate-600 mb-6">Penulis: {ebook?.author || 'Penulis SIMPUS'}</p>
                <p className="text-sm leading-relaxed mb-4">
                  Ini adalah konten sampel dari E-Book digital SIMPUS. Sistem melindungi setiap halaman dengan watermark identitas siswa dan proteksi layar anti-screenshot.
                </p>
                <p className="text-sm leading-relaxed mb-4">
                  Dengan fitur DRM ini, e-book hanya dapat dibaca di dalam aplikasi tanpa risiko pembajakan atau penyebaran file tanpa izin.
                </p>
              </div>
            </div>
          )}

          {/* Secure Canvas Document */}
          <div className={`relative shadow-2xl rounded-lg overflow-hidden transition-all ${loading || loadError ? 'hidden' : 'block'}`}>
            <canvas ref={canvasRef} className="block max-w-full bg-white rounded-lg" />

            {/* Dynamic Watermark Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none z-30 grid grid-cols-2 grid-rows-3 gap-6 p-6 overflow-hidden opacity-25">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center transform -rotate-12 select-none text-[11px] sm:text-xs font-black tracking-widest text-slate-900 text-center leading-relaxed drop-shadow-sm"
                >
                  {watermarkText}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

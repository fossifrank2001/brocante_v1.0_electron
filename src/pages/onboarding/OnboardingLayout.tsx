import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import { setActivePage } from "Data/Slices/NavigationSlice.ts"
import { Pages } from "Data/Objects/state.ts"
import welcomeIllustration from "../../assets/onboarding/welcome.svg"
import searchIllustration from "../../assets/onboarding/search.svg"
import sellIllustration from "../../assets/onboarding/sell.svg"
import communityIllustration from "../../assets/onboarding/community.svg"
import databaseIllustration from "../../assets/onboarding/upload.svg"
import DatabaseImport from "@/pages/onboarding/DatabaseImport.tsx"
import { ArrowForward, ArrowBack, SkipNext } from "@mui/icons-material"

const slides = [
  {
    title: "Bienvenue sur BrocanteApp",
    description: "Une solution complète pour gérer votre boutique brocante — stocks, clients, ventes et fournisseurs en un seul endroit.",
    illustration: welcomeIllustration,
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #4338ca 100%)",
    accent: "#6366f1",
    tag: "Démarrage",
  },
  {
    title: "Catalogue & Articles",
    description: "Gérez votre inventaire avec précision. Suivez vos stocks en temps réel et identifiez rapidement les articles à réapprovisionner.",
    illustration: searchIllustration,
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)",
    accent: "#059669",
    tag: "Inventaire",
  },
  {
    title: "Ventes simplifiées",
    description: "Créez des factures, suivez vos encaissements et analysez vos performances de vente de façon intuitive.",
    illustration: sellIllustration,
    gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 60%, #f87171 100%)",
    accent: "#dc2626",
    tag: "Ventes",
  },
  {
    title: "Clients & Fournisseurs",
    description: "Centralisez vos relations commerciales. Gardez un historique complet de chaque client et suivez vos fournisseurs.",
    illustration: communityIllustration,
    gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 60%, #a78bfa 100%)",
    accent: "#7c3aed",
    tag: "Relations",
  },
  {
    title: "Importez vos données",
    description: "Démarrez rapidement en important une base de données existante ou commencez avec un espace vierge.",
    illustration: databaseIllustration,
    gradient: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #38bdf8 100%)",
    accent: "#0ea5e9",
    tag: "Configuration",
  },
]

const OnboardingLayout: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const dispatch = useDispatch()

  const slide = slides[currentSlide]
  const isLast = currentSlide === slides.length - 1
  const progress = ((currentSlide + 1) / slides.length) * 100

  const nextSlide = () => {
    if (!isLast) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    } else {
      dispatch(setActivePage({ page: Pages.HOME }))
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }

  const skipOnboarding = () => {
    dispatch(setActivePage({ page: Pages.HOME }))
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {/* ─── Left Panel (Illustration) ─── */}
      <motion.div
        style={{
          width: "45%",
          minHeight: "100vh",
          background: slide.gradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
        animate={{ background: slide.gradient }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-40px",
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "-80px",
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", pointerEvents: "none"
        }} />

        {/* App brand */}
        <motion.div
          style={{ position: "absolute", top: 36, left: 36, display: "flex", alignItems: "center", gap: 12 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.4)",
            fontSize: 20,
          }}>
            🏺
          </div>
          <span style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            BrocanteApp
          </span>
        </motion.div>

        {/* Step tag */}
        <motion.div
          key={`tag-${currentSlide}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            position: "absolute", top: 36, right: 36,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 100, padding: "6px 16px",
            color: "white", fontWeight: 700, fontSize: "0.78rem",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}
        >
          {slide.tag}
        </motion.div>

        {/* Illustration */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`img-${currentSlide}`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 80 : -80, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -80 : 80, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
          >
            <motion.div
              style={{
                width: 240, height: 240,
                borderRadius: 40,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(16px)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 32px 64px -16px rgba(0,0,0,0.25)",
              }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={slide.illustration}
                alt={slide.title}
                style={{ width: 165, height: 165, objectFit: "contain" }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Step counter */}
        <div style={{ position: "absolute", bottom: 36, left: 36, right: 36 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {slides.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
                animate={{ width: i === currentSlide ? 28 : 8 }}
                style={{
                  height: 8, borderRadius: 4,
                  background: i === currentSlide ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Right Panel (Content) ─── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "0 56px",
        justifyContent: "center",
        position: "relative",
        background: "#ffffff",
        minHeight: "100vh",
      }}>
        {/* Progress bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#f1f5f9" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ height: "100%", background: slide.gradient, borderRadius: "0 4px 4px 0" }}
          />
        </div>

        {/* Top nav */}
        <div style={{ position: "absolute", top: 28, right: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700 }}>
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={skipOnboarding}
            style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "6px 16px", cursor: "pointer",
              fontWeight: 700, fontSize: "0.82rem", color: "#64748b",
              display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#f1f5f9" }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "#f8fafc" }}
          >
            <SkipNext sx={{ fontSize: 16 }} /> Passer
          </button>
        </div>

        {/* Main text content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${currentSlide}`}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -40 : 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}
            style={{ maxWidth: 480 }}
          >
            {/* Accent badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: `${slide.accent}12`,
                border: `1.5px solid ${slide.accent}25`,
                borderRadius: 100, padding: "5px 14px",
                marginBottom: 20,
              }}
            >
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: slide.accent,
                boxShadow: `0 0 8px ${slide.accent}`,
              }} />
              <span style={{ fontWeight: 800, fontSize: "0.75rem", color: slide.accent, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {slide.tag}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "2.2rem", fontWeight: 900, color: "#0f172a",
                letterSpacing: "-0.035em", lineHeight: 1.15,
                marginBottom: 20, margin: "0 0 20px 0",
              }}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: "1.05rem", color: "#64748b", fontWeight: 500,
                lineHeight: 1.7, margin: "0 0 36px 0",
              }}
            >
              {slide.description}
            </motion.p>

            {/* Feature tags for context */}
            {currentSlide === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}
              >
                {["📦 Stocks", "🧾 Factures", "👥 Clients", "🔐 Accès", "📊 Rapports"].map(tag => (
                  <span key={tag} style={{
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: 8, padding: "5px 12px",
                    fontSize: "0.82rem", fontWeight: 700, color: "#475569",
                  }}>{tag}</span>
                ))}
              </motion.div>
            )}

            {/* Database Import on last slide */}
            {isLast && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={{ marginBottom: 36 }}
              >
                <DatabaseImport />
              </motion.div>
            )}

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  style={{
                    width: 52, height: 52,
                    borderRadius: 16, border: "1.5px solid #e2e8f0",
                    background: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#64748b", transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.background = "#f1f5f9"
                    b.style.borderColor = "#cbd5e1"
                  }}
                  onMouseLeave={e => {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.background = "white"
                    b.style.borderColor = "#e2e8f0"
                  }}
                >
                  <ArrowBack sx={{ fontSize: 20 }} />
                </button>
              )}

              <motion.button
                onClick={nextSlide}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, height: 54,
                  borderRadius: 16, border: "none",
                  background: slide.gradient,
                  color: "white", fontWeight: 800, fontSize: "1rem",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  boxShadow: `0 10px 28px -6px ${slide.accent}55`,
                  letterSpacing: "-0.01em",
                  transition: "box-shadow 0.2s",
                }}
              >
                {isLast ? "Commencer →" : (
                  <>Continuer <ArrowForward sx={{ fontSize: 20 }} /></>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom watermark */}
        <div style={{
          position: "absolute", bottom: 28, left: 56,
          fontSize: "0.78rem", color: "#cbd5e1", fontWeight: 600,
        }}>
          © 2025 BrocanteApp · Tous droits réservés
        </div>
      </div>
    </div>
  )
}

export default OnboardingLayout
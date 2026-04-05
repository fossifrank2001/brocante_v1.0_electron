import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import { setActivePage } from "Data/Slices/NavigationSlice.ts"
import { Pages } from "Data/Objects/state.ts"

const slides = [
  {
    emoji: "🏺",
    title: "Bienvenue sur BrocanteApp",
    description: "Une solution complète pour gérer votre boutique — stocks, ventes, clients et fournisseurs en un seul endroit.",
    accent: "#4f46e5",
  },
  {
    emoji: "📦",
    title: "Catalogue & Ventes",
    description: "Gérez votre inventaire, créez des factures et suivez vos performances de vente en temps réel.",
    accent: "#059669",
  },
  {
    emoji: "🚀",
    title: "Prêt à démarrer ?",
    description: "Vos données restent locales et sécurisées. Vous pouvez importer une base existante ou partir de zéro depuis les Paramètres.",
    accent: "#0ea5e9",
  },
]

const OnboardingLayout: React.FC = () => {
  const [current, setCurrent] = useState(0)
  const dispatch = useDispatch()

  const slide = slides[current]
  const isLast = current === slides.length - 1

  const finish = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    dispatch(setActivePage({ page: Pages.HOME }))
  }

  const next = () => {
    if (isLast) finish()
    else setCurrent(c => c + 1)
  }

  const skip = () => finish()

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      {/* Skip button */}
      <div style={{ position: "fixed", top: 20, right: 24 }}>
        <button
          onClick={skip}
          style={{
            background: "transparent",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "6px 16px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.82rem",
            color: "#94a3b8",
          }}
        >
          Passer
        </button>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "white",
            borderRadius: 24,
            padding: "48px 40px",
            maxWidth: 460,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "1px solid #f1f5f9",
          }}
        >
          {/* Emoji icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: `${slide.accent}12`,
            border: `2px solid ${slide.accent}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 28px",
          }}>
            {slide.emoji}
          </div>

          <h1 style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}>
            {slide.title}
          </h1>

          <p style={{
            fontSize: "1rem",
            color: "#64748b",
            fontWeight: 500,
            lineHeight: 1.7,
            margin: "0 0 36px",
          }}>
            {slide.description}
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={next}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: slide.accent,
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            {isLast ? "Commencer →" : "Continuer"}
          </motion.button>

          {/* Back button */}
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              style={{
                marginTop: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#94a3b8",
                width: "100%",
                padding: "8px",
              }}
            >
              ← Retour
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === current ? 24 : 8 }}
            style={{
              height: 8,
              borderRadius: 4,
              background: i === current ? slide.accent : "#e2e8f0",
              cursor: "pointer",
            }}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 24,
        fontSize: "0.75rem",
        color: "#cbd5e1",
        fontWeight: 600,
      }}>
        © 2026 BrocanteApp · Tous droits réservés
      </p>
    </div>
  )
}

export default OnboardingLayout
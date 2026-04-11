import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import { setActivePage } from "Data/Slices/NavigationSlice.ts"
import { Pages } from "Data/Objects/state.ts"
import ThemeToggle from "@/Components/utils/ThemeToggle"

const slides = [
  {
    emoji: "🏺",
    title: "Bienvenue sur BrocanteApp",
    description: "Une solution complète pour gérer votre boutique — stocks, ventes, clients et fournisseurs en un seul endroit.",
    accent: "var(--accent-primary)",
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
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "24px",
      transition: "background-color 0.3s ease",
    }}>
      {/* Top bar: theme toggle + skip */}
      <div style={{ position: "fixed", top: 20, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <ThemeToggle compact />
        <button
          onClick={skip}
          style={{
            background: "transparent",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "6px 16px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            boxShadow: "none",
            transform: "none",
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
            background: "var(--bg-surface)",
            borderRadius: 24,
            padding: "48px 40px",
            maxWidth: 460,
            width: "100%",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-color)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          {/* Emoji icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "var(--accent-primary-muted)",
            border: "2px solid var(--border-color)",
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
            color: "var(--text-primary)",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}>
            {slide.title}
          </h1>

          <p style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
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
                color: "var(--text-muted)",
                width: "100%",
                padding: "8px",
                boxShadow: "none",
                transform: "none",
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
              background: i === current ? slide.accent : "var(--border-color)",
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
        color: "var(--text-muted)",
        fontWeight: 600,
      }}>
        © 2026 BrocanteApp · Tous droits réservés
      </p>
    </div>
  )
}

export default OnboardingLayout
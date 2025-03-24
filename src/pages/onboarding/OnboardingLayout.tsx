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
import DatabaseImport from "@/pages/onboarding/DatabaseImport.tsx";

const slides = [
  {
    title: "Welcome to BrocanteApp",
    description: "Discover a new way to buy and sell unique items",
    illustration: welcomeIllustration,
    color: "#4F46E5",
  },
  {
    title: "Find Treasures",
    description: "Browse a carefully curated selection of vintage and collectible items",
    illustration: searchIllustration,
    color: "#059669",
  },
  {
    title: "Sell Easily",
    description: "Post your items in just a few clicks and reach passionate buyers",
    illustration: sellIllustration,
    color: "#DC2626",
  },
  {
    title: "Join the Community",
    description: "Connect with other enthusiasts and build lasting relationships",
    illustration: communityIllustration,
    color: "#7C3AED",
  },
  {
    title: "Import Your Data",
    description: "Use an existing database or start with a new one",
    illustration: databaseIllustration,
    color: "#0EA5E9",
  },
]

const OnboardingLayout: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const dispatch = useDispatch()

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    } else {
      dispatch(setActivePage({ page: Pages.HOME }))
    }
  }

  const skipOnboarding = () => {
    dispatch(setActivePage({ page: Pages.HOME }))
  }

  return (
      <div className="min-vh-100 d-flex flex-column bg-white">
        {/* Header with skip button */}
        <motion.div
            className="p-3 d-flex justify-content-end"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
          <motion.button
              onClick={skipOnboarding}
              className="btn btn-link text-secondary text-decoration-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          >
            Skip
          </motion.button>
        </motion.div>

        {/* Main content */}
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="text-center mb-4"
                  >
                    <motion.div
                        className="d-inline-block rounded-4 p-3"
                        style={{ backgroundColor: `${slides[currentSlide].color}10` }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <img
                          src={slides[currentSlide].illustration || "/placeholder.svg"}
                          alt={slides[currentSlide].title}
                          style={{
                            width: "180px",
                            height: "180px",
                            objectFit: "contain",
                          }}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Text */}
                <AnimatePresence mode="wait">
                  <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="text-center mb-5"
                  >
                    <motion.h1
                        className="h3 mb-3"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                    <motion.p
                        className="text-secondary px-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                      {slides[currentSlide].description}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>

                {/* Database Import Component */}
                {currentSlide === slides.length - 1 && <DatabaseImport />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with pagination and button */}
        <div className="container pb-4">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              {/* Pagination dots */}
              <div className="d-flex justify-content-center mb-4">
                {slides.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className="btn btn-link p-2"
                        whileHover={{ scale: 1.2 }}
                    >
                      <motion.div
                          style={{
                            width: index === currentSlide ? "16px" : "8px",
                            height: "8px",
                            borderRadius: "4px",
                            backgroundColor: index === currentSlide ? slides[currentSlide].color : "#dee2e6",
                            transition: "all 0.3s ease",
                          }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                      />
                    </motion.button>
                ))}
              </div>

              {/* Action button */}
              <motion.button
                  onClick={nextSlide}
                  className="btn w-100 text-white"
                  style={{
                    backgroundColor: slides[currentSlide].color,
                    height: "48px",
                    boxShadow: `0 4px 12px -4px ${slides[currentSlide].color}80`,
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 6px 16px -4px ${slides[currentSlide].color}90` }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
              >
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default OnboardingLayout
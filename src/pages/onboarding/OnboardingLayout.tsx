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
  const [direction, setDirection] = useState(0)
  const dispatch = useDispatch()
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide((prev) => prev + 1)
    } else {
      dispatch(setActivePage({ page: Pages.HOME }))
    }
  }
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide((prev) => prev - 1)
    }
  }

  const skipOnboarding = () => {
    dispatch(setActivePage({ page: Pages.HOME }))
  }

  return (
      <motion.div 
        className="min-vh-100 d-flex flex-column"
        style={{
          background: `linear-gradient(135deg, ${slides[currentSlide].color}15 0%, #ffffff 100%)`,
          transition: 'background 0.6s ease-in-out'
        }}
      >
        {/* Header with navigation */}
        <motion.div 
          className="p-3 d-flex justify-content-between align-items-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.button
            onClick={prevSlide}
            className="btn btn-link text-muted text-decoration-none"
            variants={item}
            style={{
              visibility: currentSlide === 0 ? 'hidden' : 'visible',
              fontSize: '1.1rem'
            }}
            whileHover={{ x: -3, color: slides[currentSlide].color }}
          >
            ← Back
          </motion.button>
          
          <motion.button
            onClick={skipOnboarding}
            className="btn btn-link text-muted text-decoration-none"
            variants={item}
            style={{ fontSize: '1.1rem' }}
            whileHover={{ scale: 1.05, color: slides[currentSlide].color }}
          >
            Skip
          </motion.button>
        </motion.div>

        {/* Main content */}
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-4 position-relative">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.9 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                      mass: 0.5
                    }}
                    className="text-center mb-5"
                  >
                    <motion.div
                      className="d-inline-block rounded-4 p-4 mb-4"
                      style={{ 
                        backgroundColor: `${slides[currentSlide].color}15`,
                        boxShadow: `0 10px 30px -10px ${slides[currentSlide].color}30`
                      }}
                      whileHover={{ 
                        scale: 1.03,
                        rotate: [0, -2, 2, 0],
                        transition: { 
                          rotate: { 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut' 
                          } 
                        } 
                      }}
                    >
                      <motion.img
                        src={slides[currentSlide].illustration || "/placeholder.svg"}
                        alt={slides[currentSlide].title}
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "contain",
                        }}
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {/* Text */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${currentSlide}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: 0.3,
                        type: 'spring',
                        stiffness: 100,
                        damping: 10
                      } 
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -30,
                      transition: { duration: 0.2 }
                    }}
                    className="text-center mb-5"
                  >
                    <motion.h1
                      className="h2 mb-4 fw-bold"
                      style={{ 
                        color: slides[currentSlide].color,
                        textShadow: `0 2px 10px ${slides[currentSlide].color}20`
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                    <motion.p
                      className="text-muted px-4 fs-5"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
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
                  className="btn w-100 text-white fw-bold position-relative"
                  style={{
                    backgroundColor: slides[currentSlide].color,
                    height: "56px",
                    fontSize: "1.1rem",
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: `0 6px 16px -4px ${slides[currentSlide].color}80`,
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: `0 8px 20px -4px ${slides[currentSlide].color}90`,
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    boxShadow: `0 4px 8px -2px ${slides[currentSlide].color}90`
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { 
                      delay: 0.4,
                      type: 'spring',
                      stiffness: 100,
                      damping: 10
                    } 
                  }}
                >
                  <motion.span 
                    className="position-absolute inset-0 bg-white opacity-0"
                    style={{ zIndex: -1 }}
                    whileHover={{ opacity: 0.15 }}
                    transition={{ duration: 0.3 }}
                  />
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
  )
}

export default OnboardingLayout
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import welcomeIllustration from '../../assets/onboarding/welcome.svg';
import searchIllustration from '../../assets/onboarding/search.svg';
import sellIllustration from '../../assets/onboarding/sell.svg';
import communityIllustration from '../../assets/onboarding/community.svg';
import { useDispatch } from 'react-redux';
import { setActivePage } from '../../Data/Slices/NavigationSlice';
import { Pages } from '../../Data/Objects/state';

const slides = [
  {
    title: "Bienvenue sur BrocanteApp",
    description: "Découvrez une nouvelle façon d'acheter et de vendre des objets uniques",
    illustration: welcomeIllustration,
    color: "#4F46E5"
  },
  {
    title: "Trouvez des Trésors",
    description: "Parcourez une sélection soigneusement organisée d'objets vintage et de collection",
    illustration: searchIllustration,
    color: "#059669"
  },
  {
    title: "Vendez Facilement",
    description: "Publiez vos objets en quelques clics et touchez des acheteurs passionnés",
    illustration: sellIllustration,
    color: "#DC2626"
  },
  {
    title: "Rejoignez la Communauté",
    description: "Échangez avec d'autres passionnés et créez des liens durables",
    illustration: communityIllustration,
    color: "#7C3AED"
  }
];

const OnboardingLayout: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      dispatch(setActivePage({ page: Pages.HOME }));
    }
  };

  const skipOnboarding = () => {
    dispatch(setActivePage({ page: Pages.HOME }));
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Header avec bouton passer */}
      <div className="p-3 d-flex justify-content-end">
        <motion.button
          onClick={skipOnboarding}
          className="btn btn-link text-secondary text-decoration-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Passer
        </motion.button>
      </div>

      {/* Contenu principal */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-4">
        {/* Illustration */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center mb-4"
                >
                  <div 
                    className="d-inline-block rounded-4 p-3"
                    style={{ backgroundColor: `${slides[currentSlide].color}10` }}
                  >
                    <img
                      src={slides[currentSlide].illustration}
                      alt={slides[currentSlide].title}
                      style={{ 
                        width: '160px',
                        height: '160px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Texte */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center mb-5"
                >
                  <h1 className="h3 mb-3">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-secondary px-4">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec pagination et bouton */}
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
                      width: index === currentSlide ? '16px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: index === currentSlide ? slides[currentSlide].color : '#dee2e6',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Bouton d'action */}
            <motion.button
              onClick={nextSlide}
              className="btn w-100 text-white"
              style={{ 
                backgroundColor: slides[currentSlide].color,
                height: '48px',
                boxShadow: `0 4px 12px -4px ${slides[currentSlide].color}80`
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;

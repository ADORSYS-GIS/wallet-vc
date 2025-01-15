import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import styles from './styles';

interface Slide {
  image: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: '/assets/logo.png',
    title: 'Your Digital Identity Hub',
    description:
      'Welcome to a secure and seamless way to manage your verifiable credentials.',
  },
  {
    image: '/assets/wallet-mult.png',
    title: 'Store & Manage Credentials',
    description:
      'Safely store and organize your verifiable credentials in one secure location.',
  },
  {
    image: '/assets/did-msg.png',
    title: 'Connect & Communicate',
    description:
      'Exchange messages and credentials securely using DIDComm protocol.',
  },
  {
    image: '/assets/security.png',
    title: 'Privacy First',
    description:
      'Control what you share and with whom. Your credentials, your rules.',
  },
  {
    image: '/assets/ok.png',
    title: 'Always Available',
    description:
      'Access your digital identity anytime, anywhere, across all your devices.',
  },
];

const OnboardingSlides: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
    navigate('/setup-pin');
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  // Swipeable hook for swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPreviousSlide(),
    trackMouse: true, // This allows mouse swipes for testing on desktop
  });

  return (
    <div style={styles.container} {...handlers}>
      <div style={styles.slideContent}>
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          style={styles.image}
        />
        <h2 style={styles.h2}>{slides[currentSlide].title}</h2>
        <p style={styles.p}>{slides[currentSlide].description}</p>
      </div>

      {/* Bottom Content */}
      <div style={styles.bottomContainer}>
        <div style={styles.buttonContainer}>
          {currentSlide > 0 && (
            <button onClick={goToPreviousSlide} style={styles.backButton}>
              Back
            </button>
          )}
          <button
            onClick={goToNextSlide}
            style={{
              ...styles.nextButton,
              backgroundColor:
                currentSlide === slides.length - 1 ? '#007BFF' : '#007BFF',
            }}
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Dot Navigation */}
        <div style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <span
              key={index}
              style={{
                ...styles.dot,
                backgroundColor: currentSlide === index ? '#007BFF' : '#ccc',
              }}
              onClick={() => handleDotClick(index)} // Handling dot click
            />
          ))}
        </div>
      </div>
    </div>
  );
};

OnboardingSlides.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default OnboardingSlides;

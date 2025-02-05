import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

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

  // Swipeable hook for swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPreviousSlide(),
    trackMouse: true, // This allows mouse swipes for testing on desktop
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '10px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
      {...handlers}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: 'Roboto, sans-serif',
          fontSize: '18px',
          fontWeight: '500',
          lineHeight: '1.5',
          marginBottom: '8px',
          marginTop: '4px',
        }}
      >
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          style={{
            width: '100%',
            borderRadius: '10px',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
        <Typography variant="h6" sx={{ marginBottom: '10px' }}>
          {slides[currentSlide].title}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: '4px' }}>
          {slides[currentSlide].description}
        </Typography>
      </Box>

      {/* Bottom Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '35px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {currentSlide > 0 && (
            <Button
              onClick={goToPreviousSlide}
              variant="contained"
              sx={{
                padding: '10px 20px',
                backgroundColor: '#ccc',
                borderRadius: '5px',
                textTransform: 'none',
              }}
            >
              Back
            </Button>
          )}
          <Button
            onClick={goToNextSlide}
            variant="contained"
            sx={{
              padding: '10px 20px',
              backgroundColor:
                currentSlide === slides.length - 1 ? '#007BFF' : '#007BFF',
              borderRadius: '5px',
              textTransform: 'none',
            }}
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

OnboardingSlides.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default OnboardingSlides;

import { Avatar, Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
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
    image: '/assets/digital-wallet.png',
    title: 'Store & Manage Credentials',
    description:
      'Safely store and organize your verifiable credentials in one secure location.',
  },
  {
    image: '/assets/connect.png',
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

  const handlers = useSwipeable({
    onSwipedLeft: goToNextSlide,
    onSwipedRight: goToPreviousSlide,
    trackMouse: true,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100dvh',
        backgroundColor: '#F4F7FC',
        textAlign: 'center',
        paddingTop: { xs: '150px', sm: '180px', md: '200px' },
        boxSizing: 'border-box',
        overflow: 'hidden',
        gap: '20px',
      }}
      {...handlers}
    >
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar
          alt={slides[currentSlide].title}
          src={slides[currentSlide].image}
          sx={{ width: 250, height: 250 }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', marginBottom: '15px' }}
        >
          {slides[currentSlide].title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#555', maxWidth: '80%', lineHeight: 1.5 }}
        >
          {slides[currentSlide].description}
        </Typography>
      </motion.div>

      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          display: 'flex',
          justifyContent: 'space-between',
          width: '90%',
          maxWidth: '450px',
        }}
      >
        {currentSlide > 0 && (
          <Button
            onClick={goToPreviousSlide}
            variant="contained"
            sx={{ backgroundColor: '#ccc' }}
          >
            Back
          </Button>
        )}
        <Button
          onClick={goToNextSlide}
          variant="contained"
          sx={{ backgroundColor: '#007BFF', marginLeft: 'auto' }}
        >
          {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

OnboardingSlides.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default OnboardingSlides;

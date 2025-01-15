import { CSSProperties } from 'react';

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: '10px',
    textAlign: 'center',
    overflow: 'hidden',
  },
  slideContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '20px',
    fontWeight: '500',
    lineHeight: '1.5',
    marginBottom: '8px',
    marginTop: '4px',
  },
  h2: {
    marginBottom: '8px',
  },
  p: {
    marginTop: '4px',
  },
  image: {
    width: '100%',
    borderRadius: '10px',
    transition: 'transform 0.3s ease-in-out',
    marginBottom: '10px',
  },
  bottomContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '35px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  nextButton: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'background-color 0.3s',
  },
};

export default styles;

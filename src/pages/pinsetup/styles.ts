import { CSSProperties } from 'react';

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    fontFamily: 'Roboto, sans-serif',
  },
  input: {
    width: '200px',
    height: '40px',
    fontSize: '18px',
    textAlign: 'center',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    outline: 'none',
    padding: '0 10px',
  },
  logo: {
    marginBottom: '10px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '20px',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default styles;

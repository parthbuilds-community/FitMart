import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        margin: '20px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>
          🏋️‍♂️ FITMART
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
          Your Fitness Journey Starts Here
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/auth">
            <button style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Get Started 💪
            </button>
          </Link>
          <Link to="/home">
            <button style={{
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              padding: '12px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Explore →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
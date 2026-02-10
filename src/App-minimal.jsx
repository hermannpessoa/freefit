import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (user) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', color: '#333', margin: '0 0 20px 0' }}>✅ Bem-vindo!</h1>
          <p style={{ fontSize: '18px', color: '#666', margin: '0 0 30px 0' }}>{user.email}</p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '12px 30px', 
              fontSize: '16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '48px', color: '#333', margin: '0 0 20px 0' }}>🎉 MyFit AI</h1>
        <p style={{ fontSize: '18px', color: '#666', margin: '0 0 30px 0' }}>Login</p>
        
        {error && (
          <p style={{ color: '#ef4444', marginBottom: '15px', fontSize: '14px' }}>
            ❌ {error}
          </p>
        )}
        
        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                padding: '12px', 
                width: '100%',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }} 
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                padding: '12px', 
                width: '100%',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }} 
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '12px 30px', 
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ color: '#666', fontSize: '14px' }}>
          Não tem conta? 
          <button 
            onClick={handleSignup}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginLeft: '5px',
              textDecoration: 'underline'
            }}>
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}

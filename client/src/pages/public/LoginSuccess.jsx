import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../../features/auth/authSlice';

export default function LoginSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    localStorage.setItem('token', token);
    
    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      dispatch(setCredentials({ user: response.data, token }));
      toast.success('Login successful!', { toastId: 'google-login' });
      setTimeout(() => navigate('/'), 200);
    })
    .catch(error => {
      console.error('Failed to fetch user:', error);
      toast.error('Login failed. Please try again.');
      localStorage.removeItem('token');
      navigate('/login');
    });
  }, [dispatch, navigate, hasRun]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "1rem",
      backgroundColor: "#f9fafb"
    }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span className="text-lg text-gray-700">Logging you in via Google...</span>
    </div>
  );
}

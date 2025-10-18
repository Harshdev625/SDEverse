import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initGoogle, renderGoogleButton } from '../utils/googleAuth';
import { loginWithGoogle } from '../features/auth/authSlice';

export default function GoogleSignInButton({ containerId = 'google-btn-container' }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);

  useEffect(() => {
    const ok = initGoogle((credential) => {
      dispatch(loginWithGoogle(credential));
    });
    if (ok) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => renderGoogleButton(containerId), 100);
    }
  }, [dispatch, containerId]);

  const isAvailable = window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="w-full">
      {isAvailable ? (
        <div 
          id={containerId} 
          className="flex justify-center"
          style={{ display: loading ? 'none' : 'flex' }} 
        />
      ) : (
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in client/.env"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google (unavailable)
        </button>
      )}
    </div>
  );
}

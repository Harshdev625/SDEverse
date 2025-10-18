import api from './api';

export function initGoogle(onCredential) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!window.google) {
    console.warn('[GoogleAuth] Google SDK not loaded. Ensure script is present in index.html.');
    return false;
  }
  if (!clientId) {
    console.warn('[GoogleAuth] Missing VITE_GOOGLE_CLIENT_ID in client/.env');
    return false;
  }
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential?.(response.credential),
  });
  return true;
}

export function renderGoogleButton(containerId) {
  if (!window.google) return;
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create a wrapper div to center the Google button
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.className = 'google-signin-wrapper';
  
  window.google.accounts.id.renderButton(wrapper, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    text: 'continue_with',
    shape: 'rectangular',
    width: 320,
    logo_alignment: 'left',
  });
  
  container.appendChild(wrapper);
  
  // Add custom styling to match your app's design
  const style = document.createElement('style');
  style.textContent = `
    .google-signin-wrapper iframe {
      border-radius: 8px !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
      transition: all 0.3s ease !important;
    }
    .google-signin-wrapper iframe:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      transform: translateY(-1px) !important;
    }
    .google-signin-wrapper div[role="button"] {
      font-weight: 500 !important;
      border-radius: 8px !important;
    }
  `;
  
  // Only add the style once
  if (!document.querySelector('#google-signin-styles')) {
    style.id = 'google-signin-styles';
    document.head.appendChild(style);
  }
}

export async function exchangeGoogleCredential(credential) {
  const { data } = await api.post('/auth/google', { credential });
  return data;
}

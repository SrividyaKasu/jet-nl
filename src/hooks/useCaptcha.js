import { useEffect, useCallback } from 'react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const useCaptcha = (onVerify) => {
  useEffect(() => {
    // Load the reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      // Clean up any existing reCAPTCHA elements
      const elements = document.getElementsByClassName('g-recaptcha');
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    };
  }, []);

  const renderCaptcha = useCallback((container) => {
    if (!container) return;

    // Wait for grecaptcha to be ready
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.render(container, {
          sitekey: SITE_KEY,
          callback: onVerify,
        });
      });
    }
  }, [onVerify]);

  return { renderCaptcha };
}; 
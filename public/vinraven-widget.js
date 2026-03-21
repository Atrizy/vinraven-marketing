/**
 * VinRaven Chat Widget - Optimized
 * Embeddable chat widget for client websites
 */
(function() {
  'use strict';

  // Turn this on later in prod if you want persistence
  const PERSIST_HISTORY = false;

  // Configuration
  const currentScript = document.currentScript || document.querySelector('script[src*="vinraven-widget"]');
  const apiUrl = currentScript?.getAttribute('data-api-url')?.trim();
  const apiKey = currentScript?.getAttribute('data-api-key')?.trim();

  if (!apiUrl) {
    console.error(
      '[VinRaven] Widget not initialized: data-api-url is required. ' +
      'Add it to the script tag: <script src="..." data-api-url="https://your-api.example.com">'
    );
    return;
  }
  if (!apiKey) {
    console.error(
      '[VinRaven] Widget not initialized: data-api-key is required. ' +
      'Add it to the script tag: <script src="..." data-api-key="...">'
    );
    return;
  }

  const scriptSrc = currentScript?.src || '';
  const logoUrl = currentScript?.getAttribute('data-logo-url')?.trim() ||
    (scriptSrc ? new URL(scriptSrc).origin + '/vinraven.png' : '');

  const CONFIG = {
    clientId: currentScript?.getAttribute('data-client-id') || 'demo-client',
    apiUrl,
    apiKey,
    primaryColor: currentScript?.getAttribute('data-color') || null,
    maxFailures: 2,
    storageKey: 'vinraven_conversation',
    hideBranding: currentScript?.getAttribute('data-hide-branding') === 'true',
    debug: currentScript?.getAttribute('data-debug') === 'true',
    logoUrl,
  };

  function getHeaders() {
    return { 'Content-Type': 'application/json', 'x-api-key': CONFIG.apiKey };
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  const FALLBACK_SUGGESTIONS = [
    'What are your business hours?',
    'What services do you offer?',
    'Where are you located?',
    'Contact support',
  ];

  async function fetchSuggestions() {
    try {
      const url = `${CONFIG.apiUrl.replace(/\/+$/, '')}/kb/suggestions/${encodeURIComponent(CONFIG.clientId)}`;
      const res = await fetchWithTimeout(
        url,
        { method: 'GET', headers: getHeaders() },
        15000,
      );
      if (!res.ok) return [];
      const data = await res.json().catch(() => null);
      if (!data || !Array.isArray(data.suggestions)) return [];
      const list = data.suggestions
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean)
        .slice(0, 5);
      const hasContact = list.some((s) => s.toLowerCase() === 'contact support');
      return list.length > 0 ? (hasContact ? list : [...list, 'Contact support']) : [];
    } catch (e) {
      console.error('[VinRaven] suggestions error', e);
      return [];
    }
  }

  // State management
  const state = {
    isOpen: false,
    conversationId: null,
    messageHistory: [],
    isSending: false,
    failureCount: 0,
    elements: {},
    suggestions: null,
    nudgeTimer: null,
  };

  // SVG Icons (optimized)
  const ICONS = {
    raven: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C10.9 2 10 2.9 10 4C10 4.4 10.1 4.7 10.3 5L8 7.3C7.7 7.1 7.4 7 7 7C5.9 7 5 7.9 5 9C5 9.4 5.1 9.7 5.3 10L3 12.3C2.7 12.1 2.4 12 2 12C0.9 12 0 12.9 0 14S0.9 16 2 16C3.1 16 4 15.1 4 14C4 13.6 3.9 13.3 3.7 13L6 10.7C6.3 10.9 6.6 11 7 11C8.1 11 9 10.1 9 9C9 8.6 8.9 8.3 8.7 8L11 5.7C11.3 5.9 11.6 6 12 6C13.1 6 14 5.1 14 4S13.1 2 12 2M12 8L7 13V21L12 18L17 21V13L12 8Z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  };

  // Utility functions
  const utils = {
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    formatMarkdown(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\n/g, '<br>');
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    getInitials() {
      return 'U';
    },

    saveConversation() {
      try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
          id: state.conversationId,
          history: state.messageHistory,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to save conversation:', e);
      }
    },

    loadConversation() {
      try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (!saved) return null;

        const data = JSON.parse(saved);
        const hoursSince = (Date.now() - data.timestamp) / (1000 * 60 * 60);

        return hoursSince < 24 ? data : null;
      } catch (e) {
        return null;
      }
    }
  };

  // DOM creation optimized
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'vinraven-widget-container';
    container.className = 'vr-widget-root';
    container.innerHTML = `
      <style>
        .vr-widget-root {
          --vr-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --vr-accent: #e8661b;
          --vr-visual-height: 70vh;
          --vr-widget-bottom: 100px;
          --vr-bg: rgba(8, 11, 22, 0.96);
          --vr-bg-elevated: rgba(15, 23, 42, 0.92);
          --vr-border-subtle: rgba(148,163,184,0.32);
          --vr-text-main: #f9fafb;
          --vr-text-muted: #9ca3af;
          --vr-radius-lg: 20px;
          --vr-radius-md: 14px;
          --vr-shadow-soft: 0 4px 12px rgba(0,0,0,0.35);
          --vr-shadow-strong: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px var(--vr-border-subtle);
        }
        .vr-widget-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .vr-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 10%, #ffe7d5 0, var(--vr-accent) 30%, #6b21ff 100%);
          box-shadow: 0 12px 30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: transform 160ms ease-out, box-shadow 160ms ease-out;
          z-index: 999999;
        }
        .vr-launcher:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 18px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.16);
        }
        .vr-launcher-icon {
          width: 26px;
          height: 26px;
          border-radius: 10px;
          background: rgba(15,23,42,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9fafb;
        }
        .vr-launcher-icon svg { width: 14px; height: 14px; }
        .vr-widget {
          position: fixed;
          bottom: var(--vr-widget-bottom, 100px);
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 560px;
          max-height: min(560px, calc(var(--vr-visual-height, 70vh) - 100px));
          display: flex;
          flex-direction: column;
          border-radius: var(--vr-radius-lg);
          background: linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.92));
          box-shadow: var(--vr-shadow-strong);
          border: 1px solid var(--vr-border-subtle);
          overflow: hidden;
          backdrop-filter: blur(20px);
          transform-origin: bottom right;
          opacity: 0;
          transform: translateY(8px) scale(0.96);
          pointer-events: none;
          transition: opacity 150ms ease-out, transform 150ms ease-out;
          font-family: var(--vr-font);
          z-index: 999998;
        }
        .vr-widget.vr-widget--open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .vr-header {
          padding: 14px 16px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--vr-border-subtle);
          background: radial-gradient(circle at 0 0, color-mix(in srgb, var(--vr-accent) 20%, transparent), transparent 55%);
        }
        .vr-header .vr-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: radial-gradient(circle at 30% 10%, #ffe7d5 0, var(--vr-accent) 45%, #4c1d95 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .vr-header .vr-avatar img { width: 100%; height: 100%; object-fit: contain; }
        .vr-header .vr-avatar .vr-avatar-fallback { width: 100%; height: 100%; display: none; }
        .vr-header .vr-avatar .vr-avatar-fallback svg { width: 18px; height: 18px; }
        .vr-header-text { flex: 1; }
        .vr-title { font-size: 14px; font-weight: 600; color: var(--vr-text-main); }
        .vr-subtitle { font-size: 11px; color: var(--vr-text-muted); }
        .vr-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(22,163,74,0.12);
          border: 1px solid rgba(22,163,74,0.5);
          font-size: 10px;
          color: #bbf7d0;
        }
        .vr-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.9);
        }
        .vr-widget-root .vr-header-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: var(--vr-text-muted);
        }
        .vr-widget-root .vr-header-close:hover { color: var(--vr-text-main); }
        .vr-widget-root .vr-header-close svg { width: 20px; height: 20px; }
        .vr-messages {
          padding: 14px 12px 10px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: radial-gradient(circle at 10% 0, rgba(15,118,110,0.25), transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(232,102,27,0.24), transparent 55%),
            radial-gradient(circle at 0 100%, rgba(59,130,246,0.18), transparent 55%);
        }
        .vr-messages::-webkit-scrollbar {
          width: 8px;
        }
        .vr-messages::-webkit-scrollbar-track {
          background: rgba(15,23,42,0.6);
        }
        .vr-messages::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.35);
          border-radius: 4px;
        }
        .vr-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(148,163,184,0.5);
        }
        .vr-messages { scrollbar-color: rgba(148,163,184,0.35) rgba(15,23,42,0.6); }
        .vr-message-row { display: flex; gap: 6px; }
        .vr-message-row--bot { justify-content: flex-start; }
        .vr-message-row--user { justify-content: flex-end; }
        .vr-message {
          max-width: 76%;
          padding: 8px 11px;
          font-size: 13px;
          line-height: 1.4;
        }
        .vr-message--bot {
          background: rgba(15,23,42,0.92);
          border-radius: 16px 16px 16px 6px;
          color: var(--vr-text-main);
          box-shadow: var(--vr-shadow-soft);
          border: 1px solid rgba(148,163,184,0.3);
        }
        .vr-message--user {
          background: linear-gradient(135deg, var(--vr-accent), #fb923c);
          border-radius: 16px 16px 6px 16px;
          color: #111827;
          box-shadow: 0 10px 24px rgba(0,0,0,0.55);
        }
        .vr-message-meta {
          margin-top: 2px;
          font-size: 10px;
          color: var(--vr-text-muted);
        }
        .vr-message-enter {
          opacity: 0;
          transform: translateY(4px);
          animation: vr-message-in 160ms ease-out forwards;
        }
        @keyframes vr-message-in {
          to { opacity: 1; transform: translateY(0); }
        }
        .vr-quick-questions { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .vr-quick-btn {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(148,163,184,0.4);
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          color: var(--vr-text-main);
          transition: all 0.2s;
        }
        .vr-quick-btn:hover {
          border-color: color-mix(in srgb, var(--vr-accent) 70%, transparent);
          background: color-mix(in srgb, var(--vr-accent) 15%, transparent);
        }
        .vr-typing {
          display: flex;
          gap: 4px;
          padding: 8px 11px;
        }
        .vr-typing span {
          width: 8px;
          height: 8px;
          background: rgba(148,163,184,0.8);
          border-radius: 50%;
          animation: vr-typing-bounce 1.4s infinite;
        }
        .vr-typing span:nth-child(2) { animation-delay: 0.2s; }
        .vr-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes vr-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .vr-composer {
          padding: 8px 10px 10px;
          border-top: 1px solid var(--vr-border-subtle);
          background: linear-gradient(to top, var(--vr-bg), var(--vr-bg-elevated));
        }
        .vr-composer-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 6px 6px 12px;
          border-radius: var(--vr-radius-md);
          background: var(--vr-bg-elevated);
          border: 1px solid var(--vr-border-subtle);
        }
        .vr-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: var(--vr-text-main);
          font-size: 13px;
          font-family: var(--vr-font);
        }
        .vr-input::placeholder { color: var(--vr-text-muted); }
        .vr-input--disabled, .vr-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .vr-send-btn {
          width: 30px;
          height: 30px;
          min-width: 30px;
          border-radius: 999px;
          border: none;
          outline: none;
          cursor: pointer;
          background: radial-gradient(circle at 20% 0, #ffe7d5 0, var(--vr-accent) 40%, #6b21ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9fafb;
          box-shadow: 0 8px 18px rgba(0,0,0,0.7);
          transition: transform 140ms ease-out, box-shadow 140ms ease-out;
        }
        .vr-send-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 12px 26px rgba(0,0,0,0.8);
        }
        .vr-send-btn:disabled,
        .vr-send-btn--disabled { opacity: 0.5; cursor: not-allowed; }
        .vr-send-btn svg { width: 14px; height: 14px; }
        .vr-ticket-form,
        #vinraven-ticket-form {
          padding: 16px;
          border-top: 1px solid var(--vr-border-subtle);
          background: linear-gradient(to top, var(--vr-bg), var(--vr-bg-elevated));
        }
        #vinraven-ticket-form.hidden { display: none; }
        #vinraven-ticket-form h4 { font-size: 14px; margin-bottom: 12px; color: var(--vr-text-main); }
        #vinraven-ticket-form input,
        #vinraven-ticket-form textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--vr-border-subtle);
          border-radius: var(--vr-radius-md);
          font-size: 13px;
          margin-bottom: 8px;
          font-family: var(--vr-font);
          background: var(--vr-bg-elevated);
          color: var(--vr-text-main);
        }
        #vinraven-ticket-form textarea { resize: vertical; min-height: 60px; }
        .vr-ticket-error { font-size: 12px; color: #f87171; margin-bottom: 8px; min-height: 1.2em; }
        #vinraven-ticket-form .vr-ticket-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        #vinraven-ticket-form .vr-ticket-submit {
          width: 100%;
          padding: 10px;
          background: radial-gradient(circle at 30% 10%, #ffe7d5 0, var(--vr-accent) 40%, #6b21ff 100%);
          color: #111827;
          border: none;
          border-radius: var(--vr-radius-md);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        .vr-ticket-close {
          background: none;
          border: none;
          cursor: pointer;
          float: right;
          color: var(--vr-text-muted);
          font-size: 20px;
          line-height: 1;
        }
        .vr-ticket-close:hover { color: var(--vr-text-main); }
        .vr-support-button {
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--vr-text-main);
          background: rgba(148,163,184,0.2);
          border: 1px solid rgba(148,163,184,0.4);
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vr-support-button:hover {
          background: color-mix(in srgb, var(--vr-accent) 20%, transparent);
          border-color: color-mix(in srgb, var(--vr-accent) 60%, transparent);
        }
        @keyframes vr-support-nudge {
          0%   { transform: scale(1);    background: rgba(148,163,184,0.2); border-color: rgba(148,163,184,0.4); color: var(--vr-text-main); }
          30%  { transform: scale(1.12); background: rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.8);  color: #c4b5fd; }
          70%  { transform: scale(1.12); background: rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.8);  color: #c4b5fd; }
          100% { transform: scale(1);    background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.6);  color: #c4b5fd; }
        }
        .vr-support-button--nudge {
          animation: vr-support-nudge 600ms ease-in-out forwards;
        }
        .vr-powered-by {
          font-size: 10px;
          color: var(--vr-text-muted);
          padding: 6px 10px;
          margin-top: auto;
        }
        .vr-powered-by a { color: var(--vr-text-muted); text-decoration: none; }
        .vr-powered-by a:hover { color: var(--vr-text-main); text-decoration: underline; }
        .vr-followups-row {
          margin-top: 4px;
          margin-bottom: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .vr-followup-chip {
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.6);
          background: rgba(15,23,42,0.85);
          padding: 4px 10px;
          font-size: 11px;
          color: var(--vr-text-main);
          cursor: pointer;
          transition: background 140ms ease-out, border-color 140ms ease-out;
        }
        .vr-followup-chip:hover {
          background: rgba(30,64,175,0.9);
          border-color: rgba(191,219,254,0.9);
        }
        .vr-nudge {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 999999;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          font-family: var(--vr-font);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(139,92,246,0.45);
          pointer-events: none;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 300ms ease-out, transform 300ms ease-out;
          white-space: nowrap;
        }
        .vr-nudge::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: #6d28d9;
          transform: rotate(45deg);
          border-radius: 2px;
        }
        .vr-nudge--visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          animation: vr-nudge-bounce 2s ease-in-out infinite;
        }
        @keyframes vr-nudge-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      </style>

      <button id="vinraven-fab" class="vr-launcher" aria-label="Open chat">
        <span class="vr-launcher-icon">${ICONS.chat}</span>
      </button>
      <div id="vr-nudge" class="vr-nudge">Try me here!</div>

      <div id="vinraven-chat" class="vr-widget">
        <div class="vr-header">
          <div class="vr-avatar">${CONFIG.logoUrl ? `<img src="${String(CONFIG.logoUrl).replace(/"/g, '&quot;')}" alt="VinRaven" onerror="this.style.display='none';var n=this.nextElementSibling;if(n)n.style.display='flex'" /><span class="vr-avatar-fallback" style="display:none;align-items:center;justify-content:center">${ICONS.raven}</span>` : ICONS.raven}</div>
          <div class="vr-header-text">
            <div class="vr-title">Chat with us</div>
            <div class="vr-subtitle">VinRaven</div>
            <span class="vr-status-pill"><span class="vr-status-dot"></span> Online</span>
          </div>
          <button id="vr-support-button" class="vr-support-button">Contact support</button>
          <button id="vinraven-close" class="vr-header-close" aria-label="Close chat">${ICONS.close}</button>
        </div>

        <div id="vinraven-messages" class="vr-messages"></div>

        <div id="vinraven-ticket-form" class="vr-ticket-form hidden">
          <button class="vr-ticket-close" aria-label="Close form">&times;</button>
          <h4>Leave us a message</h4>
          <div class="vr-ticket-error" aria-live="polite"></div>
          <input type="email" id="vr-ticket-email" placeholder="Your email" required>
          <textarea id="vr-ticket-message" placeholder="Your message" required></textarea>
          <button type="button" id="vr-ticket-submit" class="vr-ticket-submit">Send message</button>
        </div>

        <div class="vr-composer">
          <form id="vinraven-input-form" class="vr-composer-inner">
            <input type="text" id="vinraven-input" class="vr-input" placeholder="Type your message..." autocomplete="off">
            <button type="submit" id="vinraven-send" class="vr-send-btn" aria-label="Send message">${ICONS.send}</button>
          </form>
        </div>
        ${CONFIG.hideBranding ? '' : '<div class="vr-powered-by">Powered by <a href="https://vinraven.ca" target="_blank" rel="noopener">VinRaven</a></div>'}
      </div>
    `;

    if (CONFIG.primaryColor) {
      const override = document.createElement('style');
      override.textContent = `.vr-widget-root { --vr-accent: ${CONFIG.primaryColor}; }`;
      container.appendChild(override);
    }

    document.body.appendChild(container);
    cacheElements();
    attachEventListeners();
    setupVisualViewport();
  }

  // Cache DOM elements
  function cacheElements() {
    state.elements = {
      fab: document.getElementById('vinraven-fab'),
      chat: document.getElementById('vinraven-chat'),
      messages: document.getElementById('vinraven-messages'),
      input: document.getElementById('vinraven-input'),
      form: document.getElementById('vinraven-input-form'),
      send: document.getElementById('vinraven-send'),
      close: document.getElementById('vinraven-close'),
      ticketForm: document.getElementById('vinraven-ticket-form'),
      ticketError: document.querySelector('.vr-ticket-error'),
      ticketEmail: document.getElementById('vr-ticket-email'),
      ticketMessage: document.getElementById('vr-ticket-message'),
      ticketSupport: document.getElementById('vr-support-button'),
      ticketClose: document.querySelector('.vr-ticket-close'),
      ticketSubmit: document.getElementById('vr-ticket-submit'),
      nudge: document.getElementById('vr-nudge')
    };
  }

  function pulseContactSupport() {
    const btn = state.elements.ticketSupport;
    if (!btn) return;
    btn.classList.remove('vr-support-button--nudge');
    void btn.offsetWidth;
    btn.classList.add('vr-support-button--nudge');
  }

  function dismissNudge() {
    if (state.elements.nudge) {
      state.elements.nudge.classList.remove('vr-nudge--visible');
      state.elements.nudge.style.display = 'none';
    }
    if (state.nudgeTimer) {
      clearTimeout(state.nudgeTimer);
      state.nudgeTimer = null;
    }
  }

  function scheduleNudge() {
    state.nudgeTimer = setTimeout(() => {
      if (!state.isOpen && state.elements.nudge) {
        state.elements.nudge.classList.add('vr-nudge--visible');
      }
    }, 15000);
  }

  // Resize widget when mobile keyboard opens (Visual Viewport API)
  function setupVisualViewport() {
    const root = document.getElementById('vinraven-widget-container');
    if (!root) return;

    function updateViewport() {
      const vv = window.visualViewport;
      if (!vv) return;
      const height = vv.height;
      const keyboardOpen = height < window.innerHeight * 0.75;
      root.style.setProperty('--vr-visual-height', height + 'px');
      if (keyboardOpen) {
        const bottomPx = window.innerHeight - vv.offsetTop - vv.height + 16;
        root.style.setProperty('--vr-widget-bottom', Math.max(16, bottomPx) + 'px');
      } else {
        root.style.setProperty('--vr-widget-bottom', '100px');
      }
    }

    updateViewport();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);
  }

  // Event listeners
  function attachEventListeners() {
    const { fab, close, form, ticketSupport, ticketClose, ticketSubmit } = state.elements;

    fab.addEventListener('click', toggleChat);
    close.addEventListener('click', toggleChat);
    form.addEventListener('submit', handleSendMessage);
    if (ticketSupport) ticketSupport.addEventListener('click', showTicketForm);
    ticketClose.addEventListener('click', () => state.elements.ticketForm.classList.add('hidden'));
    ticketSubmit.addEventListener('click', handleTicketSubmit);

    scheduleNudge();
  }

  // Chat toggle
  function toggleChat() {
    state.isOpen = !state.isOpen;
    state.elements.chat.classList.toggle('vr-widget--open', state.isOpen);
    state.elements.fab.querySelector('.vr-launcher-icon').innerHTML = state.isOpen ? ICONS.close : ICONS.chat;

    dismissNudge();

    if (state.isOpen) {
      setTimeout(() => state.elements.input.focus(), 180);
    }

    if (state.isOpen && state.messageHistory.length === 0) {
      let saved = null;
      if (PERSIST_HISTORY) {
        saved = utils.loadConversation();
      }
      if (saved) {
        state.conversationId = saved.id;
        state.messageHistory = saved.history;
        renderMessages();
      } else {
        addMessage('bot', 'Hi! What can I help you with today?');
      }
    }

  }

  // Message handling
  async function handleSendMessage(e) {
    e.preventDefault();
    const message = state.elements.input.value.trim();
    if (!message || state.isSending) return;

    state.elements.input.value = '';
    await sendMessage(message);
  }

  async function sendMessage(message, isAutoGreeting = false) {
    if (state.isSending) return;

    state.isSending = true;
    state.elements.send.disabled = true;
    state.elements.input.disabled = true;
    state.elements.input.classList.add('vr-input--disabled');
    state.elements.send.classList.add('vr-send-btn--disabled');

    if (!isAutoGreeting) {
      addMessage('user', message);
    }

    showTypingIndicator();

    try {
      const response = await fetchWithTimeout(`${CONFIG.apiUrl}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          client_id: CONFIG.clientId,
          conversation_id: state.conversationId
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      removeTypingIndicator();

      state.conversationId = data.conversation_id;
      state.failureCount = 0;
      if (CONFIG.debug && data.plan != null) {
        console.log(`VinRaven widget: plan=${data.plan}`);
      }

      const followUps = Array.isArray(data.follow_ups)
        ? data.follow_ups.filter((s) => typeof s === 'string' && s.trim().length > 0)
        : [];

      if (!state.suggestions) {
        fetchSuggestions().then((s) => { state.suggestions = s; });
      }

      const chips = followUps.length > 0 ? followUps : (state.suggestions && state.suggestions.length > 0 ? state.suggestions : FALLBACK_SUGGESTIONS).slice(0, 4);

      addMessage('bot', data.response, null);

      const mentionsSupport = typeof data.response === 'string' &&
        data.response.toLowerCase().includes('contact support');

      if (data.needs_ticket || mentionsSupport) {
        pulseContactSupport();
      }

      if (data.needs_ticket) {
        showTicketForm();
      } else {
        renderFollowUps(chips);
      }

      if (PERSIST_HISTORY) utils.saveConversation();

    } catch (error) {
      console.error('[VinRaven] Chat error:', error.message || error);
      removeTypingIndicator();

      state.failureCount++;

      if (state.failureCount >= CONFIG.maxFailures) {
        addMessage('bot', "I'm having trouble connecting. Please leave your email and we'll get back to you.");
        showTicketForm();
      } else {
        addMessage('bot', "Sorry, I'm having trouble right now. Please try again.");
      }
    } finally {
      state.isSending = false;
      state.elements.send.disabled = false;
      state.elements.input.disabled = false;
      state.elements.input.classList.remove('vr-input--disabled');
      state.elements.send.classList.remove('vr-send-btn--disabled');
      state.elements.input.focus();
    }
  }

  // Message rendering (optimized with DocumentFragment)
  function addMessage(sender, text, quickQuestions = null) {
    state.messageHistory.push({ sender, text, quickQuestions });

    const messageEl = createMessageElement(sender, text, quickQuestions);
    state.elements.messages.appendChild(messageEl);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function createMessageElement(sender, text, quickQuestions) {
    const frag = document.createDocumentFragment();
    const isBot = sender === 'bot';
    const bubbleClass = isBot ? 'vr-message--bot' : 'vr-message--user';

    const row1 = document.createElement('div');
    row1.className = `vr-message-row vr-message-row--${sender} vr-message-enter`;
    let html = `<div class="vr-message ${bubbleClass}">${utils.formatMarkdown(utils.escapeHtml(text))}`;
    if (isBot) html += '<div class="vr-message-meta">VinRaven</div>';
    html += '</div>';
    row1.innerHTML = html;
    frag.appendChild(row1);

    if (quickQuestions && quickQuestions.length > 0) {
      const row2 = document.createElement('div');
      row2.className = 'vr-message-row vr-message-row--bot vr-message-enter';
      row2.innerHTML = `
        <div class="vr-message vr-message--bot">
          <div class="vr-quick-questions">
            ${quickQuestions.map(q => `<button class="vr-quick-btn" data-question="${utils.escapeHtml(q)}">${utils.escapeHtml(q)}</button>`).join('')}
          </div>
        </div>
      `;
      row2.querySelectorAll('.vr-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.dataset.question;
          if (q && q.trim().toLowerCase() === 'contact support') {
            showTicketForm();
          } else {
            sendMessage(q);
          }
          row2.remove();
        });
      });
      frag.appendChild(row2);
    }

    return frag;
  }

  function renderMessages() {
    const fragment = document.createDocumentFragment();
    state.messageHistory.forEach(({ sender, text, quickQuestions }) => {
      fragment.appendChild(createMessageElement(sender, text, quickQuestions));
    });
    state.elements.messages.innerHTML = '';
    state.elements.messages.appendChild(fragment);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  // Typing indicator
  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'vr-message-row vr-message-row--bot';
    typing.id = 'vr-typing-indicator';
    typing.innerHTML = `
      <div class="vr-message vr-message--bot">
        <div class="vr-typing"><span></span><span></span><span></span></div>
      </div>
    `;
    state.elements.messages.appendChild(typing);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function removeTypingIndicator() {
    document.getElementById('vr-typing-indicator')?.remove();
  }

  function renderFollowUps(followUps) {
    if (!followUps || followUps.length === 0) return;

    document.querySelectorAll('.vr-followups-row').forEach((el) => el.remove());

    const row = document.createElement('div');
    row.className = 'vr-followups-row';

    followUps.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vr-followup-chip';
      btn.textContent = label;

      btn.addEventListener('click', () => {
        const q = (label || '').trim().toLowerCase();
        if (q === 'contact support') {
          showTicketForm();
        } else {
          sendMessage(label);
        }
        row.remove();
      });

      row.appendChild(btn);
    });

    state.elements.messages.appendChild(row);
    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  // Ticket form
  function showTicketForm() {
    if (state.elements.ticketError) state.elements.ticketError.textContent = '';
    state.elements.ticketForm.classList.remove('hidden');
  }

  async function handleTicketSubmit() {
    const { ticketEmail, ticketMessage, ticketError, ticketSubmit } = state.elements;
    const email = ticketEmail.value.trim();
    const message = ticketMessage.value.trim();

    if (!email || !message) return;

    ticketError.textContent = '';
    ticketEmail.disabled = true;
    ticketMessage.disabled = true;
    ticketSubmit.disabled = true;
    ticketSubmit.textContent = 'Sending…';

    try {
      const response = await fetchWithTimeout(`${CONFIG.apiUrl}/ticket`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email,
          message,
          client_id: CONFIG.clientId,
          conversation_id: state.conversationId
        })
      });

      if (!response.ok) throw new Error('Request failed');

      state.elements.ticketForm.classList.add('hidden');
      addMessage('bot', 'Thanks! We received your message and will get back to you soon.');
    } catch (error) {
      ticketError.textContent = 'Failed to send. Please check your internet connection and try again.';
    } finally {
      ticketEmail.disabled = false;
      ticketMessage.disabled = false;
      ticketSubmit.disabled = false;
      ticketSubmit.textContent = 'Send message';
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();

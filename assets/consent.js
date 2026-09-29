/*
 * Consent & tracking loader — DC Academy
 * ---------------------------------------------------------------------------
 * Carica, in quest'ordine:
 *   1. Google Consent Mode v2 con default "denied" (deve girare prima di GTM)
 *   2. Iubenda Cookie Solution + blocco preventivo (autoblocking)
 *   3. Google Tag Manager
 *
 * Uso: <script src="/assets/consent.js"></script> il più in alto possibile
 * dentro <head>, prima di qualsiasi altro script di terze parti.
 *
 * Finché i tre ID qui sotto sono vuoti lo script non fa nulla: nessun cookie,
 * nessuna richiesta di rete. Compilarli attiva banner e tracciamento.
 * Vedi docs/GTM-IUBENDA-SETUP.md per dove recuperarli.
 */
(function () {
  'use strict';

  var CONFIG = {
    // Iubenda → Cookie Solution → "Incorpora e configura"
    iubendaSiteId: '',          // es. '3812345'
    iubendaCookiePolicyId: '',  // es. '12345678'
    // Google Tag Manager → container ID
    gtmId: ''                   // es. 'GTM-XXXXXXX'
  };

  var hasIubenda = CONFIG.iubendaSiteId && CONFIG.iubendaCookiePolicyId;
  if (!hasIubenda && !CONFIG.gtmId) {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.info('[consent] ID non ancora configurati in assets/consent.js — tracciamento disattivato.');
    }
    return;
  }

  /* ---------------------------------------------------------------------
   * 1. Consent Mode v2 — tutto negato finché l'utente non sceglie.
   * ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  /* ---------------------------------------------------------------------
   * 2. Iubenda Cookie Solution.
   * Il blocco preventivo (autoblocking.js) va caricato per primo: intercetta
   * gli script di terze parti finché manca il consenso.
   * ------------------------------------------------------------------ */
  function loadScript(src, opts) {
    var s = document.createElement('script');
    s.src = src;
    if (opts && opts.async) s.async = true;
    if (opts && opts.charset) s.charset = opts.charset;
    (document.head || document.documentElement).appendChild(s);
    return s;
  }

  if (hasIubenda) {
    window._iub = window._iub || [];
    window._iub.csConfiguration = {
      siteId: Number(CONFIG.iubendaSiteId),
      cookiePolicyId: Number(CONFIG.iubendaCookiePolicyId),
      lang: 'it',
      countryDetection: true,          // banner mostrato dove serve (GDPR/CCPA)
      perPurposeConsent: true,         // consenso per singola finalità
      askConsentAtCookiePolicyUpdate: true,
      enableRemoteConsent: true,
      floatingPreferencesButtonDisplay: 'bottom-right',
      googleConsentMode: 'template',   // Iubenda aggiorna il Consent Mode via GTM
      banner: {
        position: 'float-bottom-center',
        acceptButtonDisplay: true,
        customizeButtonDisplay: true,
        rejectButtonDisplay: true,     // obbligatorio: rifiuto facile quanto l'accettazione
        closeButtonDisplay: false,     // la X che equivale al consenso non è ammessa
        listPurposes: true,
        explicitWithdrawal: true,
        backgroundOverlay: false,
        // Palette allineata alla dashboard (vedi :root in index.html)
        backgroundColor: '#131419',
        textColor: '#e9ebf1',
        acceptButtonColor: '#5b8cff',
        acceptButtonCaptionColor: '#0c0d10',
        customizeButtonColor: '#22242c',
        customizeButtonCaptionColor: '#e9ebf1',
        rejectButtonColor: '#22242c',
        rejectButtonCaptionColor: '#e9ebf1',
        fontSizeBody: '13px'
        // logo: 'https://.../logo.png'  ← disponibile dal piano Iubenda a pagamento
      }
    };

    loadScript('https://cs.iubenda.com/autoblocking/' + CONFIG.iubendaSiteId + '.js', { charset: 'UTF-8' });
    loadScript('https://cdn.iubenda.com/cs/gpp/stub.js', { charset: 'UTF-8' });
    loadScript('https://cdn.iubenda.com/cs/iubenda_cs.js', { charset: 'UTF-8', async: true });
  }

  /* ---------------------------------------------------------------------
   * 3. Google Tag Manager.
   * ------------------------------------------------------------------ */
  if (CONFIG.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtmId), { async: true });
  }
})();

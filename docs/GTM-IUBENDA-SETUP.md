# Setup Google Tag Manager + Iubenda

Procedura per attivare banner cookie e tracciamento sui siti DC Academy.
Il codice è già in repo: `assets/consent.js`, incluso in tutte le pagine HTML.
Restano da fare i passaggi sulle piattaforme e da compilare tre ID.

---

## 1. Account Iubenda

Piano scelto: **19,99 €/mese** (raccomandato da DOC Marketing — limiti più alti,
banner personalizzabile con colori e logo del brand).
Listino: https://www.iubenda.com/it/prezzi/

1. Crea l'account su https://www.iubenda.com con l'indirizzo aziendale
   (non un indirizzo personale: l'account resta di proprietà DC Academy).
2. Attiva il piano da 19,99 €/mese e inserisci i dati di fatturazione.
3. Crea il sito → dominio da proteggere.
4. Attiva i tre prodotti:
   - **Privacy Policy** (con sezione cookie)
   - **Cookie Solution** (il banner)
   - **Consent Solution** (registro dei consensi — richiesto per dimostrare il consenso)

### Collaboratore

In *Impostazioni account → Collaboratori* aggiungi:

- `nicolo.dalzotto@docmarketing.it`

Così Nicolò lavora con il proprio accesso: nessuna password da condividere e
l'accesso è revocabile in qualsiasi momento senza toccare l'account principale.

---

## 2. Google Tag Manager

1. https://tagmanager.google.com → crea contenitore di tipo **Web** per il dominio.
2. Annota il **container ID** (`GTM-XXXXXXX`).
3. In *Amministrazione → Gestione utenti* concedi accesso a:
   - `nicolo.dalzotto@docmarketing.it`
   - `nicolo.conti@docmarketing.it`
   - `marketing@docmarketing.it`

   Livello consigliato: **Publish** sul contenitore, **non** amministratore
   dell'account (l'admin resta interno).
4. Nella galleria template di GTM installa **Iubenda CMP** (template ufficiale)
   e configuralo come tag di tipo *Consent Initialization – All Pages*.

---

## 3. Compilare gli ID nel codice

Apri `assets/consent.js` e riempi il blocco `CONFIG` in cima:

```js
var CONFIG = {
  iubendaSiteId: '3812345',        // Iubenda → Cookie Solution → Incorpora e configura
  iubendaCookiePolicyId: '12345678',
  gtmId: 'GTM-XXXXXXX'             // Google Tag Manager → container ID
};
```

Finché i campi restano vuoti lo script **non fa nulla**: nessun cookie, nessuna
richiesta di rete, nessun banner. È voluto — il sito resta pubblicabile in
sicurezza anche prima che l'account sia pronto.

---

## 4. Cosa fa già il codice

`assets/consent.js` viene caricato in cima a `<head>` di ogni pagina ed esegue,
in quest'ordine:

1. **Google Consent Mode v2** con default `denied` su tutte le categorie
   (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`,
   `functionality_storage`, `personalization_storage`), più
   `ads_data_redaction` e `url_passthrough`. Deve girare *prima* di GTM,
   altrimenti i tag partono senza vincolo di consenso.
2. **Iubenda** con blocco preventivo (`autoblocking.js`): gli script di terze
   parti restano bloccati finché l'utente non sceglie. Configurazione:
   - `perPurposeConsent: true` → consenso per singola finalità
   - `rejectButtonDisplay: true` → rifiuto immediato, stesso peso dell'accetta
   - `closeButtonDisplay: false` → niente "X" che vale come consenso (non ammessa)
   - `googleConsentMode: 'template'` → è Iubenda ad aggiornare il Consent Mode via GTM
   - `explicitWithdrawal` + pulsante preferenze flottante → consenso revocabile
   - colori del banner allineati alla palette della dashboard
3. **Google Tag Manager**, che parte solo dopo che i default di consenso sono impostati.

Il logo nel banner si abilita dal piano a pagamento: scommentare la riga `logo:`
nel blocco `banner` e inserire l'URL del logo.

---

## 5. Verifica dopo l'attivazione

- [ ] In navigazione anonima il banner compare al primo accesso.
- [ ] Prima della scelta, in DevTools → Application → Cookies non ci sono cookie
      di analytics/marketing (solo tecnici).
- [ ] "Rifiuta" chiude il banner e non attiva nessun tag.
- [ ] "Accetta" attiva i tag; in GTM Preview il Consent Mode passa a `granted`.
- [ ] Il pulsante preferenze in basso a destra riapre il banner e permette di
      revocare il consenso.
- [ ] Link a privacy policy e cookie policy raggiungibili dal footer.
- [ ] Il consenso resta registrato nella Consent Solution di Iubenda.

---

## 6. Nota sul dominio di questo repo

`dashboard-outreach.davidecaiazzo.it` è una dashboard interna (`noindex,nofollow`)
e oggi non carica servizi di terze parti. L'integrazione è predisposta qui perché
è lo stesso stack usato sui siti pubblici: se la dashboard resta senza tracciamento,
basta lasciare `CONFIG` vuoto e non succede nulla. Gli stessi tre ID vanno
compilati sul sito pubblico dove il banner serve davvero.

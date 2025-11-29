AI Agents — komplet plików (frontend + backend)

Foldery:
- frontend/  -> statyczna strona (index.html, style.css, script.js, logo.svg)
- backend/   -> Node.js Express API (server.js) - obsługuje /api/contact, /api/chat, /admin/leads
- data/      -> (automatycznie tworzony) leads.json - zapis zapytań

Szybkie uruchomienie lokalne:
1. Przejdź do backend:
   cd backend
2. Zainstaluj zależności:
   npm install
3. Skopiuj .env.example do .env i wypełnij wartości (OPENAI_API_KEY, SMTP_* oraz ADMIN_TOKEN)
4. Uruchom backend:
   node server.js
5. Otwórz przeglądarkę: http://localhost:3000  (serwer automatycznie serwuje frontend)

Wskazówki do wdrożenia:
- Na serwerze VPS: umieść frontend w /var/www/ai/frontend, backend w /var/www/ai/backend i skonfiguruj nginx reverse-proxy.
- Ustaw zmienne środowiskowe (OPENAI_API_KEY, SMTP_*, ADMIN_TOKEN) w systemie lub w usłudze hostingu.
- Użyj pm2 do uruchomienia procesu w tle: npm i -g pm2; pm2 start server.js --name ai-agents

Bezpieczeństwo:
- Trzymaj OPENAI_API_KEY i SMTP_PASS poza repo (w .env).
- Zmień ADMIN_TOKEN na długi, losowy ciąg.

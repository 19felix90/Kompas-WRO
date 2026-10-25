# Kompas WRO — publikacja na GitHub Pages (v0.2.1 beta)

Ta paczka zawiera **gotową do opublikowania stronę internetową** w formie PWA. Pliki `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `.nojekyll` oraz foldery `assets/` i `data/` muszą znaleźć się **bezpośrednio w głównym katalogu repozytorium**. Nie przesyłaj samego ZIP jako strony.

## 1. GitHub: załóż repozytorium

1. Zaloguj się na https://github.com/ lub załóż bezpłatne konto.
2. Otwórz https://github.com/new .
3. Nazwa repozytorium: **kompas-wro** (małe litery i myślnik).
4. Widoczność: **Public** — bezpłatna usługa GitHub Pages działa z publicznymi repozytoriami.
5. Kliknij **Create repository**. Jeśli włączyłeś dodatkowy plik README, to też jest w porządku.

Repozytorium i jego zawartość są publiczne. **Nie umieszczaj tam swojego klucza Google** ani innych prywatnych danych. Klucz nie jest częścią dostarczonej paczki.

## 2. Prześlij pliki strony

1. Rozpakuj ZIP na komputerze.
2. W repozytorium na GitHub kliknij **Add file → Upload files**. Jeśli repozytorium jest puste, wybierz link przesyłania plików.
3. Przeciągnij **zawartość** rozpakowanego folderu, a nie ZIP. Upewnij się, że do repozytorium trafiły również podfoldery `data` i `assets`, a `index.html` znajduje się w korzeniu. Plik `.nojekyll` na Macu jest ukryty i nie jest niezbędny; aby zobaczyć ukryte pliki Finderem, użyj `Cmd + Shift + .`.
4. Na dole zatwierdź przesłanie (Commit changes / Commit directly to main).

## 3. Włącz Pages

1. W repozytorium kliknij **Settings → Pages**.
2. W sekcji **Build and deployment** wybierz **Source: Deploy from a branch**.
3. Wybierz gałąź **main** oraz folder **/(root)**, potem **Save**.
4. Po opublikowaniu GitHub pokaże adres w rodzaju:

   https://TWOJ-LOGIN.github.io/kompas-wro/

   Część `TWOJ-LOGIN` zamień na nazwę użytkownika GitHub. To tylko schemat adresu, a nie gotowy link.

## 4. Dodaj do ekranu początkowego iPhone'a

1. Otwórz gotowy adres HTTPS w Safari na iPhonie.
2. **Udostępnij → Dodaj do ekranu początkowego**.
3. Włącz **Otwórz jako aplikację www**, jeśli opcja jest widoczna, i kliknij **Dodaj**.
4. Otwieraj odtąd **Kompas WRO** z ikony. Nie potrzebujesz już skryptu `START_MAC.command` ani włączonego Maca.

## 5. Dodaj do Docka na Macu

Otwórz adres HTTPS w Safari i wybierz **Plik → Dodaj do Docka** (macOS Sonoma 14 lub nowszy). Aplikację będzie można uruchamiać także ze Spotlight.

## 6. Google Street View — nowe ograniczenie klucza

W Google Cloud Console otwórz dane uwierzytelniające klucza Maps Embed API. Ograniczenia:

- **Application restrictions:** Websites.
- **Website restrictions:** `https://TWOJ-LOGIN.github.io/*` (pełna nazwa konta, bez spacji). Obejmuje stronę `/kompas-wro/` — panorama korzysta z nagłówka referer zawierającego domenę, a niekoniecznie ścieżkę aplikacji.
- **API restrictions:** Restrict key → tylko **Maps Embed API**.

Jeśli wciąż używasz wersji lokalnej na Macu, możesz pozostawić drugi dozwolony adres `http://127.0.0.1:8765/*`. Jeżeli Google nie zaakceptuje ścieżki w tym polu, użyj samego origin `http://127.0.0.1:8765/`.

**Klucz trzeba wkleić oddzielnie na iPhonie i Macu**. W aplikacji znajdź `Wyświetlaj Street View bezpośrednio tutaj` i wklej klucz w polu. Nie umieszczaj klucza w repozytorium. Zapamiętywanie klucza w aplikacji działa lokalnie, więc dane z jednego urządzenia nie przeniosą się na drugie.

## 7. Uwagi o działaniu

- Po publikacji PWA działa pod **HTTPS** bez własnego serwera i bez otwierania Terminala.
- Mapa OpenStreetMap, biblioteka Leaflet, geometrie z SIP Wrocław i panoramy Google wymagają dostępu do internetu. Sama powłoka PWA ma cache, ale **nie jest to pełna mapa offline**.
- Losowanie, quiz, punkty, ulice i osiedla mają lokalny zestaw startowy, ale przy niedostępności SIP Wrocław ich położenie może być orientacyjne.
- Wyniki i klucz Google są przechowywane lokalnie przez przeglądarkę. **Nie ma automatycznej synchronizacji postępów między urządzeniami.** Po przejściu z `http://127.0.0.1:8765` na domenę GitHub Pages historyczne wyniki nie przeniosą się automatycznie.
- W publicznym repozytorium znajduje się tylko kod aplikacji i niesekretne dane startowe. Nie zawiera klucza ani historii treningów.
- Późniejsze poprawki: prześlij zmodyfikowane pliki do repozytorium `kompas-wro` i zaakceptuj zmiany. GitHub Pages opublikuje nową wersję.

## Instrukcje oficjalne

- GitHub: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Dodawanie plików: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Apple iPhone: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27
- Apple Mac: https://support.apple.com/pl-pl/104996
- Google Maps Embed API: https://developers.google.com/maps/documentation/embed/quickstart

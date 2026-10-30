# My Bar — prywatny barman (v1.0)

Aplikacja PWA w języku polskim. Dodawaj alkohole i inne składniki, sprawdzaj dostępne koktajle i brakujące produkty, twórz listę zakupów i dopasowuj porcje.

**Otwórz:** https://19felix90.github.io/Kompas-WRO/my-bar/

Na iPhonie otwórz aplikację w Safari i użyj **Udostępnij → Dodaj do ekranu początkowego**. Na Androidzie w Chrome wybierz **Zainstaluj aplikację**.

Zawiera 54 przepisy offline. Po świadomym kliknięciu „Dobierz z internetu” odwołuje się do publicznego API 24cocktails.com (https://24cocktails.com/developers.html). Zapasy i preferencje trzymane są w localStorage na danym urządzeniu, bez synchronizacji. Możesz eksportować i importować kopię JSON. Receptury z API są oznaczone źródłem. Integracja online zależy od dostępności i zasad zewnętrznego API.

Projekt umieszczony w katalogu `my-bar/` obok aplikacji Kompas WRO. Osobny service worker jest ograniczony do tego katalogu. Bez zewnętrznych kluczy i danych wrażliwych.

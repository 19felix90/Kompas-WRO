# My Bar — prywatny barman (v1.2)

Aplikacja PWA w języku polskim. Dodawaj alkohole i inne składniki, sprawdzaj dostępne koktajle i brakujące produkty, twórz listę zakupów i dopasowuj porcje.

**Otwórz:** https://19felix90.github.io/Kompas-WRO/my-bar/

Na iPhonie otwórz aplikację w Safari i użyj **Udostępnij → Dodaj do ekranu początkowego**. Na Androidzie w Chrome wybierz **Zainstaluj aplikację**.

Zawiera 54 przepisy offline. W wersji 1.1 rozpoznaje marki i warianty butelek oraz zapamiętuje ręczne korekty klasyfikacji. Niejednoznaczne nazwy, np. samo Martini, wymagają dopisania wariantu lub ręcznego wybrania typu. Po świadomym kliknięciu „Dobierz z internetu” odwołuje się do publicznego API 24cocktails.com (https://24cocktails.com/developers.html). Zapasy i preferencje trzymane są w localStorage na danym urządzeniu, bez synchronizacji. Możesz eksportować i importować kopię JSON. Receptury z API są oznaczone źródłem. Integracja online zależy od dostępności i zasad zewnętrznego API.

Projekt umieszczony w katalogu `my-bar/` obok aplikacji Kompas WRO. Osobny service worker jest ograniczony do tego katalogu. Bez zewnętrznych kluczy i danych wrażliwych.

## Autouzupełnianie produktów (1.2)

Podczas wpisywania nazwy (np. `botucal`) aplikacja od razu pokazuje konkretne warianty z wbudowanej bazy — Planas (rum biały), Mantuano i Reserva Exclusiva (rum ciemny/dojrzewający). Wykorzystuje także dopasowanie po części nazwy i proste literówki. Po kliknięciu propozycji nazwa i kategoria wypełniają się automatycznie; ręczna poprawka zostaje zapamiętana.

Dla marek spoza katalogu może wyszukać dodatkowe produkty w [Open Food Facts Search-a-licious](https://openfoodfacts.github.io/search-a-licious/users/ref-openapi/). Zapytania wysyłane są tylko po wpisaniu co najmniej 4 znaków i zatrzymaniu pisania, z cache oraz limitem częstości. Jeśli lokalny katalog już zwrócił wystarczająco wiele wyników, dodatkowe wyszukiwanie można uruchomić przyciskiem. Dostępność API, CORS i pokrycie produktów zależą od zewnętrznego dostawcy — w razie niepowodzenia lokalny katalog i ręczny wybór nadal działają. Zapasy są nadal zapisywane tylko lokalnie.

**Awaryjna baza produktów:** Przy niedostępności Open Food Facts wyszukiwarka może skorzystać z publicznego API Wikidata. Dopasowuje tylko wyniki o rozpoznawalnym rodzaju napoju. Wpisy w katalogu są podpowiedziami, a rodzaj możesz ręcznie poprawić. Nie wszystkie marki i warianty muszą znajdować się w tych bazach.

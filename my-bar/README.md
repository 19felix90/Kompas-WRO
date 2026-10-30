> **ARCHIWALNA KOPIA — projekt przeniesiony do [repozytorium Bar](https://github.com/19felix90/Bar).**
>
> Nowy adres aplikacji po włączeniu GitHub Pages: https://19felix90.github.io/Bar/ .
> Ten folder pozostaje tymczasowo, aby stary adres i możliwość wyeksportowania zapasów nie zniknęły przed uruchomieniem nowej strony. Nie rozwijamy już tutaj My Bar.
>
> **Na iPhonie:** przed usunięciem starego skrótu zapisz kopię JSON z ustawień starej aplikacji. Po uruchomieniu nowego adresu zaimportuj kopię, jeżeli dane nie przeniosą się automatycznie.

---

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

### Likier z marakui
Passoã / Passoa jest rozpoznawana jako **likier z marakui**, a nie purée ani syrop. Warianty zapisuje się jako konkretną nazwę na butelce. Ta kategoria ma odrębny identyfikator `passion_fruit_liqueur`, dzięki czemu nie zastępuje owocu `passion_fruit` w przepisach.

### Aktualizacja 1.2.3 — Amarula i Ron Compañero

Wyszukiwanie rozpoznaje warianty Amarula Original Cream (likier śmietankowy), Amarula African Gin (gin), Amarula Ethiopian Coffee i Vanilla Spice (likiery śmietankowe) oraz Amarula Vegan (oddzielny likier kremowy roślinny). Sama marka "Amarula" jest niejednoznaczna, więc należy wskazać wariant z podpowiedzi.

W katalogu Ron Compañero Extra Añejo Panama 54% jest rumem ciemnym/dojrzewającym; Compañero Gran Reserva jest rumem dojrzewającym, natomiast Elixir Orange to **likier na bazie rumu**, który nie zastępuje automatycznie zwykłego rumu. Poprawiono obsługę akcentów i nazw skopiowanych ze sklepu, m.in. "Rum Companero Extra Anejo Panama / 54% / 0,7l".

Źródła opisów produktów:
- Amarula Original Cream: https://www.unitedbeverages.pl/produkt.html?id=600
- Warianty Amarula: https://sklep-domwhisky.pl/firm-pol-1672244484-Amarula.html
- Compañero: https://www.roncompanero.com/
- Compañero Extra Añejo Panama: https://sklep-domwhisky.pl/product-pol-35314-Rum-Companero-Extra-Anejo-Panama-54-0-7l.html


### My Bar 1.3 — katalogi alkoholi
Po wpisaniu przynajmniej czterech znaków i chwili bez pisania aplikacja przeszukuje otwarte katalogi **DrinkDB** (bez klucza) i **Open Food Facts** (Search-a-licious). Kiedy jest zbyt mało wyników, próbuje również starszego API wyszukiwania Open Food Facts oraz **Wikidata**. Bazy różnią się zasięgiem, ograniczeniami zapytań i obsługą CORS — dostępność i kompletność nie są gwarantowane. Lokalny katalog działa offline. Nie wysyłamy do wyszukiwarek zawartości barku, tylko wpisaną nazwę produktu; aplikacja pokazuje źródło każdej propozycji.

Wpisz „rhum orange santa theresa” lub „Santa Teresa Rhum Orange”, aby znaleźć **Santa Teresa Rhum Orange Liqueur** (40%): likier pomarańczowy na bazie rumu, *nie* czysty rum. Wpisy z niepełnymi lub niepewnymi metadanymi wymagają ręcznego potwierdzenia rodzaju. Poprawki użytkownika są zapamiętywane lokalnie.

Źródła potwierdzające kategorię Santa Teresa:
- https://haciendasantateresa.com.ve/en/catalogo/portfolio/
- https://www.diffordsguide.com/beer-wine-spirits/1645/santa-teresa-rhum-orange-liqueur
- https://www.thewhiskyexchange.com/p/7138/santa-teresa-rhum-orange-liqueur

API produktów: https://www.drinkdb.site/api.php oraz https://world.openfoodfacts.org/


### My Bar 1.3.2 — Plantation / Planteray Stiggins’ Fancy Pineapple
- Produkt oznaczony jako „Rum infuzowany / owocowy” (`infused_rum`), z zachowaniem nazwy konkretnej butelki. To rum infuzowany ananasem, nie sok ananasowy ani likier.
- Wyszukiwanie akceptuje zarówno starą markę **Plantation** (np. „plantation pineapple”), jak i nową **Planteray** (np. „Planteray Stiggins Fancy Pineapple”). Propozycje wskazują ten sam produkt.
- Rum infuzowany może zaspokajać wymóg „rum (dowolny)”, ale nie wymóg konkretnego rumu białego czy ciemnego, gdyż wpłynąłby na profil smakowy klasycznej receptury.
- Źródło: https://planterayrum.com/product/stiggins-fancy-pineapple/ (producent). Przedstawiciel w Polsce: https://www.unitedbeverages.pl/upload/infolog/karta-produktow-planteray-stiging-pineapple.pdf

/* My Bar: słownik marek i wariantów, bez kluczy API.
   Osobne warianty zapobiegają myleniu np. Martini Bianco z Rosso. */
'use strict';
const PRODUCT_BRAND_GROUPS=[
 ['ready_cocktail',["Campari Soda","Smirnoff Ice","Aperol Spritz Ready to Drink"]],
 ['flavored_gin',["Beefeater Pink","Gordon's Pink","Bombay Bramble","Malfy Gin Rosa"]],
 ['gin',["Hendrick's","Hendrick’s","Hendrick's Gin","Hendrick’s Orbium","Bombay Sapphire","Bombay Dry","Tanqueray","Tanqueray No. Ten","Beefeater London Dry","Beefeater 24","Gordon's London Dry","Monkey 47","Roku Gin","Gin Mare","Malfy Originale","Malfy Limone","Plymouth Gin","Citadelle Gin","Brockmans Gin","The Botanist","Bulldog Gin","Gin Lubuski"]],
 ['flavored_vodka',["Absolut Citron","Absolut Vanilla","Absolut Raspberri","Absolut Lime","Smirnoff Raspberry","Smirnoff Vanilla","Soplica Wiśniowa","Soplica Orzech Laskowy","Żubrówka Bison Grass","Zubrowka Bison Grass"]],
 ['vodka',["Absolut","Absolut Original","Belvedere","Grey Goose","Finlandia","Smirnoff","Smirnoff No.21","Wyborowa","Ostoya","Chopin Vodka","Żubrówka Biała","Zubrowka Biala","Sobieski Vodka","Ketel One","Cîroc","Ciroc Vodka","Stolichnaya","Stoli Vodka"]],
 ['spiced_rum',["Captain Morgan Spiced","Captain Morgan Original Spiced Gold","Captain Morgan Spiced Gold","Bacardi Spiced","Bacardi Oakheart","Kraken Black Spiced","The Kraken","Dead Man's Fingers Spiced","Sailor Jerry"]],
 ['white_rum',["Bacardi Carta Blanca","Bacardi Superior","Bacardi White","Havana Club 3","Havana Club 3 Años","Havana Club 3 Anos","Havana Club Añejo 3 Años","Havana Club Anejo Blanco","Plantation 3 Stars","Planteray 3 Stars","Brugal Blanco","Diplomatico Planas","Flor de Caña 4 Extra Seco"]],
 ['dark_rum',["Havana Club 7","Havana Club 7 Años","Havana Club Especial","Havana Club Añejo Especial","Bacardi Carta Oro","Bacardi Gold","Bacardi Reserva Ocho","Bacardi 8","Captain Morgan Dark","Diplomático Reserva Exclusiva","Diplomatico Reserva Exclusiva","Don Papa","Zacapa 23","Ron Zacapa","Plantation Original Dark","Planteray Original Dark","Appleton Estate","Mount Gay Eclipse","Goslings Black Seal"]],
 ['tequila_reposado',["Don Julio Reposado","Patrón Reposado","Patron Reposado","Olmeca Reposado","Olmeca Altos Reposado","Jose Cuervo Tradicional Reposado","Herradura Reposado","Espolòn Reposado","Espolon Reposado","1800 Reposado"]],
 ['tequila_anejo',["Don Julio Añejo","Don Julio Anejo","Don Julio 1942","Patrón Añejo","Patron Anejo","Herradura Añejo","1800 Añejo"]],
 ['tequila_gold',["Jose Cuervo Especial Gold","Olmeca Gold","Sierra Gold","Sauza Gold"]],
 ['tequila',["Don Julio Blanco","Patrón Silver","Patron Silver","Olmeca Blanco","Olmeca Altos Plata","Jose Cuervo Especial Silver","Jose Cuervo Tradicional Plata","Sierra Silver","Espolòn Blanco","Espolon Blanco","Herradura Plata","1800 Silver","Casamigos Blanco"]],
 ['mezcal',["Del Maguey Vida","Montelobos Espadín","Montelobos Espadin","Mezcal Unión","Mezcal Union","400 Conejos"]],
 ['pisco',["Barsol Pisco","Pisco 1615","Capel Pisco"]],
 ['whiskey_liqueur',["Jack Daniel's Tennessee Honey","Jack Daniels Honey","Jack Daniel's Fire","Jim Beam Honey","Southern Comfort"]],
 ['bourbon',["Maker's Mark","Makers Mark","Jim Beam","Jim Beam White","Wild Turkey","Wild Turkey 101","Bulleit Bourbon","Buffalo Trace","Woodford Reserve","Four Roses","Knob Creek","Evan Williams"]],
 ['rye_whiskey',["Bulleit Rye","Sazerac Rye","Rittenhouse Rye","Wild Turkey 101 Rye","Jim Beam Rye"]],
 ['irish_whiskey',["Jameson","Jameson Irish Whiskey","Bushmills Original","Tullamore D.E.W.","Tullamore Dew","Redbreast 12","Teeling Small Batch"]],
 ['whiskey',["Jack Daniel's","Jack Daniels","Jack Daniel's Old No. 7","Johnnie Walker","Johnnie Walker Black Label","Johnnie Walker Red Label","Ballantine's","Ballantines","Chivas Regal","Glenfiddich","Glenlivet","Glenmorangie","Laphroaig","Talisker","Lagavulin","Grant's","Dewar's","Monkey Shoulder","Nikka From The Barrel","Suntory Toki"]],
 ['brandy',["Hennessy","Hennessy VS","Rémy Martin","Remy Martin","Martell","Courvoisier","Metaxa 5","Metaxa 7","Stock 84","Torres 10","Vecchia Romagna"]],
 ['cachaca',["Cachaça 51","Cachaca 51","Leblon Cachaça","Leblon Cachaca","Ypióca"]],
 ['white_vermouth',["Martini Bianco","Cinzano Bianco","Carpano Bianco","Dolin Blanc","Martini Riserva Ambrato"]],
 ['sweet_vermouth',["Martini Rosso","Martini Riserva Rubino","Cinzano Rosso","Carpano Antica Formula","Dolin Rouge","Punt e Mes"]],
 ['dry_vermouth',["Martini Extra Dry","Martini Dry","Noilly Prat Original Dry","Noilly Prat","Dolin Dry","Cinzano Extra Dry"]],
 ['prosecco',["Martini Asti","Martini Prosecco","Cinzano Prosecco","Mionetto Prosecco","La Marca Prosecco","Freixenet Prosecco","Freixenet Cordon Negro","Moët & Chandon Brut Impérial","Veuve Clicquot Brut"]],
 ['aperitif_liqueur',["Martini Fiero","Martini Bitter","Select Aperitivo","Pimm's No.1","Lillet Blanc","Lillet Rouge"]],
 ['campari',["Campari","Campari Bitter"]],
 ['aperol',["Aperol","Aperol Aperitivo"]],
 ['triple_sec',["Cointreau","Grand Marnier","Bols Triple Sec","Bols Blue Curaçao","Bols Blue Curacao","De Kuyper Triple Sec","De Kuyper Blue Curacao","Marie Brizard Triple Sec","Pierre Ferrand Dry Curaçao"]],
 ['coffee_liqueur',["Kahlúa","Kahlua","Tia Maria","Mr Black Coffee Liqueur","Bols Coffee"]],
 ['amaretto',["Disaronno","Disaronno Originale","Lazzaroni Amaretto","Bols Amaretto"]],
 ['maraschino',["Luxardo Maraschino","Maraska Maraschino"]],
 ['cream_liqueur',["Baileys","Baileys Original","Carolans","Five Farms Irish Cream","Sheridan's"]],
 ['coconut_liqueur',["Malibu","Malibu Original","Bols Coconut"]],
 ['herbal_liqueur',["Jägermeister","Jagermeister","Becherovka","Chartreuse Verte","Chartreuse Jaune","Suze"]],
 ['elderflower_liqueur',["St-Germain","St Germain","St-Germain Elderflower","Bols Elderflower"]],
 ['peach_liqueur',["Archers Peach Schnapps","De Kuyper Peachtree","Peachtree","Bols Peach"]],
 ['melon_liqueur',["Midori","Bols Melon"]],
 ['limoncello',["Villa Massa","Pallini Limoncello","Limoncello di Capri"]],
 ['amaro',["Amaro Montenegro","Amaro Nonino","Averna","Ramazzotti","Fernet Branca","Cynar"]],
 ['benedictine',["Bénédictine","Benedictine D.O.M."]],
 ['cherry_liqueur',["Cherry Heering","De Kuyper Cherry Brandy"]],
 ['angostura',["Angostura Aromatic Bitters","Angostura Bitters"]],
 ['tonic',["Schweppes Indian Tonic","Schweppes Tonic","Fever-Tree Tonic","Fever Tree Indian Tonic","Kinley Tonic","Thomas Henry Tonic"]],
 ['ginger_ale',["Schweppes Ginger Ale","Fever-Tree Ginger Ale","Kinley Ginger Ale"]],
 ['ginger_beer',["Fever-Tree Ginger Beer","Bundaberg Ginger Beer","Fentimans Ginger Beer"]],
 ['cola',["Coca-Cola","Coca Cola","Pepsi","Pepsi Max"]],
 ['soda',["Schweppes Soda Water","Fever-Tree Soda Water","Kinley Soda Water"]]
];
// Warianty Botucal = rynkowa nazwa rodziny rumów Diplomático.
// Planas jest białym rumem, pozostałe wymienione warianty są dojrzewające.
PRODUCT_BRAND_GROUPS.push(
 ['white_rum',['Botucal Planas','Botucal Planas Rum','Botucal Planas 47%','Diplomático Planas','Diplomatico Planas']],
 ['dark_rum',['Botucal Reserva Exclusiva','Botucal Reserva Exlusiva','Botucal Reserva','Botucal Mantuano','Botucal Selección de Familia','Botucal Seleccion de Familia','Botucal Single Vintage','Botucal No.1 Batch Kettle','Botucal No.2 Barbet','Botucal No.3 Pot Still','Diplomático Mantuano','Diplomatico Mantuano','Diplomático Reserva Exclusiva']]
);
const PRODUCT_BRANDS=PRODUCT_BRAND_GROUPS.flatMap(([key,names])=>names.map(name=>({key,name})));
const AMBIGUOUS_BRANDS=[
 ['botucal','Botucal ma różne rumy: Planas (biały), Mantuano i Reserva Exclusiva (dojrzewające). Wybierz wariant z podpowiedzi.'],
 ['diplomatico','Diplomático ma różne warianty rumu. Wybierz konkretną butelkę z podpowiedzi.'],
 ['martini','Marka Martini ma różne wermuty i wina musujące — dopisz wariant.'],
 ['cinzano','Marka Cinzano ma wermuty i wina musujące — dopisz wariant.'],
 ['bacardi','Bacardi ma biały, ciemny i korzenny rum — dopisz wariant.'],
 ['havana club','Havana Club ma różne rodzaje rumu — dopisz wariant.'],
 ['captain morgan','Captain Morgan ma rum ciemny i korzenny — dopisz wariant.'],
 ['jose cuervo','Jose Cuervo ma różne tequile — dopisz wariant.'],
 ['olmeca','Olmeca ma tequila blanco i reposado — dopisz wariant.'],
 ['don julio','Don Julio ma tequila blanco, reposado i añejo — dopisz wariant.'],
 ['patron','Patrón ma tequila blanco, reposado i añejo — dopisz wariant.'],
 ['soplica','Soplica ma różne rodzaje trunków — dopisz wariant.'],
 ['zubrowka','Żubrówka ma wersje czyste i aromatyzowane — dopisz wariant.'],
 ['schweppes','Schweppes ma toniki, ginger ale i inne napoje — dopisz wariant.'],
 ['fever tree','Fever-Tree ma toniki, ginger beer i inne napoje — dopisz wariant.']
];

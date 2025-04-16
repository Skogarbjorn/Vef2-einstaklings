# Vef2-Einstaklingsverkefni

Til að ná að nota verkefnið þarf semsagt að ná í og keyra [consumet api](https://github.com/consumet/api.consumet.org) og setja url-ið sem ```NEXT_PUBLIC_CONSUMET_API_BASE_URL``` í .env eins og er í .env.example, svo 
má keyra þennan framenda með ```npm install``` og svo ```npm run dev``` eða ```npm run start```. Villur sem eslint kvartar yfir hafa ekki enn verið lagaðar svo ekki er hægt að keyra ```npm run build``` í bili.

Einnig þarf að fá einhvers konar CORS proxy til að komast hjá eignarvernd streymisins, t.d. [cors everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) fyrir firefox eða eitthvað álíka.

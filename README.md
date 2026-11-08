# Medemus – hemsida, variant 2

Samma struktur och text som medemus.se, men mer genomarbetad: rundade foton med grön bakgrundsyta, stor tydlig "Boka här"-knapp, dragspel för besvär, ett komplett bokningsformulär och en grön sidfot. Navigeringen är densamma som i första versionen, med en konstant "Boka tid"-knapp (på mobil ligger den i den öppna menyn). Ren HTML, CSS och JavaScript – inget bygg-steg.

| Sida | Fil |
|---|---|
| Startsida | `index.html` |
| Behandling | `pages/behandling.html` |
| Utredning | `pages/utredning.html` |
| Om oss | `pages/om-oss.html` |
| Boka tid | `pages/boka-tid.html` |
| Kontakt | `pages/kontakt.html` |
| Integritetspolicy | `pages/integritetspolicy.html` |

## Struktur

- `css/` – `variables.css` (färger, typsnitt, avstånd), `site.css` (navigering m.m.), `variant.css` (variant 2: sidor, formulär, grön sidfot)
- `js/main.js` – meny, kopiera e-post, dragspel, bokningsformulär
- `assets/images/` – foton och logotyp (från medemus.se)

## Bra att veta

- **Bokningsformuläret** har ingen server. Fälten kontrolleras och ett färdigt mejl till kontakt@medemus.se öppnas i besökarens e-postprogram. Personnumret hamnar då i mejlet – för att ta emot formuläret säkert behövs en formulärtjänst eller en server.
- Typsnitten (Poppins och Inter) hämtas från Google Fonts.
- Alla färger följer WCAG 2.1 AA (se kommentarer i `css/variables.css` och `css/variant.css`).

## Komma igång

```bash
python3 -m http.server 8000
```

Öppna sedan http://localhost:8000.

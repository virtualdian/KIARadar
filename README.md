# Green IT-radar

Een radar met praktijken voor duurzame digitalisering in de erfgoedsector. De inhoud komt uit de bijdragen in de [KIA-groep Green IT](https://kiacommunity.nl/groups/44-green-it/welcome) van het Netwerk Digitaal Erfgoed. De code is een bewerking van de [Wigo4it Duurzaamheidsradar](https://github.com/wigo4it/duurzaamheidsradar), die zelf is gebaseerd op de radars van ThoughtWorks en Zalando.

## Opbouw

**Vijf groepen** (taartpunten, met de klok mee vanaf linksboven):

| # | Groep | Onderwerpen |
|---|-------|-------------|
| 0 | Bestuur & Governance | beleid, inkoop, sturing |
| 1 | Mens & Gedrag | bewustwording, digitaal werken, opschonen |
| 2 | Collecties & Informatiebeheer | selectie, bewaren, dark data, preservering |
| 3 | Infrastructuur & Hosting | cloud, opslag, hardware, energie |
| 4 | Digitale Diensten & Systemen | websites, applicaties, AI, leveranciers |

**Vier ringen**, net als bij Wigo4it, maar dan vanuit het perspectief van de erfgoedsector:

- **DOING**: gangbare, bewezen praktijk. Dit doet de sector al en raden de bijdragen aan.
- **ONGOING**: hier is de sector mee bezig en wil ze overal doorvoeren.
- **PLANNING**: dit wordt onderzocht of verkend en kan interessant zijn.
- **UNDOING**: gewoonte waar de bijdragen van afraden.

Elk punt is een **onderwerp** dat uit een of meer KIA-bijdragen is samengesteld. De wikipagina van een onderwerp legt uit wat het is, waarom het in die ring staat, wat je kunt doen, en linkt naar de oorspronkelijke bijdragen.

**Vorm van een punt**: een vierkant betekent nieuw, dus een onderwerp met een KIA-bijdrage van na 1 juli 2026. Een driehoek betekent verplaatst ten opzichte van de vorige versie.

## Bestanden

```
index.html              radar en uitleg
radar.js                tekent de radar (D3 v4), vijf taartpunten
radar.css               kleuren en opmaak
wiki.html, wiki.css     toont een wikipagina uit wiki/<naam>.md
changelog.html          overzicht van versies
versions/versions.json  lijst met versies
versions/2026-Q4.json   de punten van versie 2026.Q4
wiki/*.md               een wikipagina per punt
```

Een punt in `versions/<versie>.json`:

```json
{
  "quadrant": 0,
  "ring": 1,
  "label": "Green IT-beleid",
  "link": "wiki.html?page=greenItBeleid",
  "status": 0
}
```

- `quadrant`: 0 t/m 4, zie de tabel hierboven
- `ring`: 0 DOING, 1 ONGOING, 2 PLANNING, 3 UNDOING
- `label`: maximaal 23 tekens, anders wordt het in de legenda afgekapt
- `link`: verwijst naar `wiki/<naam>.md`
- `status`: 0 onveranderd, 1 nieuw, 2 verplaatst

## Lokaal bekijken

De pagina laadt de data met `fetch`, dus je hebt een kleine webserver nodig:

```bash
python3 -m http.server 8123
```

Open daarna http://localhost:8123. Je kunt de map ook zonder aanpassingen op GitHub Pages zetten; alle paden zijn relatief.

## Nieuwe versie maken

1. Kopieer `versions/2026-Q4.json` naar bijvoorbeeld `versions/2027-Q1.json` en pas de punten aan.
2. Zet `status` op 1 voor nieuwe punten en op 2 voor verplaatste punten. Zet alle andere punten weer op 0.
3. Voeg de versie toe aan `versions/versions.json`.
4. Schrijf of update de wikipagina's in `wiki/`.

## Verantwoording van de inhoud (versie 2026.Q4)

Stand van de KIA-groep Green IT op 29 oktober 2026: 95 bijdragen (de 17 formele bijdragen vallen daaronder) en 63 evenementen. De evenementen zijn niet meegenomen, omdat ze snel verouderen. Van de bijdragen zijn er 89 gebruikt. Deze zes zijn weggelaten, omdat ze niet over Green IT gaan:

- Aankondiging Green IT-event 18 november (alleen een evenementaankondiging)
- DYSECO genomineerd voor de KVK Innovatie Top 100 (klimaatregeling van fysieke depots)
- Webinar en opname over klimaatbeheersing binnen de nieuwe archiefregeling (fysieke depots, twee bijdragen)
- Cultuurberaad Klimaat (klimaat in de cultuursector in het algemeen)
- Nationale Klimaatadaptatiestrategie 2026 (klimaatadaptatie van fysiek erfgoed)

De wikipagina's zijn samenvattingen in eigen woorden. Voor de volledige inhoud verwijzen ze naar de oorspronkelijke bijdragen op KIA.

## Licentie

Zie [LICENSE.md](LICENSE.md). De radarcode valt onder de MIT-licentie van Zalando (zie de kop van `radar.js`).

# Yi Jing Xiang v2 — Redesign UI

**Date:** 2026-04-28
**Branche:** v2
**Approche:** Approche B — Refactor complet vanilla JS, suppression de Swiper et jQuery

---

## Objectif

Adapter l'application Yi Jing Xiang existante au nouveau design fourni dans `nouvelle_version_a_implementer/`, en conservant toute la logique métier (tirage, oracle, localisation, sons). Ajout d'un switch thème sombre/clair. Suppression de Swiper.js et jQuery.

---

## Architecture & Navigation

### Système d'écrans

Remplacement du carousel Swiper par un système d'écrans CSS custom.

Chaque écran est `position: absolute; inset: 0` dans `#app`. Transitions via classes CSS :
- `.screen` — état par défaut : `opacity: 0; transform: translateX(30px); pointer-events: none`
- `.screen.active` — `opacity: 1; transform: translateX(0); pointer-events: all`
- `.screen.leaving` — `opacity: 0; transform: translateX(-30px)` (retiré après 400ms)

**Écrans :**
```
#app
 ├── #s-home    (0) Accueil
 ├── #s-inst    (1) Instructions
 ├── #s-cast    (2) Tirage
 ├── #s-result  (3) Résultat image
 ├── #s-oracle  (4) Oracle texte
 └── #modal-info    Modale info (overlay)
```

**Flow :**
- Home → `Consulter l'oracle` → Instructions → `Commencer` → Casting
- Casting (6 traits) → auto-transition → Result
- Result : flèches prev/next ; si mutation : step 0 = hex1, step 1 = hex2 ; `→` final → Oracle
- Bouton Home dans le header → retour accueil + reset tirage depuis n'importe où

**Supprimé :** `swiper-bundle`, `.swiper-button-next/prev`, jQuery, `#bt-back` bottom navbar, `preloadXHR()`.

---

## Design System

### Layout

- `#app` : `width: 100%; height: 100dvh` — plein écran sur mobile et desktop
- Contenu centré : `max-width: 480px; margin: auto` pour desktop — pas de phone shell
- Mobile first, responsive

### CSS Variables

```css
:root {
  --bg:      #0c0a08;
  --bg2:     #17130f;
  --bg3:     #221c15;
  --text:    #e8dcc4;
  --muted:   #7a6a52;
  --gold:    #c8963c;
  --gold-lt: #e8c060;
  --line-h:  10px;
  --r:       16px;
}

:root.light {
  --bg:      #f5f0e8;
  --bg2:     #ece5d8;
  --bg3:     #e0d8c8;
  --text:    #2a2018;
  --muted:   #8a7860;
  --gold:    #a07020;
  --gold-lt: #c8900a;
}
```

### Typographies (auto-hébergées)

- `Hidetoshy` — `assets/fonts/Hidetoshy/Hidetoshy.ttf` (existant)
- `Noto Serif` (400, 400-italic, 600) — à télécharger dans `assets/fonts/noto-serif/`
- `Noto Sans SC` (300, 400) — à télécharger dans `assets/fonts/noto-sans-sc/`

### Icônes

SVG inline (pas d'images PNG) : home, son, info. Langue : texte FR/EN. Thème : ☾/☀.

---

## Écrans

### #s-home — Accueil

- Header : bouton home caché (sur screen 0), boutons FR/EN, son, info, thème
- Corps centré : `易经` + `Yi Jing` (Hidetoshy), logo image, baseline localisée
- Bouton `Consulter l'oracle` → `goTo(1)`
- Fond : `radial-gradient` sombre centré

### #s-inst — Instructions

- Titre localisé, texte d'instruction localisé
- Grille 2×2 des 4 combinaisons :
  - Yin Mut (3 piles) → ligne brisée avec point
  - Yang (2 faces + 1 pile) → ligne pleine
  - Yin (1 face + 2 piles) → ligne brisée
  - Yang Mut (3 faces) → ligne pleine avec point
  - Visuels pièces : cercles CSS avec lettre localisée (`UI_TEXTS[lang]["coin-face"]` / `"coin-pile"`)
- Boutons bas : `← Retour` / `Commencer →`

### #s-cast — Tirage

- 6 dots de progression (vides → dorés)
- Label `Trait N sur 6` localisé
- Aperçu hexagramme temps réel : 6 slots du bas vers le haut, séparateur trigrame entre slots 3 et 4
- 4 boutons de tirage avec visuels pièces localisés + aperçu ligne :
  - Yin Mut (3 piles) / Yang (2F+1P) / Yin (1F+2P) / Yang Mut (3 faces)
- Bouton `↺ Recommencer`

### #s-result — Résultat image

- En-tête : numéro hexagramme + nom chinois (Hidetoshy) + titre (`HEXAGRAMS_TEXTS`)
- Card image : `img-upper` (trigram haut) + divider + `img-lower` (trigram bas)
- Overlay hexagramme : 6 lignes blanches semi-transparentes en position absolue sur la card
- Si mutation : label `Hexagramme 1` / `Hexagramme 2 — Muté`
- Navigation : `←` prev + `↺ Nouveau tirage` + `→` next
  - Sans mutation : prev désactivé, next → Oracle
  - Mutation step 0 : prev désactivé, next → step 1
  - Mutation step 1 : prev → step 0, next → Oracle

### #s-oracle — Oracle texte

- Header normal
- Zone scrollable : contenu rendu par `buildOracleHTML()` (logique inchangée)
- Boutons bas : `← Image` / `Nouveau tirage`

### #modal-info — Modale info

- Overlay avec `backdrop-filter: blur`
- Bottom sheet : poignée, titre `À propos`, contenu `UI_TEXTS[lang].info`, bouton Fermer
- Ouverture/fermeture par classes CSS (pas de display toggle)

---

## Comportements JS

### Gestionnaire d'écrans

```js
function goTo(idx) {
  // retire active de l'écran courant, ajoute leaving (retiré après 400ms)
  // ajoute active au nouvel écran
}
```

### Theme toggle

```js
function toggleTheme() {
  // bascule :root.light + body.light
  // persiste dans localStorage('YiJingXiang_theme')
}
```
Initialisé au chargement depuis `localStorage`.

### Logique de tirage

Inchangée : `yiking`, `hexagram1/2`, calcul des binaires, images trigrams.  
Refactorée sans jQuery.

### Langue

`SwitchLang()` inchangée dans sa logique, refactorée sans jQuery.  
Les lettres des pièces (`coin-face` / `coin-pile`) se mettent à jour à chaque changement de langue.

**Nouvelles clés dans `UI_TEXTS` :**
```js
"coin-face": "F",  // EN: "H"
"coin-pile": "P",  // EN: "T"
```

### Fonctions inchangées

- `parseSections(mdText)`
- `buildOracleHTML()`
- `PlaySound(src)`

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `index.html` | Réécriture complète (structure screens, suppression Swiper) |
| `assets/css/style.css` | Réécriture complète (nouveau design system) |
| `assets/app/app.js` | Réécriture complète (vanilla JS, suppression jQuery/Swiper) |
| `assets/data/ui-texts.js` | Ajout clés `coin-face`, `coin-pile` |
| `assets/fonts/noto-serif/` | Nouveau dossier — fichiers .ttf/.woff2 Noto Serif |
| `assets/fonts/noto-sans-sc/` | Nouveau dossier — fichiers .ttf/.woff2 Noto Sans SC |
| `sw.js` | Régénérer via `npm run pwa` après |

## Fichiers supprimés / inutilisés

- `assets/libs/swiper/` — plus utilisé
- `assets/libs/jquery/` — plus utilisé
- `assets/images/bt-nav.png`, `bt-back.png`, `bt-flags.png`, `bt-sound.png`, `bt-info.png`, `bars.png`, `bloc.png`, `bloc-bar.png` — remplacés par SVG inline et CSS

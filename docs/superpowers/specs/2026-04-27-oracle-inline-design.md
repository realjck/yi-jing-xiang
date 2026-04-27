# Design : Oracle inline (remplacement du lien Wengu)

**Date :** 2026-04-27  
**Projet :** Yi Jing Xiang — Vanilla JS PWA

---

## Objectif

Remplacer le slide `#end` (lien externe vers wengu) par un lecteur d'oracle inline affichant le contenu des fichiers markdown correspondants au tirage.

---

## Contenu affiché

### Règle d'assemblage

1. **Hexagramme 1** — sections `h1` et `h2` du fichier markdown correspondant
2. **Si mutation(s)** — sections `h3` aux positions où `yiking[i] === '6'` ou `'9'` (i de 0 à 5, gauche = bas = position 1)
3. **Si tous les 6 traits sont mutants** — inclure également le 7ème `h3` (`### Tous les traits`)
4. **Si mutation(s)** — sections `h1` et `h2` du markdown de l'hexagramme 2

### Mapping position/index

`yiking` est une chaîne de 6 caractères (ex. `"679866"`). L'index `i` (0–5) correspond au trait numéro `i+1` (bas → haut), donc au `(i+1)`ème bloc `h3` dans le markdown (les h3 sont ordonnés bas → haut dans chaque fichier).

Le 7ème h3 (`### Tous les traits`) est inclus uniquement si `yiking.split('').every(c => c === '6' || c === '9')`.

### Mapping hexagramme → fichier markdown

Le numéro de l'hexagramme est extrait de `HEXAGRAMS_TEXTS[lang][binary]` (ex. `"1. 乾 Ch'ien / The Creative"` → `1` → `"01"`).  
Chemin : `assets/data/book/{lang}/{num padded 2 digits}.md`

---

## Architecture technique

### Nouvelle fonction : `parseSections(mdText)`

Découpe le markdown brut en sections en splitant sur les headings `#`, `##`, `###`.

```
Entrée  : string markdown complet
Sortie  : [{level: 1|2|3, h3Index: null|1..7, markdown: "## ...\n..."}]
```

- `h3Index` est un compteur incrémenté uniquement sur les sections `h3`, dans l'ordre d'apparition (1 = premier h3 = trait inférieur).
- Chaque élément inclut la ligne de heading + tout le contenu jusqu'au heading suivant.

### Nouvelle fonction : `buildOracleHTML(yiking, lang)`

Fonction async qui :
1. Détermine le numéro de chaque hexagramme depuis `HEXAGRAMS_TEXTS`
2. Fetche le(s) fichier(s) markdown
3. Appelle `parseSections()` sur chaque fichier
4. Filtre les sections selon les règles ci-dessus
5. Passe chaque section retenue dans `marked.parse()`
6. Retourne le HTML concaténé

### Intégration dans `app.js`

- **`AddBar()`** : quand `yiking.length === 6`, appelle `buildOracleHTML()` et insère le résultat dans `#oracle-content`
- **`btBack`** : vide `#oracle-content` et remet la slide à son état initial
- **`SwitchLang()`** : si `hexagram1 != null`, rappelle `buildOracleHTML()` pour recharger dans la nouvelle langue

### Dépendance ajoutée

`assets/libs/marked/marked.min.js` — vendorisé, chargé dans `index.html` avant `app.js`.

---

## HTML (`index.html`)

Slide `#end` — remplace `#book-text`, `#book-image`, `#logo-wengu` par :

```html
<div id="end" class="swiper-slide oracle-slide" style="display:none">
  <div id="oracle-content"></div>
</div>
```

---

## CSS (`style.css`)

Règles pour `#oracle-slide` / `#oracle-content` :

- `#end.oracle-slide` : `align-items: flex-start; justify-content: flex-start; overflow: hidden; padding: 0;`
- `#oracle-content` : `overflow-y: auto; height: 100vh; padding: 3em 20vw 6em 20vw; text-align: left; font-family: system-ui, -apple-system, Arial, sans-serif; font-size: 1em; line-height: 1.7em; letter-spacing: 0.02em; user-select: text; box-sizing: border-box;`
- Padding bottom `6em` pour laisser de la place au `navbar-bottom`
- Titres `h1, h2, h3` dans `#oracle-content` : couleur et taille cohérentes, `font-family` hérité
- `blockquote` dans `#oracle-content` : style lisible (italic, border-left, légèrement indenté)
- Mobile (`max-width: 640px`) : padding horizontal réduit à `10vw`

---

## Ce qui est retiré

- L'event listener `#book-image` (lien Wengu)
- L'entrée `"book"` dans `UI_TEXTS` (plus utilisée) — on laisse les données mais on retire l'appel dans `SwitchLang()`
- Les éléments HTML `#book-text`, `#book-image`, `#logo-wengu`
- Le style CSS `#book-image`, `#logo-wengu`

---

## Hors périmètre

- Modification des fichiers markdown
- Changement du système de son, de navigation, ou de la logique de tirage
- Refactoring de `app.js` au-delà du nécessaire

# Oracle Inline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le lien externe Wengu par un lecteur d'oracle inline affichant le contenu des fichiers markdown dans le slide `#end`.

**Architecture:** `parseSections()` découpe un fichier markdown brut en sections indexées par niveau de heading. `buildOracleHTML()` est une fonction async qui fetche les fichiers markdown, filtre les sections selon les règles du tirage (h1/h2 hex1 + h3 mutants + h1/h2 hex2), et retourne le HTML rendu par marked.js. L'intégration se fait dans les fonctions existantes `AddBar`, `btBack` et `SwitchLang` sans restructurer le fichier.

**Tech Stack:** Vanilla JS ES6, jQuery 1.12, marked.js (vendorisé), fetch API, CSS flex

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `assets/libs/marked/marked.min.js` | CRÉER — librairie vendorisée |
| `index.html` | MODIFIER — script tag + contenu slide #end |
| `assets/css/style.css` | MODIFIER — nouveaux styles oracle, suppression styles obsolètes |
| `assets/app/app.js` | MODIFIER — parseSections, buildOracleHTML, intégration |

---

## Task 1: Vendor marked.js + script tag

**Files:**
- Create: `assets/libs/marked/marked.min.js`
- Modify: `index.html`

- [ ] **Step 1.1 — Télécharger marked.min.js**

```bash
mkdir -p assets/libs/marked
curl -L "https://cdn.jsdelivr.net/npm/marked/marked.min.js" -o assets/libs/marked/marked.min.js
```

Vérifier que le fichier existe et pèse ~25 KB.

- [ ] **Step 1.2 — Ajouter le script tag dans index.html**

Localiser le bloc des scripts en bas de `index.html` (actuellement lignes 83–87). Ajouter marked **avant** app.js :

```html
<script src="./assets/libs/swiper/swiper-bundle.min.js"></script>
<script src="./assets/libs/jquery/jquery-1.12.4.min.js"></script>
<script src="./assets/libs/marked/marked.min.js"></script>
<script src="./assets/data/ui-texts.js"></script>
<script src="./assets/data/hexagrams-texts.js"></script>
<script src="./assets/app/app.js"></script>
```

- [ ] **Step 1.3 — Vérifier que marked est disponible**

Ouvrir `index.html` dans le navigateur, ouvrir la console JS, taper `typeof marked` → doit retourner `"object"`.

---

## Task 2: Update #end slide HTML

**Files:**
- Modify: `index.html`

Le slide `#end` actuel (lignes 74–78) :
```html
<div id="end" class="swiper-slide" style="display:none">
    <div id="book-text"></div>
    <div id="book-image"></div>
    <div id="logo-wengu"></div>
</div>
```

- [ ] **Step 2.1 — Remplacer le contenu du slide #end**

Remplacer entièrement les lignes ci-dessus par :

```html
<div id="end" class="swiper-slide" style="display:none">
    <div id="oracle-content"></div>
</div>
```

- [ ] **Step 2.2 — Vérifier en navigateur**

Ouvrir l'app, faire un tirage complet (6 clics sur une pièce), naviguer jusqu'au dernier slide. Le slide doit être vide (oracle-content existe mais est vide). Aucune erreur dans la console.

---

## Task 3: CSS — styles oracle + suppression styles obsolètes

**Files:**
- Modify: `assets/css/style.css`

- [ ] **Step 3.1 — Supprimer les styles devenus obsolètes**

Dans `style.css`, supprimer les blocs suivants :

```css
/* À supprimer (lignes ~79-85) */
#logo-wengu {
    font-size: 0.4em;
    width: 12em;
    height: 9em;
    background-image: url('../images/wengu-logo.jpg');
    background-size: contain;
}

/* À supprimer (lignes ~299-314) */
#book-text {
    font-size: 1.6em;
}

#book-image {
    font-size: 0.4em;
    width: 34em;
    height: 31em;
    background-image: url('../images/book.png');
    background-size: 100%;
    cursor: pointer;
}

#book-image:hover {
    background-position-y: 100%;
}
```

Et dans le bloc `@media (max-width: 640px)`, supprimer :
```css
/* À supprimer (~lignes 336-339) */
#book-text {
    font-size: 1.2em;
}
```

- [ ] **Step 3.2 — Ajouter les styles du slide oracle**

Ajouter à la fin de `style.css` (avant le bloc `/* FONTS */`) :

```css
/* Oracle reader */
#end {
    display: block;
    max-width: 100%;
    padding: 0;
    overflow: hidden;
}

#oracle-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 2em 20vw 5em 20vw;
    text-align: left;
    font-family: system-ui, -apple-system, Arial, sans-serif;
    font-size: 0.95em;
    line-height: 1.7;
    letter-spacing: 0.01em;
    user-select: text;
    -webkit-user-select: text;
}

#oracle-content h1 {
    font-weight: bold;
    font-size: 1.3em;
    margin-top: 1.8em;
    margin-bottom: 0.2em;
}

#oracle-content h2 {
    font-weight: bold;
    font-size: 1.05em;
    margin-top: 1.5em;
    margin-bottom: 0.2em;
}

#oracle-content h3 {
    font-weight: bold;
    font-size: 1em;
    color: #b96361;
    margin-top: 1.5em;
    margin-bottom: 0.2em;
}

#oracle-content blockquote {
    border-left: 2px solid #c6c2be;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #555;
    font-style: italic;
}

#oracle-content ul {
    margin: 0.3em 0;
    padding-left: 1.5em;
}

#oracle-content p {
    margin: 0.4em 0;
}

@media (max-width: 640px) {
    #oracle-content {
        padding: 2em 10vw 5em 10vw;
        font-size: 1em;
    }
}
```

- [ ] **Step 3.3 — Vérifier visuellement**

Ouvrir l'app, faire un tirage, naviguer vers le slide oracle. Le slide doit s'afficher plein écran sans les flexbox de centrage. Aucune erreur console.

---

## Task 4: JS — parseSections() + buildOracleHTML() + suppression Wengu

**Files:**
- Modify: `assets/app/app.js`

- [ ] **Step 4.1 — Supprimer le listener #book-image (lignes 179–185)**

Supprimer entièrement ce bloc dans `app.js` :

```js
/**
 * Link to Wengu Tartarie book
 */
$("#book-image").on("click", ()=>{
    PlaySound("click");
    const hexatext = HEXAGRAMS_TEXTS[lang][hexagram1];
    const num = hexatext.substring(0, hexatext.indexOf("."));
    const url = "http://139.162.86.18/wg/wengu.php?l=Yijing&tire="+yiking+"&no="+num+"&lang="+lang;
    window.open(url, '_blank').focus();
});
```

- [ ] **Step 4.2 — Supprimer la mise à jour de #book-text dans SwitchLang**

Dans la fonction `SwitchLang`, supprimer la ligne :

```js
$("#book-text").html(UI_TEXTS[lang]["book"]);
```

- [ ] **Step 4.3 — Ajouter parseSections() dans app.js**

Ajouter après le commentaire `/* Yi-King Tirage variables */` (après la ligne `let yiking = ...`) :

```js
/**
 * Parse markdown text into an array of heading-delimited sections.
 * Each section: { level: 1|2|3, h3Index: null|1..7, markdown: string }
 * h3Index counts h3 headings sequentially (1 = first h3 = bottom trait).
 */
function parseSections(mdText) {
    const lines = mdText.split('\n');
    const sections = [];
    let current = null;
    let h3Count = 0;

    for (const line of lines) {
        const match = line.match(/^(#{1,3}) /);
        if (match) {
            if (current) sections.push(current);
            const level = match[1].length;
            const h3Index = level === 3 ? ++h3Count : null;
            current = { level, h3Index, markdown: line + '\n' };
        } else if (current) {
            current.markdown += line + '\n';
        }
    }
    if (current) sections.push(current);
    return sections;
}
```

- [ ] **Step 4.4 — Ajouter buildOracleHTML() dans app.js**

Ajouter immédiatement après `parseSections()` :

```js
/**
 * Fetch and assemble oracle HTML from markdown files.
 * Includes h1/h2 of hex1, mutated h3s, then h1/h2 of hex2 if mutation.
 */
async function buildOracleHTML() {
    const hasMutation = yiking.split('').some(c => c === '6' || c === '9');
    const allMutant = yiking.split('').every(c => c === '6' || c === '9');

    async function fetchSections(hexBinary) {
        const text = HEXAGRAMS_TEXTS[lang][hexBinary];
        const num = String(parseInt(text)).padStart(2, '0');
        const res = await fetch('assets/data/book/' + lang + '/' + num + '.md');
        const md = await res.text();
        return parseSections(md);
    }

    let html = '';

    const sections1 = await fetchSections(hexagram1);

    // h1 and h2 from hexagram 1
    for (const s of sections1.filter(s => s.level === 1 || s.level === 2)) {
        html += marked.parse(s.markdown);
    }

    if (hasMutation) {
        // h3s at mutated positions (h3Index 1–6), plus h3Index 7 if all mutant
        for (const s of sections1.filter(s => s.level === 3)) {
            if (s.h3Index <= 6) {
                if (yiking[s.h3Index - 1] === '6' || yiking[s.h3Index - 1] === '9') {
                    html += marked.parse(s.markdown);
                }
            } else if (s.h3Index === 7 && allMutant) {
                html += marked.parse(s.markdown);
            }
        }

        // h1 and h2 from hexagram 2
        const sections2 = await fetchSections(hexagram2);
        for (const s of sections2.filter(s => s.level === 1 || s.level === 2)) {
            html += marked.parse(s.markdown);
        }
    }

    return html;
}
```

- [ ] **Step 4.5 — Vérifier absence d'erreurs syntaxiques**

Ouvrir l'app dans le navigateur. Aucune erreur dans la console. La page doit s'afficher normalement.

---

## Task 5: Intégration dans AddBar, btBack, SwitchLang

**Files:**
- Modify: `assets/app/app.js`

- [ ] **Step 5.1 — Appeler buildOracleHTML() dans AddBar()**

Dans la fonction `AddBar()`, localiser le bloc `if (yiking.length === 6)`. Juste avant la ligne `swiper.update();`, ajouter :

```js
buildOracleHTML().then(html => {
    $("#oracle-content").html(html);
});
```

Le bloc complet doit ressembler à :

```js
if (yiking.length === 6){
    $("#coins").hide();
    
    hexagram1 = yiking.replace(/6/g, "0")
        .replace(/7/g,"1")
        .replace(/8/g, "0")
        .replace(/9/g, "1");
    hexagram2 = yiking.replace(/6/g, "1")
        .replace(/7/g, "1")
        .replace(/8/g, "0")
        .replace(/9/g, "0");

    // images
    $("#result1 .img-bottom").css("background-image", "url('assets/images/"+hexagram1.substring(0,3)+".jpg'");
    $("#result1 .img-top").css("background-image", "url('assets/images/"+hexagram1.substring(3)+".jpg'");
    $("#result2 .img-bottom").css("background-image", "url('assets/images/"+hexagram2.substring(0,3)+".jpg'");
    $("#result2 .img-top").css("background-image", "url('assets/images/"+hexagram2.substring(3)+".jpg'");
    
    UpdateHexagramsTexts();

    buildOracleHTML().then(html => {
        $("#oracle-content").html(html);
    });
    
    $("#result1").show();
    if (hexagram1 !== hexagram2){
        $("#result2").show();
    }
    $("#end").show();
    
    swiper.update();
    
    setTimeout(function(){
        swiper.slideTo(2, 1200);
    }, 500);
    PlaySound("yiking");
}
```

- [ ] **Step 5.2 — Vider le contenu oracle dans btBack**

Dans le handler `btBack.on("click", ...)`, ajouter la ligne suivante juste avant `PlaySound("back")` :

```js
$("#oracle-content").html("");
```

- [ ] **Step 5.3 — Recharger l'oracle dans SwitchLang()**

Dans `SwitchLang()`, dans le bloc `if(hexagram1 != null)`, ajouter l'appel oracle :

```js
if(hexagram1 != null){
    UpdateHexagramsTexts();
    buildOracleHTML().then(html => {
        $("#oracle-content").html(html);
    });
}
```

- [ ] **Step 5.4 — Test scénario sans mutation**

Faire un tirage avec 6 clics sur `YIN` (valeur 8 uniquement, pas de mutation).
- Les slides résultat 1 s'affichent ✓
- Le slide résultat 2 (MUTATION) ne s'affiche pas ✓
- Le slide oracle affiche : titre h1 + Le Jugement (h2) + L'Image (h2) de l'hexagramme 1 ✓
- Aucun h3 (trait) affiché ✓
- Aucun second hexagramme ✓

- [ ] **Step 5.5 — Test scénario avec mutations**

Faire un tirage avec au moins un clic sur `YIN MUT` (valeur 6) ou `YANG MUT` (valeur 9).
- Le slide résultat 2 (MUTATION) s'affiche ✓
- Le slide oracle affiche : h1+h2 hex1, puis les h3 aux positions mutantes (couleur rouge), puis h1+h2 hex2 ✓

- [ ] **Step 5.6 — Test toutes mutations (allMutant)**

Faire un tirage avec 6 clics sur `YANG MUT` (toutes les valeurs = 9).
- Le slide oracle affiche les 6 traits h3 + le bloc "Tous les traits" (7ème h3) ✓

- [ ] **Step 5.7 — Test changement de langue**

Faire un tirage, naviguer jusqu'au slide oracle en FR, puis basculer en EN (ou inversement).
- Le contenu oracle se recharge dans la nouvelle langue ✓

- [ ] **Step 5.8 — Test bouton retour**

Après un tirage avec oracle visible, cliquer sur le bouton retour.
- Retour au slide des pièces ✓
- Faire un nouveau tirage : l'oracle affiche le nouveau contenu (pas l'ancien) ✓

---

## Task 6: Vérification finale + régénération sw.js

**Files:**
- Modify: `sw.js` (généré)

- [ ] **Step 6.1 — Vérifier que marked.min.js sera précaché**

Le fichier `workbox-config.js` inclut `**/*.js` dans ses glob patterns. Le fichier `assets/libs/marked/marked.min.js` sera donc automatiquement précaché par Workbox.

- [ ] **Step 6.2 — Régénérer le service worker**

```bash
npm run pwa
```

Vérifier que `sw.js` a été régénéré (date de modification récente) et que `marked.min.js` apparaît dans la liste des fichiers précachés dans `sw.js`.

- [ ] **Step 6.3 — Test offline**

Dans les DevTools du navigateur (Application → Service Workers), activer le mode offline. Recharger la page. Faire un tirage complet et naviguer jusqu'à l'oracle. Le contenu doit s'afficher sans erreur réseau (tout est précaché).

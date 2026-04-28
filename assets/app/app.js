/*
 * Yi Jing Xiang — v2
 */

// ── State ──
let currentScreen = 0;
let yiking = '';
let hexagram1, hexagram2;
let resultStep = 0;
let hasMutation = false;
let lang  = localStorage.getItem('YiJingXiang_lang')  ?? 'en';
let sound = localStorage.getItem('YiJingXiang_sound') ?? '1';
let theme = localStorage.getItem('YiJingXiang_theme') ?? 'dark';

const SCREENS = ['s-home', 's-inst', 's-cast', 's-result', 's-oracle'];

// ── Screen manager ──
function goTo(idx) {
  if (idx === currentScreen) return;
  const prev = document.getElementById(SCREENS[currentScreen]);
  const next = document.getElementById(SCREENS[idx]);
  prev.classList.remove('active');
  prev.classList.add('leaving');
  setTimeout(() => prev.classList.remove('leaving'), 400);
  next.classList.add('active');
  currentScreen = idx;
  document.getElementById('bt-home').classList.toggle('hidden', idx === 0);
}

function goHome() {
  initCasting();
  goTo(0);
}

// ── Theme ──
function applyTheme() {
  const isLight = theme === 'light';
  document.documentElement.classList.toggle('light', isLight);
  document.body.classList.toggle('light', isLight);
  document.getElementById('bt-theme').textContent = isLight ? '☀' : '☾';
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('YiJingXiang_theme', theme);
  applyTheme();
}

// ── Sound ──
function applySound() {
  document.getElementById('bt-sound').classList.toggle('active', sound === '1');
}

function toggleSound() {
  sound = sound === '0' ? '1' : '0';
  localStorage.setItem('YiJingXiang_sound', sound);
  applySound();
}

function PlaySound(src) {
  if (sound !== '1') return;
  const audio = document.createElement('audio');
  audio.src = 'assets/sounds/' + src + '.mp3';
  audio.play().catch(() => {});
}

// ── Localization ──
function SwitchLang(_lang) {
  lang = _lang;
  localStorage.setItem('YiJingXiang_lang', lang);

  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('bt-lang-' + lang).classList.add('active');

  document.getElementById('baseline').innerHTML       = UI_TEXTS[lang]['baseline'];
  document.getElementById('bt-start').textContent     = UI_TEXTS[lang]['bt-start'];
  document.getElementById('consigne-1').innerHTML     = UI_TEXTS[lang]['consigne-1'];
  document.getElementById('inst-coins-label').textContent = UI_TEXTS[lang]['inst-coins-label'];
  document.getElementById('inst-note').textContent    = UI_TEXTS[lang]['inst-note'];
  document.getElementById('bt-inst-back').textContent = UI_TEXTS[lang]['bt-inst-back'];
  document.getElementById('bt-inst-start').textContent = UI_TEXTS[lang]['bt-inst-start'];
  document.getElementById('bt-reset').textContent     = UI_TEXTS[lang]['bt-reset'];
  document.getElementById('bt-new-cast-result').textContent = UI_TEXTS[lang]['bt-new-cast'];
  document.getElementById('bt-oracle-back').textContent = UI_TEXTS[lang]['bt-oracle-back'];
  document.getElementById('bt-new-cast-oracle').textContent = UI_TEXTS[lang]['bt-new-cast'];
  document.getElementById('modal-title').textContent  = UI_TEXTS[lang]['modal-title'];
  document.getElementById('modal-body').innerHTML     = UI_TEXTS[lang]['info'];
  document.getElementById('bt-modal-close').textContent = UI_TEXTS[lang]['bt-close'];

  renderInstCoins();
  renderCoinBtns();
  updateCastUI();

  if (hexagram1 != null) {
    updateResultTitle();
    buildOracleHTML().then(html => {
      document.getElementById('oracle-content').innerHTML = html;
    }).catch(err => console.error('Oracle load failed:', err));
  }
}

// ── Instruction coin grid ──
function renderInstCoins() {
  const f = UI_TEXTS[lang]['coin-face'];
  const p = UI_TEXTS[lang]['coin-pile'];

  const coins = [
    {
      clusters: [f, f, p],
      line: `<div class="bar-full"></div>`,
      label: UI_TEXTS[lang]['coin-yang']
    },
    {
      clusters: [p, p, f],
      line: `<div class="bar-half"></div><div class="bar-gap"></div><div class="bar-half"></div>`,
      label: UI_TEXTS[lang]['coin-yin']
    },
    {
      clusters: [f, f, f],
      line: `<div class="bar-full" style="position:relative"><div class="bar-dot"></div></div>`,
      label: UI_TEXTS[lang]['coin-yang-mut']
    },
    {
      clusters: [p, p, p],
      line: `<div class="bar-half" style="position:relative"><div class="bar-dot"></div></div><div class="bar-gap"></div><div class="bar-half"></div>`,
      label: UI_TEXTS[lang]['coin-yin-mut']
    }
  ];

  document.getElementById('inst-coins').innerHTML = coins.map(c => {
    const cls = (l) => l === f ? 'cc-face' : 'cc-pile';
    return `<div class="coin-card">
      <div class="coin-cluster-tri">
        <div class="cc ${cls(c.clusters[0])}">${c.clusters[0]}</div>
        <div class="cc ${cls(c.clusters[1])}">${c.clusters[1]}</div>
        <div class="cc ${cls(c.clusters[2])}">${c.clusters[2]}</div>
      </div>
      <div class="coin-line-demo">${c.line}</div>
      <div class="coin-label">${c.label}</div>
    </div>`;
  }).join('');
}

// ── Casting coin buttons ──
function renderCoinBtns() {
  const f = UI_TEXTS[lang]['coin-face'];
  const p = UI_TEXTS[lang]['coin-pile'];

  const btns = [
    {
      type: 'yin-mut',
      coins: [p, p, p],
      line: `<div class="mini-bar" style="position:relative"><div class="mini-dot"></div></div><div class="mini-gap"></div><div class="mini-bar"></div>`,
      label: UI_TEXTS[lang]['coin-yin-mut']
    },
    {
      type: 'yang',
      coins: [f, f, p],
      line: `<div class="mini-bar"></div>`,
      label: UI_TEXTS[lang]['coin-yang']
    },
    {
      type: 'yin',
      coins: [p, p, f],
      line: `<div class="mini-bar"></div><div class="mini-gap"></div><div class="mini-bar"></div>`,
      label: UI_TEXTS[lang]['coin-yin']
    },
    {
      type: 'yang-mut',
      coins: [f, f, f],
      line: `<div class="mini-bar" style="position:relative"><div class="mini-dot"></div></div>`,
      label: UI_TEXTS[lang]['coin-yang-mut']
    }
  ];

  document.getElementById('coin-btns').innerHTML = btns.map(b => {
    const cls = (l) => l === f ? 'mc-face' : 'mc-pile';
    return `<button class="coin-btn" onclick="AddBar('${b.type}')">
      <div class="mini-coins">
        <div class="mc ${cls(b.coins[0])}">${b.coins[0]}</div>
        <div class="mc ${cls(b.coins[1])}">${b.coins[1]}</div>
        <div class="mc ${cls(b.coins[2])}">${b.coins[2]}</div>
      </div>
      <div class="mini-line">${b.line}</div>
      <div class="coin-btn-label">${b.label}</div>
    </button>`;
  }).join('');
}

// ── Casting ──
function initCasting() {
  yiking    = '';
  hexagram1 = undefined;
  hexagram2 = undefined;
  resultStep = 0;
  hasMutation = false;
  document.getElementById('oracle-content').innerHTML = '';
  renderHexArea();
  updateCastUI();
}

function lineTypeFromChar(c) {
  return { '6': 'yin-mut', '7': 'yang', '8': 'yin', '9': 'yang-mut' }[c] ?? null;
}

function AddBar(type) {
  if (yiking.length >= 6) return;

  yiking += { 'yin-mut': '6', 'yang': '7', 'yin': '8', 'yang-mut': '9' }[type];

  renderHexArea();
  updateCastUI();

  if (yiking.length === 6) {
    hexagram1 = yiking.replace(/6/g,'0').replace(/7/g,'1').replace(/8/g,'0').replace(/9/g,'1');
    hexagram2 = yiking.replace(/6/g,'1').replace(/7/g,'1').replace(/8/g,'0').replace(/9/g,'0');
    hasMutation = /[69]/.test(yiking);

    PlaySound('yiking');

    buildOracleHTML().then(html => {
      document.getElementById('oracle-content').innerHTML = html;
    }).catch(err => console.error('Oracle load failed:', err));

    setTimeout(() => {
      resultStep = 0;
      showResultStep();
      goTo(3);
    }, 600);
  } else {
    PlaySound('coin' + Math.ceil(Math.random() * 2));
  }
}

function renderHexArea() {
  const area = document.getElementById('hex-area');
  area.innerHTML = '';

  for (let i = 5; i >= 0; i--) {
    if (i === 2) {
      const div = document.createElement('div');
      div.className = 'hex-divider';
      area.appendChild(div);
    }

    const slot = document.createElement('div');
    const filled = i < yiking.length;
    slot.className = 'hex-line-slot' + (filled ? ' filled' : '');

    if (filled) {
      slot.innerHTML = buildLineHTML(lineTypeFromChar(yiking[i]), true);
    } else {
      slot.innerHTML = `<div style="flex:1;height:var(--line-h);background:var(--bg3);border-radius:5px;"></div>`;
    }
    area.appendChild(slot);
  }
}

function buildLineHTML(type, animate) {
  const cls = animate ? ' class="line-anim"' : '';
  const g = 'var(--gold)';
  const r = 'border-radius:5px;';
  const bar = (extra = '') =>
    `<div style="flex:1;height:var(--line-h);background:${g};${r}${extra}"${cls}>`;
  const dot = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid ${g};"></div>`;
  const gap = `<div style="width:20px;flex-shrink:0;"></div>`;

  if (type === 'yang')     return `${bar()}</div>`;
  if (type === 'yang-mut') return `${bar('position:relative;')}${dot}</div>`;
  if (type === 'yin')      return `${bar()}</div>${gap}${bar()}</div>`;
  if (type === 'yin-mut')  return `${bar('position:relative;')}${dot}</div>${gap}${bar()}</div>`;
  return '';
}

function updateCastUI() {
  const n = yiking.length;
  const lbl = document.getElementById('cast-label');
  lbl.textContent = n < 6
    ? UI_TEXTS[lang]['cast-label'].replace('{n}', n + 1)
    : UI_TEXTS[lang]['cast-complete'];

  const dotsEl = document.getElementById('cast-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div');
    d.className = 'cast-dot' + (i < n ? ' done' : i === n ? ' current' : '');
    dotsEl.appendChild(d);
  }
}

// ── Result ──
function updateResultTitle() {
  const hex = resultStep === 0 ? hexagram1 : hexagram2;
  document.getElementById('result-zh').textContent =
    (HEXAGRAMS_TEXTS[lang][hex] ?? '').split('/')[0].trim();

  let numText = '';
  if (hasMutation) {
    numText = resultStep === 0
      ? UI_TEXTS[lang]['hex1-label']
      : UI_TEXTS[lang]['hex2-label'];
  }
  document.getElementById('result-num').textContent = numText;
}

function showResultStep() {
  const hex = resultStep === 0 ? hexagram1 : hexagram2;

  const card = document.getElementById('result-card');
  card.style.opacity = '0';
  card.style.transform = 'scale(.96)';

  setTimeout(() => {
    document.getElementById('rc-upper-img').src = 'assets/images/' + hex.substring(3) + '.jpg';
    document.getElementById('rc-lower-img').src = 'assets/images/' + hex.substring(0, 3) + '.jpg';

    buildCardOverlay(hex);
    updateResultTitle();

    const prev = document.getElementById('arr-prev');
    const next = document.getElementById('arr-next');

    prev.classList.toggle('disabled', resultStep === 0);
    prev.onclick = resultStep === 0 ? null : () => { resultStep = 0; showResultStep(); };

    if (!hasMutation || resultStep === 1) {
      next.onclick = () => goTo(4);
    } else {
      next.onclick = () => { resultStep = 1; showResultStep(); };
    }

    card.onclick = next.onclick;

    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
  }, 200);
}

function buildCardOverlay(hexBinary) {
  const overlay = document.getElementById('card-overlay');
  overlay.innerHTML = '';
  for (let i = 5; i >= 0; i--) {
    const isYang = hexBinary[i] === '1';
    const row = document.createElement('div');
    row.className = 'card-hex-line';
    if (isYang) {
      row.innerHTML = `<div style="flex:1;height:10px;background:rgba(255,255,255,.75);border-radius:5px;"></div>`;
    } else {
      row.innerHTML = `<div style="flex:1;height:10px;background:rgba(255,255,255,.75);border-radius:5px;"></div>
                       <div style="width:12px;"></div>
                       <div style="flex:1;height:10px;background:rgba(255,255,255,.75);border-radius:5px;"></div>`;
    }
    overlay.appendChild(row);
  }
}

// ── Oracle (logique inchangée) ──
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

async function buildOracleHTML() {
  const allMutant = yiking.split('').every(c => c === '6' || c === '9');

  async function fetchSections(hexBinary) {
    const text = HEXAGRAMS_TEXTS[lang][hexBinary];
    const num  = text.split('.')[0].trim().padStart(2, '0');
    const res  = await fetch('assets/data/book/' + lang + '/' + num + '.md');
    if (!res.ok) throw new Error('Failed: ' + res.url);
    return parseSections(await res.text());
  }

  let html = '';
  const sections1 = await fetchSections(hexagram1);

  for (const s of sections1.filter(s => s.level === 1 || s.level === 2)) {
    html += marked.parse(s.markdown);
  }

  if (hasMutation) {
    for (const s of sections1.filter(s => s.level === 3)) {
      if (s.h3Index <= 6) {
        if (yiking[s.h3Index - 1] === '6' || yiking[s.h3Index - 1] === '9') {
          html += marked.parse(s.markdown);
        }
      } else if (s.h3Index === 7 && allMutant) {
        html += marked.parse(s.markdown);
      }
    }
    html += '<hr>';
    const sections2 = await fetchSections(hexagram2);
    for (const s of sections2.filter(s => s.level === 1 || s.level === 2)) {
      html += marked.parse(s.markdown);
    }
  }

  return html;
}

// ── Modal ──
function openInfo() {
  document.getElementById('modal-info').classList.add('open');
}
function closeInfo() {
  document.getElementById('modal-info').classList.remove('open');
}

// ── Init ──
function init() {
  applyTheme();
  applySound();

  document.getElementById('bt-home').addEventListener('click', () => { PlaySound('back'); goHome(); });
  document.getElementById('bt-sound').addEventListener('click', toggleSound);
  document.getElementById('bt-theme').addEventListener('click', () => { PlaySound('click'); toggleTheme(); });
  document.getElementById('bt-info').addEventListener('click', () => { PlaySound('click'); openInfo(); });
  document.getElementById('bt-lang-en').addEventListener('click', () => { PlaySound('click'); SwitchLang('en'); });
  document.getElementById('bt-lang-fr').addEventListener('click', () => { PlaySound('click'); SwitchLang('fr'); });

  document.getElementById('bt-start').addEventListener('click', () => { PlaySound('click'); goTo(1); });
  document.getElementById('bt-inst-back').addEventListener('click', () => { PlaySound('click'); goTo(0); });
  document.getElementById('bt-inst-start').addEventListener('click', () => {
    PlaySound('click');
    initCasting();
    goTo(2);
  });

  document.getElementById('bt-reset').addEventListener('click', () => { PlaySound('back'); initCasting(); });
  document.getElementById('bt-new-cast-result').addEventListener('click', () => {
    PlaySound('back');
    initCasting();
    goTo(2);
  });
  document.getElementById('bt-new-cast-oracle').addEventListener('click', () => {
    PlaySound('back');
    initCasting();
    goTo(2);
  });
  document.getElementById('bt-oracle-back').addEventListener('click', () => goTo(3));

  document.getElementById('bt-modal-close').addEventListener('click', () => { PlaySound('click'); closeInfo(); });
  document.getElementById('modal-info').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-info')) closeInfo();
  });

  SwitchLang(lang);
  initCasting();
}

document.addEventListener('DOMContentLoaded', init);

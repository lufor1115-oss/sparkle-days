/* =============================================================
   반짝이의 크리스마스 선물 — 앱 본체
   - 이름·생일·사진·목소리는 태블릿(IndexedDB)에만 저장됩니다.
   - 이 코드에는 개인 정보가 들어 있지 않습니다.
   ============================================================= */
'use strict';
const VERSION = 'v1.0.0';
const QS = new URLSearchParams(location.search);
const SPEED = Math.max(0.1, +QS.get('speed') || 1);   // 검사용 배속

/* ---------------- 장소 좌표 (새 여행지 폴더가 생겨도 자동 표시) ---------------- */
const PLACES = {
  // 국내
  '대구':[128.601,35.871],'부산':[129.118,35.153],'경주':[129.219,35.835],'안동':[128.518,36.539],'전주':[127.153,35.815],
  '서울':[126.978,37.566],'인천':[126.705,37.456],'수원':[127.028,37.263],'가평':[127.510,37.831],'춘천':[127.730,37.881],
  '강릉':[128.876,37.752],'속초':[128.592,38.207],'평창':[128.390,37.370],'양양':[128.619,38.075],'단양':[128.365,36.985],
  '대전':[127.385,36.350],'세종':[127.289,36.480],'청주':[127.489,36.642],'공주':[127.119,36.446],'부여':[126.910,36.276],
  '태안':[126.298,36.746],'보령':[126.613,36.333],'광주':[126.853,35.160],'담양':[126.988,35.321],'여수':[127.662,34.760],
  '순천':[127.487,34.951],'목포':[126.392,34.812],'남원':[127.390,35.416],'군산':[126.737,35.968],'포항':[129.343,36.019],
  '영덕':[129.365,36.415],'울진':[129.400,36.993],'울산':[129.311,35.538],'통영':[128.433,34.854],'거제':[128.621,34.881],
  '남해':[127.892,34.838],'창원':[128.681,35.228],'진주':[128.108,35.180],'김해':[128.889,35.229],'밀양':[128.746,35.504],
  '청도':[128.734,35.647],'영천':[128.938,35.973],'문경':[128.187,36.586],'상주':[128.159,36.411],'봉화':[128.733,36.893],
  '울릉도':[130.905,37.484],'독도':[131.866,37.241],'제주':[126.531,33.500],'서귀포':[126.560,33.254],
  // 해외
  '나트랑':[109.197,12.239],'나짱':[109.197,12.239],'다낭':[108.202,16.054],'호이안':[108.335,15.880],'하노이':[105.834,21.028],
  '호치민':[106.660,10.762],'푸꾸옥':[103.967,10.289],'방콕':[100.502,13.756],'푸켓':[98.339,7.880],'치앙마이':[98.993,18.788],
  '세부':[123.885,10.316],'보라카이':[121.925,11.967],'괌':[144.794,13.444],'사이판':[145.751,15.178],'오사카':[135.502,34.694],
  '교토':[135.768,35.012],'도쿄':[139.650,35.676],'후쿠오카':[130.402,33.590],'삿포로':[141.354,43.062],'오키나와':[127.681,26.212],
  '타이베이':[121.565,25.033],'홍콩':[114.169,22.319],'마카오':[113.544,22.199],'상하이':[121.474,31.230],'베이징':[116.407,39.904],
  '싱가포르':[103.820,1.352],'발리':[115.092,-8.341],'코타키나발루':[116.074,5.980],'하와이':[-157.858,21.307],
  '시드니':[151.209,-33.869],'파리':[2.352,48.857],'런던':[-0.128,51.507],'로마':[12.496,41.903],'뉴욕':[-74.006,40.713]
};
const HOME = '대구';
/* 그림이 준비된 여행지 */
const TRIP_ART = {'부산':'busan','경주':'gyeongju','안동':'andong','전주':'jeonju','나트랑':'nhatrang','나짱':'nhatrang'};

/* ---------------- 대사 (목소리 파일 이름 = 대사 번호) ---------------- */
const L = {
  p01:'안녕 {이름}아! 반가워~',
  p02:'나는 눈꽃 요정 반짝이야. 크리스마스가 다가오면 착한 아이를 찾아온단다.',
  p03:'곧 크리스마스인데… {이름}이는 착하게 지내고 있지?',
  p04:'내가 {이름}이를 보고 있은 지 벌써…',
  p05:'와~ 벌써 이렇게 됐네? 꺄르륵!',
  p06:'우리 함께 {이름}이가 어릴 때 어떻게 지냈는지 같이 볼까?',
  c1:'이때 {이름}이는 정말 꼬마였지!',
  c2:'조금 더 자랐네? 키도 쑥쑥!',
  c3:'그리고 지금의 {이름}이!',
  cN:'이때도 정말 멋졌어!',
  g01:'사진 속 어딘가에 선물이 숨어 있어! 찾으면 눌러 봐!',
  r01:'우와, 이 표정 좀 봐!', r02:'여기 기억나?', r03:'정말 귀엽다~', r04:'이때 진짜 재밌었지?', r05:'꺄르륵, 너무 좋다!',
  t01:'이번엔 우리 여행을 간 추억들을 떠올려볼까?',
  t02:'우리 집은 여기! 자, 출발~',
  t03:'이번엔 바다 건너 더 멀리 가 볼까?',
  place:'{장소}! 여기도 갔었지?',
  newp:'이번에는 {장소}에 다녀왔구나?',
  e01:'{이름}이랑 함께한 시간을 돌아보니 정말 행복하다!',
  e02:'크리스마스 요정은 착한 아이를 스스로 찾아온단다.',
  e03:'나는 {이름}이가 엄마 아빠랑 함께 있을 때만 나타날 수 있어.',
  e04:'다음에 또 보고 싶으면 엄마 아빠한테 살짝 말해 줘. 그럼 내가 또 올게!',
  e05:'메리 크리스마스, {이름}아!'
};
const RANDOM_LINES = ['r01','r02','r03','r04','r05'];

/* =============================================================
   기본 도구
   ============================================================= */
const $ = id => document.getElementById(id);
const VW = () => innerWidth / 100, VH = () => innerHeight / 100;
const sleep = ms => new Promise(r => setTimeout(r, ms / SPEED));
const rand = (a, b) => a + Math.random() * (b - a);
function el(tag, cls, parent) { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
function josa(word, a, b) { // 받침 여부로 조사 선택 (아/야 등)
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xAC00 || c > 0xD7A3) return word + b;
  return word + (((c - 0xAC00) % 28) ? a : b);
}
function fillText(t, vars = {}) {
  const n = S.settings ? S.settings.name : '';
  return t.replace(/\{이름\}아/g, josa(n, '아', '야'))
          .replace(/\{이름\}이/g, josa(n, '이', ''))
          .replace(/\{이름\}/g, n)
          .replace(/\{장소\}/g, vars.place || '');
}

/* =============================================================
   상태
   ============================================================= */
const S = {
  settings: null,   // {name, birth}
  lib: null,        // 불러온 사진 목록
  auto: true, sound: true,
  running: false, giftsFound: 0, giftsTotal: 0,
  urlCache: new Map()
};

/* =============================================================
   저장소 (IndexedDB) — 태블릿 안에만 저장
   ============================================================= */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('sparkle-days', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kv'); d.createObjectStore('blobs'); };
      r.onsuccess = () => { DB.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = DB.db.transaction(store, mode); const s = t.objectStore(store);
      const out = fn(s); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error);
    });
  },
  get: (store, key) => DB.tx(store, 'readonly', s => s.get(key)),
  put: (store, key, val) => DB.tx(store, 'readwrite', s => s.put(val, key)),
  clear: store => DB.tx(store, 'readwrite', s => s.clear())
};
async function blobUrl(key) {
  if (!key) return null;
  if (S.urlCache.has(key)) return S.urlCache.get(key);
  const b = await DB.get('blobs', key); if (!b) return null;
  const u = URL.createObjectURL(b); S.urlCache.set(key, u); return u;
}

/* =============================================================
   사진 압축 파일 불러오기
   ============================================================= */
const IMG_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i, AUD_EXT = /\.(mp3|m4a|aac|ogg|wav)$/i;
const ROOTS = s => /^\d+/.test(s) || ['표정', '여행', '목소리', '소리'].includes(s);
function decodeName(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(u8); }
  catch (e) { return new TextDecoder('euc-kr').decode(u8); }
}
async function shrinkImage(blob) {
  const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const max = 1600, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * sc), h = Math.round(bmp.height * sc);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(bmp, 0, 0, w, h); bmp.close && bmp.close();
  return await new Promise(r => c.toBlob(r, 'image/jpeg', 0.86));
}
async function readZipEntries(file) {
  const zip = await JSZip.loadAsync(file, { decodeFileName: decodeName });
  let entries = [];
  zip.forEach((path, e) => {
    if (e.dir) return;
    const parts = path.split('/').filter(Boolean);
    if (parts.some(p => p === '__MACOSX' || p.startsWith('.'))) return;
    entries.push({ parts, e });
  });
  // 맨 위 폴더(예: 하윤앱사진/) 벗기기
  for (let k = 0; k < 2; k++) {
    if (entries.length && entries.every(x => x.parts.length > 1 && !ROOTS(x.parts[0]) && x.parts[0] === entries[0].parts[0]))
      entries.forEach(x => x.parts.shift());
  }
  entries.sort((a, b) => a.parts.join('/').localeCompare(b.parts.join('/'), 'ko', { numeric: true }));
  return entries;
}
/** 압축 파일 여러 개를 한 번에 불러옵니다 (용량이 크면 나눠서 압축 가능) */
async function importZip(files, onProg) {
  files = [...files];
  const prev = await DB.get('kv', 'lib');
  const prevKeys = new Set(prev && prev.albumKeys || []);
  await DB.clear('blobs'); S.urlCache.forEach(u => URL.revokeObjectURL(u)); S.urlCache.clear();
  const lib = { chapters: [], expressions: {}, places: [], voices: {}, sounds: {}, albumKeys: [], photos: 0, skipped: [], importedAt: Date.now() };
  const chMap = new Map(), plMap = new Map();
  let n = 0;
  for (let fi = 0; fi < files.length; fi++) {
    let entries = await readZipEntries(files[fi]);
    const memos = new Map();
    for (const x of entries) if (/^memo\.txt$|^메모\.txt$/i.test(x.parts[x.parts.length - 1])) {
      memos.set(x.parts.slice(0, -1).join('/'), (await x.e.async('string')).trim().split(/\r?\n/)[0]);
    }
    let i = 0;
    for (const x of entries) {
      i++; onProg && onProg(i, entries.length, fi + 1, files.length);
      const f = x.parts[x.parts.length - 1], dir = x.parts.slice(0, -1), base = f.replace(/\.[^.]+$/, '');
      try {
        if (AUD_EXT.test(f)) {
          const key = 'au:' + dir.join('/') + '/' + f;
          await DB.put('blobs', key, await x.e.async('blob').then(b => new Blob([b], { type: mimeOf(f) })));
          if (dir[0] === '목소리') lib.voices[base] = key;
          else if (dir[0] === '소리') lib.sounds[soundKind(base)] = key;
          continue;
        }
        if (!IMG_EXT.test(f)) { if (!/\.txt$/i.test(f)) lib.skipped.push(x.parts.join('/')); continue; }
        const top = dir[0];
        let target = null;
        if (top === '표정') { target = { kind: 'expr', name: base }; }
        else if (top === '여행' && dir.length >= 3) {
          const region = dir[1].includes('해외') ? '해외' : '국내', place = dir[2].trim(), year = (dir[3] || '').replace(/[^0-9]/g, '');
          target = { kind: 'trip', region, place, year, dirKey: dir.join('/') };
        } else if (top && /^\d+/.test(top) && dir.length >= 1) {
          const m = top.match(/^(\d+)[\s._-]*(.*)$/);
          target = { kind: 'chapter', order: +m[1], title: (m[2] || '').replace(/[_]+/g, ' ').trim(), dirKey: top };
        }
        if (!target) { lib.skipped.push(x.parts.join('/')); continue; }
        const raw = await x.e.async('blob');
        const small = await shrinkImage(raw);
        const key = 'ph:' + (n++);
        await DB.put('blobs', key, small);
        if (target.kind === 'expr') lib.expressions[target.name] = key;
        else if (target.kind === 'chapter') {
          if (!chMap.has(target.order)) chMap.set(target.order, { order: target.order, title: target.title, memo: '', photos: [] });
          const c = chMap.get(target.order); c.photos.push(key); if (!c.memo && memos.get(target.dirKey)) c.memo = memos.get(target.dirKey);
        } else {
          const pk = target.region + '|' + target.place;
          if (!plMap.has(pk)) plMap.set(pk, { region: target.region, name: target.place, albums: new Map() });
          const p = plMap.get(pk);
          if (!p.albums.has(target.year)) p.albums.set(target.year, { year: target.year, memo: '', photos: [] });
          const a = p.albums.get(target.year); a.photos.push(key); if (!a.memo && memos.get(target.dirKey)) a.memo = memos.get(target.dirKey);
        }
        lib.photos++;
      } catch (err) { console.warn('skip', x.parts.join('/'), err); lib.skipped.push(x.parts.join('/')); }
    }
    entries = null;
  }
  lib.chapters = [...chMap.values()].sort((a, b) => a.order - b.order);
  for (const p of plMap.values()) {
    const albums = [...p.albums.values()].sort((a, b) => (a.year || '0').localeCompare(b.year || '0'));
    albums.forEach(a => { const k = p.region + '|' + p.name + '|' + a.year; a.isNew = prevKeys.size > 0 && !prevKeys.has(k); lib.albumKeys.push(k); });
    lib.places.push({ region: p.region, name: p.name, albums, first: albums[0] ? albums[0].year : '' });
  }
  lib.places.sort((a, b) => (a.first || '9').localeCompare(b.first || '9'));
  await DB.put('kv', 'lib', lib);
  return lib;
}
function mimeOf(f) { const e = f.split('.').pop().toLowerCase(); return { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', wav: 'audio/wav' }[e] || 'audio/mpeg'; }
function soundKind(base) {
  const b = base.toLowerCase();
  if (/bgm|music|배경/.test(b)) return 'bgm';
  if (/whoosh|fly|날/.test(b)) return 'whoosh';
  if (/page|넘김/.test(b)) return 'page';
  if (/pop|뽁|선물/.test(b)) return 'pop';
  if (/sparkle|chime|magic|반짝/.test(b)) return 'sparkle';
  return b;
}

/* =============================================================
   소리
   ============================================================= */
const Sound = {
  ctx: null, bgm: null, voice: null,
  unlock() {
    try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume(); } catch (e) {}
  },
  async startBgm() {
    try {
      if (this.bgm || !S.lib || !S.lib.sounds.bgm) return;
      const u = await blobUrl(S.lib.sounds.bgm); if (!u) return;
      this.bgm = new Audio(u); this.bgm.loop = true; this.bgm.volume = S.sound ? 0.32 : 0;
      await this.bgm.play();
    } catch (e) {}
  },
  duck(on) { if (this.bgm) gsap.to(this.bgm, { volume: !S.sound ? 0 : on ? 0.12 : 0.32, duration: 0.5 }); },
  setMute(m) { if (this.bgm) this.bgm.volume = m ? 0 : 0.32; if (m) this.stopVoice(); },
  async sfx(kind) {
    if (!S.sound) return;
    try {
      const key = S.lib && S.lib.sounds[kind];
      if (key) { const a = new Audio(await blobUrl(key)); a.volume = 0.6; a.play().catch(() => {}); return; }
      this.synth(kind);
    } catch (e) {}
  },
  synth(kind) { // 파일이 없을 때 쓰는 부드러운 합성음
    const c = this.ctx; if (!c) return; const t = c.currentTime;
    const tone = (f, at, dur, vol, type = 'sine') => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(vol, t + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); o.connect(g).connect(c.destination); o.start(t + at); o.stop(t + at + dur + 0.05);
    };
    if (kind === 'sparkle') [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, i * 0.07, 0.6, 0.06));
    else if (kind === 'pop') { tone(880, 0, 0.15, 0.12, 'triangle'); tone(1320, 0.06, 0.25, 0.08); }
    else if (kind === 'page') tone(520, 0, 0.12, 0.04, 'triangle');
    else if (kind === 'whoosh') {
      const len = 0.6, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length);
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2400, t + len);
      g.gain.value = 0.12; s.connect(f).connect(g).connect(c.destination); s.start(t);
    }
  },
  async playVoice(id) { // 목소리 파일이 있으면 재생하고 끝날 때까지 기다림
    if (!S.sound || !S.lib || !S.lib.voices[id]) return false;
    try {
      const a = new Audio(await blobUrl(S.lib.voices[id])); this.voice = a; this.duck(true);
      await new Promise(res => { a.onended = res; a.onerror = res; a.onpause = res; a.play().catch(res); });
      return true;
    } catch (e) { return false; } finally { this.duck(false); this.voice = null; }
  },
  stopVoice() { try { if (this.voice) { this.voice.pause(); } } catch (e) {} }
};

/* =============================================================
   진행 제어 (자동 넘김 / 눌러서 넘김)
   ============================================================= */
let tapResolver = null;
function onScreenTap(e) {
  if (e.target.closest('button,input,label,.tappable,.panel')) return;
  if (tapResolver) { const r = tapResolver; tapResolver = null; r(); }
}
/** 자동이면 ms 뒤(또는 터치 시) 진행, 직접 모드면 터치할 때까지 대기 */
function beat(ms) {
  return new Promise(res => {
    let t = null;
    const done = () => { clearTimeout(t); $('tapHint').classList.remove('on'); tapResolver = null; res(); };
    tapResolver = done;
    if (S.auto) t = setTimeout(done, ms / SPEED);
    else $('tapHint').classList.add('on');
  });
}
/** 건너뛸 수 있는 연출 대기 (직접 모드에서도 시간이 지나면 진행) */
function pause(ms) {
  return new Promise(res => {
    const t = setTimeout(() => { tapResolver = null; res(); }, ms / SPEED);
    tapResolver = () => { clearTimeout(t); res(); };
  });
}

/* =============================================================
   배경
   ============================================================= */
let bgFlip = false, bgTween = null;
function setBg(name, shade = '') {
  const cur = bgFlip ? $('bgB') : $('bgA'), nxt = bgFlip ? $('bgA') : $('bgB'); bgFlip = !bgFlip;
  nxt.style.backgroundImage = name ? `url(assets/bg/${name}.jpg)` : 'none';
  if (bgTween) bgTween.kill();
  gsap.set(nxt, { scale: 1, x: 0 });
  bgTween = gsap.to(nxt, { scale: 1.07, x: rand(-12, 12), duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  nxt.classList.add('on'); cur.classList.remove('on');
  $('bgShade').className = shade;
}

/* =============================================================
   눈·반짝이 효과 (캔버스)
   ============================================================= */
const FX = {
  c: null, g: null, flakes: [], sparks: [], snow: 0,
  init() {
    this.c = $('fx'); this.g = this.c.getContext('2d'); this.resize(); addEventListener('resize', () => this.resize());
    for (let i = 0; i < 140; i++) this.flakes.push(this.newFlake(true));
    const loop = () => { this.draw(); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  },
  resize() { const d = Math.min(devicePixelRatio || 1, 2); this.c.width = innerWidth * d; this.c.height = innerHeight * d; this.c.style.width = '100%'; this.c.style.height = '100%'; this.g.setTransform(d, 0, 0, d, 0, 0); },
  newFlake(any) { return { x: rand(0, innerWidth), y: any ? rand(0, innerHeight) : -10, r: rand(1.2, 3.8), vy: rand(0.4, 1.3), ph: rand(0, 6.28), o: rand(0.4, 0.9) }; },
  burst(x, y, n = 26, hue = 48) {
    for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(1.5, 6); this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, life: 1, r: rand(2, 5), hue: hue + rand(-15, 15) }); }
  },
  trail(x, y) { this.sparks.push({ x: x + rand(-6, 6), y: y + rand(-6, 6), vx: rand(-.4, .4), vy: rand(.2, .9), life: .9, r: rand(1.5, 3.5), hue: rand(40, 60) }); },
  star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .35 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); },
  draw() {
    const g = this.g; g.clearRect(0, 0, innerWidth, innerHeight);
    const count = Math.floor(this.flakes.length * this.snow);
    g.fillStyle = '#fff';
    for (let i = 0; i < count; i++) {
      const f = this.flakes[i]; f.y += f.vy; f.ph += 0.01; f.x += Math.sin(f.ph) * 0.4;
      if (f.y > innerHeight + 10) Object.assign(f, this.newFlake(false));
      g.globalAlpha = f.o; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.vx *= 0.98; s.life -= 0.018;
      if (s.life <= 0) { this.sparks.splice(i, 1); continue; }
      g.globalAlpha = Math.max(0, s.life); g.fillStyle = `hsl(${s.hue},100%,${70 + s.life * 20}%)`; this.star(g, s.x, s.y, s.r * (0.6 + s.life));
    }
    g.globalAlpha = 1;
  }
};

/* =============================================================
   반짝이 (요정)
   ============================================================= */
const Elf = {
  pos: { fx: -0.3, fy: 0.5 }, pose: null, flip: 1, trailOn: false,
  size() { return 30 * VH(); },
  px(fx, fy) { return { x: fx * innerWidth, y: fy * innerHeight }; },
  setPose(p) {
    if (p === this.pose) return; this.pose = p;
    const a = $('elfImg'), b = $('elfImg2'); const on = a.classList.contains('on') ? a : b, off = on === a ? b : a;
    off.src = `assets/elf/${p}.webp`; off.classList.add('on'); on.classList.remove('on');
  },
  place(fx, fy) { this.pos = { fx, fy }; const p = this.px(fx, fy); gsap.set('#elfWrap', { x: p.x, y: p.y }); },
  async fly(fx, fy, { dur = 1.4, pose = 'fly', end = null, arc = 0.12 } = {}) {
    const from = this.px(this.pos.fx, this.pos.fy), to = this.px(fx, fy);
    this.setPose(pose); this.face(to.x < from.x ? -1 : 1);
    $('elfWrap').classList.remove('bob'); Sound.sfx('whoosh');
    const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - arc * innerHeight };
    this.trailOn = true;
    await new Promise(res => {
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: dur / SPEED, ease: 'power1.inOut', onUpdate: () => {
        const t = o.t, u = 1 - t;
        const x = u * u * from.x + 2 * u * t * mid.x + t * t * to.x, y = u * u * from.y + 2 * u * t * mid.y + t * t * to.y;
        gsap.set('#elfWrap', { x, y }); if (Math.random() < 0.7) FX.trail(x + this.size() * 0.45, y + this.size() * 0.6);
      }, onComplete: res });
    });
    this.trailOn = false; this.pos = { fx, fy }; this.face(1);
    $('elfWrap').classList.add('bob'); if (end) this.setPose(end);
  },
  face(d) { this.flip = d; gsap.set('#elfImg,#elfImg2', { scaleX: d }); },
  hide() { gsap.to('#elfWrap', { opacity: 0, duration: .4 }); },
  show() { gsap.to('#elfWrap', { opacity: 1, duration: .4 }); },
  center() { const s = this.size(); return { x: this.pos.fx * innerWidth + s / 2, y: this.pos.fy * innerHeight + s / 2 }; }
};

/* =============================================================
   말풍선
   ============================================================= */
let typing = null;
async function say(id, opts = {}) {
  const text = fillText(opts.text || L[id] || '', opts.vars);
  if (opts.pose) Elf.setPose(opts.pose);
  const b = $('bubble'), bt = $('bubbleText'); bt.textContent = ''; b.classList.add('on');
  if (opts.button) { /* 버튼 붙이기는 아래 */ }
  // 한 글자씩
  let skip = false; tapResolver = () => { skip = true; };
  const chars = [...text];
  for (let i = 0; i < chars.length && !skip; i++) { bt.textContent += chars[i]; await new Promise(r => setTimeout(r, 38 / SPEED)); }
  bt.textContent = text; tapResolver = null;
  const voiceId = opts.voice || id;
  const voiced = Sound.playVoice(voiceId);
  const minRead = Math.max(1800, text.length * 115);
  // 목소리가 있으면 끝날 때까지, 없으면 읽을 시간만큼
  const hasVoice = !!(S.sound && S.lib && S.lib.voices[voiceId]);
  if (hasVoice) await Promise.race([voiced, new Promise(r => { tapResolver = () => { Sound.stopVoice(); r(); }; })]);
  if (opts.button) {
    const row = el('div', 'btnRow', bt); const btn = el('button', 'bigbtn small pulse', row); btn.textContent = opts.button;
    b.style.pointerEvents = 'auto';
    await new Promise(r => btn.onclick = () => { Sound.sfx('pop'); r(); });
    b.style.pointerEvents = 'none';
  } else if (!opts.noWait) {
    await beat(hasVoice ? 900 : minRead);
  }
  if (!opts.keep) b.classList.remove('on');
}
function hideBubble() { $('bubble').classList.remove('on'); }

/* =============================================================
   무대 도우미
   ============================================================= */
const stage = () => $('stage');
function clearStage() { gsap.killTweensOf('#stage *'); stage().innerHTML = ''; pile = []; }
let pile = [];
function loadImg(url) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; }); }

async function showPhoto(key, { caption = '' } = {}) {
  const url = await blobUrl(key); if (!url) return;
  const img = await loadImg(url); if (!img) return;
  const ar = img.naturalWidth / img.naturalHeight;
  let h = 56 * VH(), w = h * ar; const maxW = 58 * VW(); if (w > maxW) { w = maxW; h = w / ar; }
  const card = el('div', 'polaroid', stage());
  el('div', 'tape', card);
  const ph = el('div', 'ph', card); ph.style.width = w + 'px'; ph.style.height = h + 'px';
  ph.appendChild(img);
  if (caption) { const c = el('div', 'cap', card); c.textContent = caption; }
  const cw = w + 3.2 * VH(), chh = h + 7.6 * VH();
  const left = (innerWidth - cw) / 2 + 4 * VW(), top = Math.max(3 * VH(), (innerHeight * 0.74 - chh) / 2);
  Object.assign(card.style, { left: left + 'px', top: top + 'px' });
  Sound.sfx('page');
  gsap.fromTo(card, { opacity: 0, scale: .55, rotation: rand(-14, 14), y: 8 * VH() },
    { opacity: 1, scale: 1, rotation: rand(-3, 3), y: 0, duration: .8 / SPEED, ease: 'back.out(1.5)' });
  gsap.fromTo(img, { scale: 1.0 }, { scale: 1.09, xPercent: rand(-2, 2), duration: 7, ease: 'none' });
  return card;
}
function toPile(card) {
  if (!card) return;
  pile.push(card);
  const i = pile.length - 1;
  gsap.to(card, { x: -(parseFloat(card.style.left)) + 2 * VW() + (i % 4) * 2.2 * VW(), y: innerHeight * 0.08 + (i % 4) * 1.2 * VH(),
    scale: .3, rotation: rand(-12, 12), transformOrigin: 'left top', duration: .7 / SPEED, ease: 'power2.inOut' });
  if (pile.length > 5) { const old = pile.shift(); gsap.to(old, { opacity: 0, duration: .5, onComplete: () => old.remove() }); }
}
function titleCard(title, sub) {
  const t = el('div', 'titleCard', stage());
  const r = el('div', 'ribbon', t); r.textContent = title;
  if (sub) { const s = el('div', 'sub', t); s.textContent = sub; }
  gsap.fromTo(t, { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .7 / SPEED, ease: 'back.out(2)' });
  return t;
}
async function kidSticker(exprNames, { size = 34, fx = .5, fy = .42 } = {}) {
  let key = null;
  for (const n of exprNames) if (S.lib.expressions[n]) { key = S.lib.expressions[n]; break; }
  if (!key) { const any = Object.values(S.lib.expressions)[0]; key = any || (S.lib.chapters[S.lib.chapters.length - 1] || { photos: [] }).photos[0]; }
  if (!key) return null;
  const url = await blobUrl(key);
  const d = el('div', 'kidSticker', stage()); const s = size * VH();
  Object.assign(d.style, { width: s + 'px', height: s + 'px', left: (fx * innerWidth - s / 2) + 'px', top: (fy * innerHeight - s / 2) + 'px' });
  const im = el('img', '', d); im.src = url;
  gsap.fromTo(d, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: .9 / SPEED, ease: 'back.out(1.8)' });
  FX.burst(fx * innerWidth, fy * innerHeight, 30);
  Sound.sfx('sparkle');
  return d;
}
const GIFT_SVG = `<svg viewBox="0 0 100 100"><rect x="14" y="40" width="72" height="52" rx="6" fill="#e0574a"/><rect x="8" y="28" width="84" height="18" rx="5" fill="#f07467"/>
<rect x="44" y="28" width="12" height="64" fill="#f6c85f"/><path d="M50 28 C30 6 14 18 30 28 Z M50 28 C70 6 86 18 70 28 Z" fill="#f6c85f" stroke="#d9a63a" stroke-width="2"/></svg>`;
function hideGift() {
  const g = el('div', 'gift tappable', stage()); g.innerHTML = GIFT_SVG;
  const spots = [[.06, .18], [.86, .2], [.9, .62], [.06, .72], [.8, .08], [.18, .05]];
  const [fx, fy] = spots[Math.floor(rand(0, spots.length))];
  Object.assign(g.style, { left: fx * innerWidth + 'px', top: fy * innerHeight + 'px', opacity: .92 });
  S.giftsTotal++;
  g.addEventListener('pointerdown', e => {
    e.stopPropagation();
    const r = g.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, 50, 45);
    Sound.sfx('pop'); setTimeout(() => Sound.sfx('sparkle'), 120);
    S.giftsFound++; g.remove();
    const prev = Elf.pose; Elf.setPose('surprise'); setTimeout(() => Elf.setPose(prev || 'point'), 1600);
  }, { once: true });
}

/* =============================================================
   지도 (실제 지도 데이터를 수채화 느낌으로)
   ============================================================= */
const MapView = {
  svg: null, krGeo: null, world: null, proj: null,
  async load() {
    if (!this.krGeo) this.krGeo = await (await fetch('geo/korea-region.json')).json();
    if (!this.world) { const t = await (await fetch('geo/world-110m.json')).json(); this.world = topojson.feature(t, t.objects.countries); }
  },
  defs() {
    return `<defs>
      <filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3"/>
        <feDisplacementMap in="SourceGraphic" scale="5"/></filter>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" result="n"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.10 0"/></filter>
      <radialGradient id="sea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#d9eef3"/><stop offset="1" stop-color="#a9cfe0"/></radialGradient>
      <radialGradient id="ocean" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#bfe3f0"/><stop offset="1" stop-color="#5f9fc4"/></radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset=".85" stop-color="#fff" stop-opacity=".0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></radialGradient>
      <clipPath id="circ"><circle cx="50%" cy="50%" r="50%"/></clipPath>
    </defs>`;
  },
  show() { this.svg = $('map'); this.svg.classList.remove('hidden'); gsap.fromTo(this.svg, { opacity: 0 }, { opacity: 1, duration: .8 }); },
  hide() { return new Promise(r => gsap.to('#map', { opacity: 0, duration: .6, onComplete: () => { $('map').classList.add('hidden'); r(); } })); },
  korea(places) {
    const W = innerWidth, H = innerHeight;
    const kr = this.krGeo.features.find(f => f.properties.name === 'South Korea');
    const box = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[124.6, 33.0], [131.0, 38.7], ...places.map(p => p.ll)] } };
    this.proj = d3.geoMercator().fitExtent([[W * 0.30, H * 0.08], [W * 0.70, H * 0.92]], box);
    const path = d3.geoPath(this.proj);
    let s = this.defs() + `<rect width="100%" height="100%" fill="url(#sea)"/><rect width="100%" height="100%" filter="url(#paper)"/>`;
    s += `<g filter="url(#wc)">`;
    for (const f of this.krGeo.features) {
      const me = f === kr;
      s += `<path d="${path(f)}" fill="${me ? '#cfe3a8' : '#ebe2cf'}" stroke="${me ? '#8fae6a' : '#cfc2a8'}" stroke-width="${me ? 3 : 1.5}" opacity="${me ? 1 : .8}"/>`;
    }
    s += `</g>`;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.innerHTML = s;
    return path;
  },
  pt(ll) { return this.proj(ll); }
};
/* 스티커가 겹치지 않게 배치 */
function layoutCallouts(items, center, R, fixed = []) {
  items.forEach(it => {
    const dx = it.p[0] - center[0], dy = it.p[1] - center[1], d = Math.hypot(dx, dy) || 1;
    it.x = it.p[0] + dx / d * R * 1.4; it.y = it.p[1] + dy / d * R * 1.4;
  });
  for (let k = 0; k < 120; k++) {
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, need = R * 2.25;
      if (d < need) { const m = (need - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * m; a.y -= uy * m; b.x += ux * m; b.y += uy * m; }
    }
    for (const it of items) for (const f of fixed) { // 우리 집 표시와 겹치지 않게
      const dx = it.x - f.x, dy = it.y - f.y, d = Math.hypot(dx, dy) || 1, need = R + f.r;
      if (d < need) { it.x += dx / d * (need - d); it.y += dy / d * (need - d); }
    }
    items.forEach(it => { // 화면 안쪽, 한반도에서 너무 멀지 않게
      it.x = Math.min(innerWidth - R * 1.1, Math.max(R * 1.1, it.x)); it.y = Math.min(innerHeight - R * 1.3, Math.max(R * 1.3, it.y));
    });
  }
}
function placeArt(name) { return TRIP_ART[name] ? `assets/trip/${TRIP_ART[name]}.webp` : null; }
function addMapSticker(it, R) {
  const ns = 'http://www.w3.org/2000/svg', svg = $('map');
  const g = document.createElementNS(ns, 'g'); svg.appendChild(g);
  g.innerHTML = `<line x1="${it.p[0]}" y1="${it.p[1]}" x2="${it.x}" y2="${it.y}" stroke="#b08a60" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
    <circle cx="${it.p[0]}" cy="${it.p[1]}" r="7" fill="#e0574a" stroke="#fff" stroke-width="3"/>`;
  const art = placeArt(it.name);
  const gg = document.createElementNS(ns, 'g'); g.appendChild(gg);
  gg.innerHTML = (art ? `<circle cx="${it.x}" cy="${it.y}" r="${R + 6}" fill="#fff"/><image href="${art}" x="${it.x - R}" y="${it.y - R}" width="${R * 2}" height="${R * 2}"/>`
    : `<circle cx="${it.x}" cy="${it.y}" r="${R * .8 + 6}" fill="#fff"/><circle cx="${it.x}" cy="${it.y}" r="${R * .8}" fill="#f6dfb0"/><text x="${it.x}" y="${it.y + R * .22}" text-anchor="middle" font-size="${R * .7}">🎒</text>`)
    + `<text class="mapLabel" x="${it.x}" y="${it.y + R + 3.6 * VH()}" text-anchor="middle" font-size="${3.4 * VH()}">${it.name}</text>`;
  gsap.fromTo(gg, { scale: 0, transformOrigin: `${it.x}px ${it.y}px` }, { scale: 1, duration: .6 / SPEED, ease: 'back.out(2)' });
  it.node = gg;
}
function homeMarker(p) {
  const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g'); $('map').appendChild(g);
  const r = 2.6 * VH();
  g.innerHTML = `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="#fff" stroke="#e0574a" stroke-width="4"/>
    <text x="${p[0]}" y="${p[1] + r * .38}" text-anchor="middle" font-size="${r * 1.1}">🏠</text>
    <text class="mapLabel" x="${p[0]}" y="${p[1] - r - 1.2 * VH()}" text-anchor="middle" font-size="${3 * VH()}">우리 집</text>`;
  gsap.fromTo(g, { scale: 0, transformOrigin: `${p[0]}px ${p[1]}px` }, { scale: 1, duration: .6, ease: 'back.out(2)' });
}

/* =============================================================
   장면 1 — 프롤로그
   ============================================================= */
async function prologue() {
  clearStage(); setBg('night'); FX.snow = 1;
  Elf.place(-0.3, 0.12); Elf.setPose('fly'); Elf.show();
  await pause(800);
  await Elf.fly(0.62, 0.16, { dur: 2.2, end: 'wave' });
  await say('p01', { pose: 'wave' });
  await say('p02', { pose: 'wave' });
  const kid = await kidSticker(['웃음', '기본', '미소'], { size: 30, fx: .5, fy: .5 });
  await pause(900);
  await say('p03', { pose: 'point' });
  await say('p04', { pose: 'think', noWait: true, keep: true });
  await countUp();
  hideBubble();
  if (kid) { const img = kid.querySelector('img'); const sur = S.lib.expressions['놀람']; if (sur) { img.src = await blobUrl(sur); gsap.fromTo(kid, { scale: .9 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); } }
  await say('p05', { pose: 'surprise' });
  await say('p06', { pose: 'point', button: '응! 같이 볼래' });
  gsap.to('.kidSticker,.statCard', { opacity: 0, scale: .6, duration: .6 });
  await pause(600);
}
async function countUp() {
  const [y, m, d] = S.settings.birth.split('-').map(Number);
  const start = new Date(y, m - 1, d), now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const total = Math.max(0, Math.round((today - start) / 86400000));
  const card = el('div', 'statCard', stage());
  Object.assign(card.style, { top: '13%', width: 'auto', padding: '2.4vh 6vh' });
  card.innerHTML = `<div style="font-size:6.4vh;color:#3c6fb6" id="cDate"></div><div style="font-size:3.6vh;margin-top:.6vh" id="cDays"></div>`;
  gsap.fromTo(card, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .5 });
  const dur = 5200 / SPEED, t0 = performance.now();
  await new Promise(res => {
    const step = now2 => {
      const p = Math.min(1, (now2 - t0) / dur), e = 1 - Math.pow(1 - p, 2.3);
      const days = Math.round(total * e), cur = new Date(start); cur.setDate(cur.getDate() + days);
      $('cDate').textContent = `${cur.getFullYear()}년 ${cur.getMonth() + 1}월 ${cur.getDate()}일`;
      $('cDays').innerHTML = `${fillText('{이름}이를')} 만난 지 <b style="color:#e0574a;font-size:1.3em">${days.toLocaleString()}</b>일`;
      if (Math.random() < .25) FX.trail(innerWidth / 2 + rand(-200, 200), innerHeight * .2);
      if (p < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
  FX.burst(innerWidth / 2, innerHeight * .18, 60); Sound.sfx('sparkle');
  S.daysTotal = total;
  await pause(700);
}

/* =============================================================
   장면 2 — 어린이집·유치원 장
   ============================================================= */
const CH_BG = ['ch1', 'ch2', 'ch3'];
async function chapters() {
  const list = S.lib.chapters;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    clearStage(); setBg(CH_BG[Math.min(i, CH_BG.length - 1)], 'soft'); FX.snow = 0;
    await Elf.fly(0.04, 0.5, { dur: 1.1, end: 'point' });
    const tc = titleCard(ch.title || `${i + 1}번째 이야기`, `${i + 1}번째 이야기`);
    Sound.sfx('sparkle');
    await beat(2600);
    gsap.to(tc, { opacity: 0, scale: .8, duration: .5, onComplete: () => tc.remove() });
    const lineId = 'c' + (i + 1);
    await say(lineId, { pose: 'point', text: ch.memo || L[lineId] || L.cN, voice: ch.memo ? `c${i + 1}_memo` : lineId });
    hideGift();
    if (i === 0) await say('g01', { pose: 'wave' });
    let last = null;
    for (let k = 0; k < ch.photos.length; k++) {
      if (last) toPile(last);
      last = await showPhoto(ch.photos[k], { caption: ch.title });
      if (k > 0 && k % 4 === 2) { const r = RANDOM_LINES[Math.floor(rand(0, RANDOM_LINES.length))]; await say(r, { pose: k % 2 ? 'surprise' : 'wave' }); Elf.setPose('point'); }
      else await beat(3400);
    }
    if (last) toPile(last);
    await pause(700);
  }
}

/* =============================================================
   장면 3 — 여행 (지도 → 지구본)
   ============================================================= */
async function travel() {
  const places = S.lib.places.filter(p => p.albums.length);
  if (!places.length) return;
  const dom = places.filter(p => p.region === '국내'), abroad = places.filter(p => p.region === '해외');
  clearStage(); setBg('night'); FX.snow = 0.25;
  await Elf.fly(0.06, 0.5, { dur: 1.0, end: 'think' });
  await say('t01', { pose: 'think' });
  await MapView.load();

  if (dom.length) {
    MapView.show();
    const items = dom.map(p => ({ name: p.name, place: p, ll: PLACES[p.name] || null })).filter(it => it.ll);
    const unknown = dom.filter(p => !PLACES[p.name]);
    MapView.korea(items);
    const home = MapView.pt(PLACES[HOME]);
    items.forEach(it => it.p = MapView.pt(it.ll));
    const R = 7.4 * VH();
    layoutCallouts(items, home, R, [{ x: home[0], y: home[1] - 2 * VH(), r: 8 * VH() }]);
    homeMarker(home);
    await pause(600);
    Elf.place(home[0] / innerWidth - 0.11, home[1] / innerHeight - 0.32);
    Elf.setPose('wave');
    await say('t02', { pose: 'wave' });
    for (const it of items) {
      addMapSticker(it, R);
      const side = it.x > innerWidth * 0.5 ? 1 : -1;
      const ex = Math.min(innerWidth - Elf.size(), Math.max(0, it.x + side * R * 0.9 - (side < 0 ? Elf.size() : 0)));
      const ey = Math.min(innerHeight * 0.62, Math.max(0, it.y - Elf.size() * 0.75));
      await Elf.fly(ex / innerWidth, ey / innerHeight, { dur: 1.3, end: 'point' });
      if (side < 0) Elf.face(-1);
      FX.burst(it.x, it.y, 30); Sound.sfx('sparkle');
      gsap.fromTo(it.node, { scale: 1 }, { scale: 1.25, yoyo: true, repeat: 1, duration: .35, transformOrigin: `${it.x}px ${it.y}px` });
      await placeAlbums(it.place, true);
    }
    for (const p of unknown) await placeAlbums(p, true, true);
    await MapView.hide();
  }

  if (abroad.length) {
    await globeTrip(abroad);
  }
}
async function placeAlbums(place, fromMap, unknownSpot = false) {
  const art = placeArt(place.name);
  const layer = el('div', '', stage()); Object.assign(layer.style, { position: 'absolute', inset: 0, pointerEvents: 'none' });
  // 지도를 살짝 흐리게
  let st = null;
  if (art) { st = el('img', 'sticker', layer); st.src = art; const s = 24 * VH(); Object.assign(st.style, { width: s + 'px', height: s + 'px', left: (innerWidth - s) / 2 + 'px', top: 6 * VH() + 'px' }); gsap.fromTo(st, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: .7 / SPEED, ease: 'back.out(1.8)' }); }
  const anyNew = place.albums.some(a => a.isNew);
  await say(unknownSpot ? 'place' : 'place', { pose: 'point', vars: { place: place.name }, voice: 'place_' + place.name });
  if (st) gsap.to(st, { scale: .3, opacity: 0, duration: .6 });
  if (fromMap) gsap.to('#map', { opacity: .12, duration: .5 });
  await Elf.fly(0.03, 0.5, { dur: .9, end: 'point' });
  for (const a of place.albums) {
    if (a.isNew) await say('newp', { pose: 'surprise', vars: { place: place.name }, voice: 'new_' + place.name });
    const cap = (a.year ? a.year + '년 ' : '') + place.name;
    if (a.memo) await say('memo', { text: a.memo, pose: 'wave', voice: `memo_${place.name}_${a.year}` });
    let last = null;
    for (let k = 0; k < a.photos.length; k++) {
      if (last) toPile(last);
      last = await showPhoto(a.photos[k], { caption: cap });
      if (k > 0 && k % 5 === 3) { const r = RANDOM_LINES[Math.floor(rand(0, RANDOM_LINES.length))]; await say(r, { pose: 'surprise' }); Elf.setPose('point'); }
      else await beat(3200);
    }
    if (last) toPile(last);
    await pause(500);
  }
  // 정리하고 지도로 돌아가기
  await new Promise(r => gsap.to(stage().children, { opacity: 0, duration: .5, onComplete: r }));
  clearStage();
  if (fromMap) gsap.to('#map', { opacity: 1, duration: .5 });
}
async function globeTrip(abroad) {
  const W = innerWidth, H = innerHeight;
  clearStage(); setBg('night'); FX.snow = 0;
  await say('t03', { pose: 'think' });
  const svg = $('map'); svg.classList.remove('hidden'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const r = Math.min(W, H) * 0.42, cx = W / 2, cy = H * 0.52;
  const proj = d3.geoOrthographic().scale(r).translate([cx, cy]).clipAngle(90);
  const path = d3.geoPath(proj); const grat = d3.geoGraticule10();
  const kr = MapView.world.features.filter(f => /Korea/.test(f.properties.name));
  const start = PLACES[HOME];
  const render = (rot, extra = '') => {
    proj.rotate(rot);
    let s = MapView.defs() + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ocean)"/>`;
    s += `<path d="${path(grat)}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>`;
    s += `<g filter="url(#wc)">`;
    for (const f of MapView.world.features) { const d = path(f); if (d) s += `<path d="${d}" fill="${kr.includes(f) ? '#f2c66d' : '#cfe3a8'}" stroke="#8fae6a" stroke-width="1"/>`; }
    s += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow)"/>` + extra;
    svg.innerHTML = s;
  };
  render([-start[0], -start[1]]);
  gsap.fromTo(svg, { opacity: 0, scale: .6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 1.2 / SPEED, ease: 'power2.out' });
  await pause(1200);
  for (const p of abroad) {
    const ll = PLACES[p.name];
    if (!ll) { await placeAlbums(p, false); continue; }
    const mid = d3.geoInterpolate(start, ll)(0.5);
    // 지구본 돌리기
    const o = { t: 0 }, from = [-start[0], -start[1]], to = [-mid[0], -mid[1]];
    await new Promise(res => gsap.to(o, { t: 1, duration: 2.2 / SPEED, ease: 'power2.inOut', onUpdate: () => render([from[0] + (to[0] - from[0]) * o.t, from[1] + (to[1] - from[1]) * o.t]), onComplete: res }));
    // 비행 경로
    const interp = d3.geoInterpolate(start, ll), pts = d3.range(0, 1.0001, 0.02).map(t => proj(interp(t)));
    const dstr = 'M' + pts.map(q => q.join(',')).join('L');
    render(to, `<path id="route" d="${dstr}" fill="none" stroke="#e0574a" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/>
      <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="9" fill="#fff" stroke="#e0574a" stroke-width="4"/>`);
    Elf.place(pts[0][0] / W - 0.1, pts[0][1] / H - 0.25); Elf.setPose('fly'); Elf.face(pts[pts.length - 1][0] < pts[0][0] ? -1 : 1);
    Sound.sfx('whoosh');
    await new Promise(res => { const q = { i: 0 }; gsap.to(q, { i: pts.length - 1, duration: 2.6 / SPEED, ease: 'power1.inOut', onUpdate: () => {
      const a = pts[Math.floor(q.i)], b = pts[Math.min(pts.length - 1, Math.floor(q.i) + 1)], f = q.i % 1;
      const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
      gsap.set('#elfWrap', { x: x - Elf.size() * .5, y: y - Elf.size() * .75 }); FX.trail(x, y);
    }, onComplete: res }); });
    const end = pts[pts.length - 1]; Elf.pos = { fx: (end[0] - Elf.size() * .5) / W, fy: (end[1] - Elf.size() * .75) / H }; Elf.face(1);
    // 도착 스티커
    const art = placeArt(p.name), R = 8 * VH();
    const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g'); svg.appendChild(g);
    g.innerHTML = (art ? `<circle cx="${end[0]}" cy="${end[1] - R * 1.4}" r="${R + 6}" fill="#fff"/><image href="${art}" x="${end[0] - R}" y="${end[1] - R * 2.4}" width="${R * 2}" height="${R * 2}"/>` : '')
      + `<circle cx="${end[0]}" cy="${end[1]}" r="9" fill="#e0574a" stroke="#fff" stroke-width="3"/>
      <text class="mapLabel" x="${end[0]}" y="${end[1] + 5 * VH()}" text-anchor="middle" font-size="${3.6 * VH()}">${p.name}</text>`;
    gsap.fromTo(g, { scale: 0, transformOrigin: `${end[0]}px ${end[1]}px` }, { scale: 1, duration: .6, ease: 'back.out(2)' });
    FX.burst(end[0], end[1], 40); Sound.sfx('sparkle'); Elf.setPose('surprise');
    await pause(1200);
    gsap.to('#elfWrap', { x: 0.04 * W, y: 0.5 * H, duration: .8 }); Elf.pos = { fx: .04, fy: .5 };
    await placeAlbums(p, true);
  }
  await MapView.hide();
}

/* =============================================================
   장면 4 — 에필로그
   ============================================================= */
async function epilogue() {
  clearStage(); setBg('xmas', 'soft'); FX.snow = 0.5;
  await Elf.fly(0.06, 0.48, { dur: 1.2, end: 'surprise' });
  const kid = await kidSticker(['신남', '웃음', '기본'], { size: 24, fx: .85, fy: .34 });
  await say('e01', { pose: 'surprise' });
  const trips = S.lib.places.reduce((n, p) => n + p.albums.length, 0);
  const card = el('div', 'statCard', stage());
  Object.assign(card.style, { top: '36%', left: '43%', width: 'min(56vw,92vh)' });
  card.innerHTML = `<h3>${fillText('{이름}이의 반짝이는 기록')}</h3><div class="stats">
    <div class="stat"><b id="s1">0</b><span>함께한 날</span></div>
    <div class="stat"><b id="s2">0</b><span>다녀온 여행</span></div>
    <div class="stat"><b id="s3">0</b><span>추억 사진</span></div>
    ${S.giftsFound ? `<div class="stat"><b id="s4">0</b><span>찾은 선물</span></div>` : ''}</div>`;
  gsap.fromTo(card, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .7, ease: 'back.out(1.6)' });
  const days = S.daysTotal || 0;
  const tick = (id, v) => { const o = { v: 0 }; gsap.to(o, { v, duration: 1.6 / SPEED, ease: 'power2.out', onUpdate: () => { const e = $(id); if (e) e.textContent = Math.round(o.v).toLocaleString(); } }); };
  tick('s1', days); tick('s2', trips); tick('s3', S.lib.photos - Object.keys(S.lib.expressions).length); if (S.giftsFound) tick('s4', S.giftsFound);
  Sound.sfx('sparkle');
  await beat(4200);
  gsap.to(card, { opacity: 0, scale: .8, duration: .5, onComplete: () => card.remove() });
  await say('e02', { pose: 'bye' });
  await say('e03', { pose: 'bye' });
  await say('e04', { pose: 'wave' });
  FX.snow = 1;
  for (let i = 0; i < 6; i++) setTimeout(() => FX.burst(rand(.1, .9) * innerWidth, rand(.1, .5) * innerHeight, 30, rand(0, 360)), i * 300);
  await say('e05', { pose: 'wave', button: '↺ 처음부터 다시' });
}

/* =============================================================
   전체 진행
   ============================================================= */
async function run(from = 'start') {
  if (S.running) return; S.running = true; S.giftsFound = 0; S.giftsTotal = 0;
  try {
    if (from === 'start') { await prologue(); await chapters(); }
    if (S.daysTotal === undefined) { const [y, m, d] = S.settings.birth.split('-').map(Number); S.daysTotal = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d)) / 86400000); }
    await travel();
    await epilogue();
  } catch (e) { console.error(e); }
  S.running = false;
  location.reload();
}

/* =============================================================
   화면 구성 · 설정
   ============================================================= */
function openSetup(canCancel) {
  $('setupLayer').classList.remove('hidden');
  $('cancelSetup').classList.toggle('hidden', !canCancel);
  if (S.settings) { $('inName').value = S.settings.name; $('inBirth').value = S.settings.birth; }
}
async function saveSetup() {
  const name = $('inName').value.trim(), birth = $('inBirth').value, files = $('inZip').files, file = files.length ? files : null;
  const rep = $('importReport');
  if (!name || !birth) { rep.innerHTML = '<span class="warn">이름과 생일을 입력해 주세요.</span>'; return; }
  if (!file && !S.lib) { rep.innerHTML = '<span class="warn">사진 압축 파일(ZIP)을 선택해 주세요.</span>'; return; }
  $('saveBtn').disabled = true;
  try {
    S.settings = { name, birth }; await DB.put('kv', 'settings', S.settings);
    if (file) {
      $('progress').classList.remove('hidden');
      const lib = await importZip(file, (i, n, f, fn) => { $('progBar').style.width = (i / n * 100) + '%'; $('progText').textContent = `${fn > 1 ? `압축 파일 ${f}/${fn} · ` : ''}사진 정리 중… ${i} / ${n}`; });
      S.lib = lib;
      const lines = [`✔ 사진 ${lib.photos}장을 불러왔습니다.`,
        `· 장: ${lib.chapters.map(c => c.title || c.order).join(', ') || '없음'}`,
        `· 여행지: ${lib.places.map(p => p.name + '(' + p.albums.length + ')').join(', ') || '없음'}`,
        `· 표정: ${Object.keys(lib.expressions).join(', ') || '없음'}`,
        `· 목소리 ${Object.keys(lib.voices).length}개, 소리 ${Object.keys(lib.sounds).length}개`];
      const unknown = lib.places.filter(p => !PLACES[p.name]).map(p => p.name);
      if (unknown.length) lines.push(`<span class="warn">· 지도에 없는 여행지(지도 없이 사진만 보여 줌): ${unknown.join(', ')}</span>`);
      if (lib.skipped.length) lines.push(`<span class="warn">· 건너뛴 파일 ${lib.skipped.length}개: ${lib.skipped.slice(0, 5).join(', ')}${lib.skipped.length > 5 ? ' …' : ''}</span>`);
      rep.innerHTML = lines.join('\n');
      $('progText').textContent = '완료!';
    }
    try { navigator.storage && navigator.storage.persist && await navigator.storage.persist(); } catch (e) {}
    await sleep(file ? 1800 : 0);
    $('setupLayer').classList.add('hidden'); showStart();
  } catch (e) {
    console.error(e); rep.innerHTML = `<span class="warn">불러오기 실패: ${e.message || e}</span>`;
  } finally { $('saveBtn').disabled = false; }
}
function showStart() {
  $('startTitle').innerHTML = fillText('{이름}이에게<br>찾아온 크리스마스 요정');
  $('startLayer').classList.remove('hidden');
}
function libSummary() {
  if (!S.lib) return '불러온 사진이 없습니다.';
  const d = new Date(S.lib.importedAt);
  return `사진 ${S.lib.photos}장 · 장 ${S.lib.chapters.length}개 · 여행지 ${S.lib.places.length}곳 · 목소리 ${Object.keys(S.lib.voices).length}개<br>마지막으로 불러온 날: ${d.toLocaleDateString('ko-KR')}`;
}
function bindUi() {
  addEventListener('pointerdown', onScreenTap);
  $('autoBtn').onclick = () => { S.auto = !S.auto; $('autoBtn').textContent = S.auto ? '▶ 자동' : '✋ 직접'; $('autoBtn').classList.toggle('off', !S.auto); try { localStorage.setItem('auto', S.auto ? '1' : '0'); } catch (e) {} if (S.auto && tapResolver) { const r = tapResolver; tapResolver = null; r(); } };
  $('soundBtn').onclick = () => { S.sound = !S.sound; $('soundBtn').textContent = S.sound ? '🔊' : '🔇'; $('soundBtn').classList.toggle('off', !S.sound); Sound.setMute(!S.sound); };
  $('fsBtn').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} };
  $('startBtn').onclick = async () => {
    Sound.unlock(); Sound.startBgm();
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) {}
    $('startLayer').classList.add('hidden'); run('start');
  };
  $('saveBtn').onclick = saveSetup;
  $('cancelSetup').onclick = () => { $('setupLayer').classList.add('hidden'); if (S.settings && S.lib) showStart(); };
  // 부모 메뉴: 톱니를 2초 길게 누르기
  let hold = null; const g = $('gearBtn');
  g.addEventListener('pointerdown', e => { e.stopPropagation(); g.classList.add('holding'); hold = setTimeout(() => { g.classList.remove('holding'); $('libSummary').innerHTML = libSummary(); $('parentLayer').classList.remove('hidden'); }, 1800); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => g.addEventListener(ev, () => { clearTimeout(hold); g.classList.remove('holding'); }));
  $('pmClose').onclick = () => $('parentLayer').classList.add('hidden');
  $('pmSetup').onclick = () => { $('parentLayer').classList.add('hidden'); $('startLayer').classList.add('hidden'); $('importReport').innerHTML = ''; $('progress').classList.add('hidden'); openSetup(true); };
  $('pmRestart').onclick = () => location.reload();
  $('pmJump').onclick = () => { $('parentLayer').classList.add('hidden'); $('startLayer').classList.add('hidden'); Sound.unlock(); Sound.startBgm(); run('travel'); };
}

async function boot() {
  $('ver').textContent = VERSION;
  FX.init(); FX.snow = 0.6; setBg('night');
  Elf.place(-0.4, 0.5); $('elfImg').src = 'assets/elf/wave.webp';
  try { const a = localStorage.getItem('auto'); if (a === '0') { S.auto = false; $('autoBtn').textContent = '✋ 직접'; $('autoBtn').classList.add('off'); } } catch (e) {}
  bindUi();
  await DB.open();
  S.settings = await DB.get('kv', 'settings');
  S.lib = await DB.get('kv', 'lib');
  if (!S.settings || !S.lib) openSetup(false); else showStart();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.addEventListener('DOMContentLoaded', () => boot().catch(e => { console.error(e); alertBox('앱을 여는 중 문제가 생겼습니다: ' + (e.message || e)); }));
function alertBox(msg) { const d = el('div', 'layer', $('app')); d.innerHTML = `<div class="panel"><h2>알림</h2><p class="note">${msg}</p></div>`; }

/* =============================================================
   반짝이의 크리스마스 선물 — 앱 본체
   - 이름·생일·사진·목소리는 태블릿(IndexedDB)에만 저장됩니다.
   - 이 코드에는 개인 정보가 들어 있지 않습니다.
   ============================================================= */
'use strict';
const VERSION = 'v1.2.1';
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
  g01:'어? 여기 어딘가에 선물이 숨어 있어!',
  g02:'찾았다! 역시 {이름}이는 최고야!',
  r01:'우와, 이 표정 좀 봐!', r02:'여기 기억나?', r03:'정말 귀엽다~', r04:'이때 진짜 재밌었지?', r05:'꺄르륵, 너무 좋다!',
  t01:'이번엔 우리 여행을 간 추억들을 떠올려볼까?',
  t02:'우리 집은 여기! 자, 출발~',
  t03:'이번엔 바다 건너 더 멀리 가 볼까?',
  place:'{장소}! 여기도 갔었지?',
  t04:'어디로 가 볼까? 가고 싶은 곳을 눌러 봐!',
  y01:'언제 갔을 때 사진을 볼까?',
  h01:'{이름}아, 언제 적 사진을 보고 싶어? 골라 봐!',
  h02:'또 어디 볼까?',
  a01:'보고 싶은 사진을 눌러 봐! 크게 보여 줄게.',
  newp:'이번에는 {장소}에 다녀왔구나?',
  go1:'나도 같이 갈래! {장소}로 출발~',
  go2:'와, 저기 {장소}가 보여!',
  e01:'{이름}이랑 함께한 시간을 돌아보니 정말 행복하다!',
  e02:'이제 나는 눈꽃 나라로 돌아가야 해…',
  e03:'크리스마스 요정은 착한 아이를 스스로 찾아온단다.',
  e04:'하지만 걱정 마! {이름}이가 엄마 아빠랑 함께 있을 때면 또 나타날 수 있어.',
  e05:'다음에 또 보고 싶으면 엄마 아빠한테 살짝 말해 줘. 그럼 내가 또 올게!',
  e06:'메리 크리스마스, {이름}아!'
};
/* 대사마다 하윤이 표정 (표정 폴더의 파일 이름) */
const KID = { p01:'놀람', p02:'기쁨', p03:'기쁨', p04:'놀람', p05:'놀람', p06:'기쁨', c1:'기쁨', c2:'기쁨', c3:'신남', cN:'기쁨',
  g01:'놀람', g02:'신남', r01:'기쁨', r02:'기쁨', r03:'기쁨', r04:'신남', r05:'신남', t03:'놀람', t04:'기쁨', y01:'기쁨', place:'신남',
  h01:'기쁨', h02:'기쁨', a01:'기쁨', newp:'놀람', memo:'기쁨', go1:'신남', go2:'놀람',
  e01:'기쁨', e02:'슬픔', e03:'슬픔', e04:'기쁨', e05:'기쁨', e06:'신남' };
const EXPR_ALIASES = { 기쁨:['기쁨','웃음','미소','기본','신남'], 놀람:['놀람','기쁨','웃음','미소','기본'], 슬픔:['슬픔','아쉬움','속상','시무룩'], 신남:['신남','기쁨','웃음','미소','기본'] };
const WALK_NAMES = ['걷기', '뒷모습', '걷는'];
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
function roJosa(w) { const c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return w + '로'; const j = (c - 0xAC00) % 28; return w + (j === 0 || j === 8 ? '로' : '으로'); }
function fillText(t, vars = {}) {
  const n = S.settings ? S.settings.name : '';
  return t.replace(/\{이름\}아/g, josa(n, '아', '야'))
          .replace(/\{이름\}이/g, josa(n, '이', ''))
          .replace(/\{이름\}/g, n)
          .replace(/\{장소\}로/g, vars.place ? roJosa(vars.place) : '')
          .replace(/\{장소\}가/g, vars.place ? josa(vars.place, '이', '가') : '')
          .replace(/\{장소\}/g, vars.place || '');
}

/* =============================================================
   상태
   ============================================================= */
const S = {
  settings: null,   // {name, birth}
  lib: null,        // 불러온 사진 목록
  auto: true, sound: true,
  running: false, giftsFound: 0, giftsTotal: 0, visited: new Set(), giftFound: new Set(), toldTap: false, visitedMap: false,
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
async function shrinkImage(blob, keepAlpha = false) {
  const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const max = keepAlpha ? 1000 : 1600, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * sc), h = Math.round(bmp.height * sc);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(bmp, 0, 0, w, h); bmp.close && bmp.close();
  if (keepAlpha) { // 배경을 오린(투명) 사진인지 확인
    const px = (x, y) => g.getImageData(x, y, 1, 1).data[3];
    const cut = [px(1, 1), px(w - 2, 1), px(1, h - 2), px(w - 2, h - 2), px(w >> 1, 1)].filter(a => a < 200).length >= 3;
    if (cut) { const b = await new Promise(r => c.toBlob(r, 'image/png')); b.cutout = true; return b; }
  }
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
        const small = await shrinkImage(raw, target.kind === 'expr' && /\.(png|webp)$/i.test(f));
        if (target.kind === 'expr' && small.cutout) (lib.cutouts = lib.cutouts || {})[target.name] = true;
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
  gsap.killTweensOf(nxt);
  gsap.fromTo(nxt, { scale: 1.18, x: 0, y: '2vh' }, { scale: 1, y: 0, duration: 1.8 / SPEED, ease: 'power2.out', onComplete: () => {
    bgTween = gsap.to(nxt, { scale: 1.06, x: rand(-12, 12), duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 }); } });
  nxt.classList.add('on'); cur.classList.remove('on');
  $('bgShade').className = shade;
}
/* =============================================================
   눈·반짝이 효과 (캔버스)
   ============================================================= */
const FX = {
  c: null, g: null, flakes: [], near: [], sparks: [], snow: 0,
  newNear(any) { return { x: rand(0, innerWidth), y: any ? rand(0, innerHeight) : -40, r: rand(7, 15), vy: rand(1.6, 2.8), ph: rand(0, 6.28), o: rand(.18, .35) }; },
  init() {
    this.c = $('fx'); this.g = this.c.getContext('2d'); this.resize(); addEventListener('resize', () => this.resize());
    for (let i = 0; i < 140; i++) this.flakes.push(this.newFlake(true));
    for (let i = 0; i < 16; i++) this.near.push(this.newNear(true));
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
    const nc = Math.floor(this.near.length * this.snow);
    for (let i = 0; i < nc; i++) { // 화면 가까이 지나가는 흐린 눈송이 (깊이감)
      const f = this.near[i]; f.y += f.vy; f.ph += .012; f.x += Math.sin(f.ph) * .9;
      if (f.y > innerHeight + 40) Object.assign(f, this.newNear(false));
      const gr = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, `rgba(255,255,255,${f.o})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
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
  async fly(fx, fy, { dur = 2.4, pose = 'fly', end = null, arc = 0.12 } = {}) {
    const from = this.px(this.pos.fx, this.pos.fy), to = this.px(fx, fy);
    this.setPose(pose); this.face(to.x < from.x ? -1 : 1);
    $('elfWrap').classList.remove('bob'); Sound.sfx('whoosh');
    const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - arc * innerHeight };
    this.trailOn = true;
    await new Promise(res => {
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: dur / SPEED, ease: 'sine.inOut', onUpdate: () => {
        const t = o.t, u = 1 - t;
        const x = u * u * from.x + 2 * u * t * mid.x + t * t * to.x, y = u * u * from.y + 2 * u * t * mid.y + t * t * to.y;
        gsap.set('#elfWrap', { x, y }); if (Math.random() < 0.7) FX.trail(x + this.size() * 0.45, y + this.size() * 0.6);
      }, onComplete: res });
    });
    this.trailOn = false; this.pos = { fx, fy }; this.face(1);
    $('elfWrap').classList.add('bob'); if (end) this.setPose(end);
  },
  face(d) { this.flip = d; gsap.set('#elfImg,#elfImg2', { scaleX: d }); },
  /** 하윤이 주위를 천천히 빙글빙글 */
  orbit(cx, cy, rx, ry, period = 7) {
    let on = true; const s = this.size(), t0 = performance.now(); $('elfWrap').classList.remove('bob'); this.setPose('fly');
    const from = this.px(this.pos.fx, this.pos.fy);
    const tick = () => {
      if (!on) return;
      const t = (performance.now() - t0) / 1000 * SPEED, a = t / period * 6.283 - 1.2, k = Math.min(1, t / 1.5);
      const tx = cx + Math.cos(a) * rx - s / 2, ty = cy + Math.sin(a) * ry - s * .6;
      const x = from.x + (tx - from.x) * k, y = from.y + (ty - from.y) * k;
      gsap.set('#elfWrap', { x, y }); this.face(-Math.sin(a) >= 0 ? 1 : -1);
      if (Math.random() < .5) FX.trail(x + s * .45, y + s * .6);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { on = false; const r = $('elfWrap').getBoundingClientRect(); this.pos = { fx: r.left / innerWidth, fy: r.top / innerHeight }; this.face(1); $('elfWrap').classList.add('bob'); };
  },
  hide() { gsap.to('#elfWrap', { opacity: 0, duration: .4 }); },
  show() { gsap.to('#elfWrap', { opacity: 1, duration: .4 }); },
  center() { const s = this.size(); return { x: this.pos.fx * innerWidth + s / 2, y: this.pos.fy * innerHeight + s / 2 }; }
};

/* =============================================================
   하윤이 얼굴 — 대화창 옆에 고정, 대사마다 표정이 바뀜
   ============================================================= */
const Portrait = {
  cur: null,
  resolve(expr) {
    const ex = (S.lib && S.lib.expressions) || {}, cut = n => !!(S.lib.cutouts && S.lib.cutouts[n]);
    for (const n of (EXPR_ALIASES[expr] || [expr])) if (ex[n]) return { key: ex[n], cut: cut(n), sub: false };
    if (expr === '슬픔') { const r = this.resolve('기쁨'); if (r) return { ...r, sub: true }; }
    const any = Object.keys(ex).find(n => !WALK_NAMES.includes(n));
    return any ? { key: ex[any], cut: cut(any), sub: false } : null;
  },
  async show(expr) {
    const box = $('portrait'), r = this.resolve(expr);
    if (!r) { box.classList.remove('on'); return; }
    box.classList.toggle('cut', r.cut); box.classList.toggle('sad', r.sub);
    const wasOn = box.classList.contains('on'); box.classList.add('on');
    const id = r.key + (r.sub ? 's' : '');
    if (this.cur === id) return; this.cur = id;
    const a = $('pA'), b = $('pB'), on = a.classList.contains('on') ? a : b, off = on === a ? b : a;
    off.src = await blobUrl(r.key); off.classList.add('on'); on.classList.remove('on');
    gsap.fromTo(box, { y: wasOn ? '1.6vh' : '8vh', scale: wasOn ? .95 : .8 }, { y: 0, scale: 1, duration: .45 / SPEED, ease: 'back.out(2.6)' });
  },
  hide() { $('portrait').classList.remove('on'); }
};

/* =============================================================
   말풍선
   ============================================================= */
let typing = null;
async function say(id, opts = {}) {
  const text = fillText(opts.text || L[id] || '', opts.vars);
  if (opts.pose) Elf.setPose(opts.pose);
  asideToken++; Sound.stopVoice();
  const kx = opts.kid === undefined ? KID[id] : opts.kid; if (kx) Portrait.show(kx); else Portrait.hide();
  const b = $('bubble'), bt = $('bubbleText'); bt.textContent = ''; b.classList.add('on');
  if (opts.button) { /* 버튼 붙이기는 아래 */ }
  // 한 글자씩
  let skip = false; tapResolver = () => { skip = true; };
  const chars = [...text];
  for (let i = 0; i < chars.length && !skip; i++) { bt.textContent += chars[i]; await new Promise(r => setTimeout(r, 60 / SPEED)); }
  bt.textContent = text; tapResolver = null;
  const voiceId = opts.voice || id;
  const voiced = Sound.playVoice(voiceId);
  const minRead = Math.max(2600, text.length * 160);
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
  if (!opts.keep) { b.classList.remove('on'); Portrait.hide(); }
}
function hideBubble() { $('bubble').classList.remove('on'); Portrait.hide(); }

/* =============================================================
   무대 도우미
   ============================================================= */
const stage = () => $('stage');
function clearStage() { gsap.killTweensOf('#stage *'); stage().innerHTML = ''; pile = []; }
let pile = [];
function loadImg(url) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; }); }

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
  const name = Object.keys(S.lib.expressions).find(n => S.lib.expressions[n] === key);
  const cut = !!(S.lib.cutouts && S.lib.cutouts[name]);
  const d = el('div', cut ? 'kidCut' : 'kidSticker', stage()); const s = size * VH() * (cut ? 1.35 : 1);
  Object.assign(d.style, { width: s + 'px', height: s + 'px', left: (fx * innerWidth - s / 2) + 'px', top: (fy * innerHeight - s / 2) + 'px' });
  const im = el('img', '', d); im.src = url;
  gsap.fromTo(d, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: .9 / SPEED, ease: 'back.out(1.8)' });
  FX.burst(fx * innerWidth, fy * innerHeight, 30);
  Sound.sfx('sparkle');
  return d;
}
const GIFT_SVG = `<svg viewBox="0 0 100 100"><rect x="14" y="40" width="72" height="52" rx="6" fill="#e0574a"/><rect x="8" y="28" width="84" height="18" rx="5" fill="#f07467"/>
<rect x="44" y="28" width="12" height="64" fill="#f6c85f"/><path d="M50 28 C30 6 14 18 30 28 Z M50 28 C70 6 86 18 70 28 Z" fill="#f6c85f" stroke="#d9a63a" stroke-width="2"/></svg>`;
function hideGift(sceneKey) {
  const g = el('div', 'gift tappable', stage()); g.innerHTML = GIFT_SVG;
  const spots = [[.88, .74], [.9, .14], [.02, .2], [.42, .86], [.7, .86]];
  const [fx, fy] = spots[Math.floor(rand(0, spots.length))];
  Object.assign(g.style, { left: fx * innerWidth + 'px', top: fy * innerHeight + 'px', opacity: .95 });
  S.giftsTotal++;
  g.addEventListener('click', e => {
    e.stopPropagation();
    const r = g.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, 60, 45);
    Sound.sfx('pop'); setTimeout(() => Sound.sfx('sparkle'), 120);
    S.giftsFound++; S.giftFound.add(sceneKey); g.remove();
    aside('g02', { pose: 'surprise' });
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
  hide() { return new Promise(r => gsap.to('#map', { opacity: 0, duration: .6, onComplete: () => { $('map').classList.add('hidden'); gsap.set('#map', { clearProps: 'transform' }); r(); } })); },
  korea(places, withDots = false) {
    const W = innerWidth, H = innerHeight;
    const kr = this.krGeo.features.find(f => f.properties.name === 'South Korea');
    const box = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: [[124.6, 33.0], [131.0, 38.7], ...places.map(p => p.ll)] } };
    this.proj = d3.geoMercator().fitExtent([[W * 0.26, H * 0.04], [W * 0.74, H * 0.96]], box);
    const path = d3.geoPath(this.proj);
    // 기울였을 때 가장자리가 보이지 않도록 바다를 화면보다 넓게
    let s = this.defs() + `<rect x="${-W}" y="${-H * .3}" width="${W * 3}" height="${H * 1.6}" fill="#c3e2ec"/><rect x="${-W}" y="${-H * .3}" width="${W * 3}" height="${H * 1.6}" filter="url(#paper)"/>`;
    s += `<g filter="url(#wc)">`;
    for (const f of this.krGeo.features) {
      const me = f === kr;
      s += `<path d="${path(f)}" fill="${me ? '#cfe3a8' : '#ebe2cf'}" stroke="${me ? '#8fae6a' : '#cfc2a8'}" stroke-width="${me ? 3 : 1.5}" opacity="${me ? 1 : .8}"/>`;
    }
    s += `</g>`;
    if (withDots) {
      places.forEach((pl, i) => { const q = this.proj(pl.ll); s += `<circle data-dot="${i}" cx="${q[0]}" cy="${q[1]}" r="2" fill="none"/>`; });
      const hq = this.proj(PLACES[HOME]); s += `<circle data-dot="home" cx="${hq[0]}" cy="${hq[1]}" r="2" fill="none"/>`;
      places.forEach(pl => pl.p = this.proj(pl.ll));
    }
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
  await Elf.fly(0.40, 0.18, { dur: 3.6, end: 'wave' });
  await say('p01', { pose: 'wave' });
  await say('p02', { pose: 'wave' });
  await say('p03', { pose: 'point' });
  await say('p04', { pose: 'think', noWait: true, keep: true });
  hideBubble(); Portrait.show('놀람');
  const stopOrbit = Elf.orbit(innerWidth * .5, innerHeight * .34, 40 * VH(), 13 * VH(), 6);
  await countUp();
  stopOrbit();
  await Elf.fly(0.40, 0.42, { dur: 1.6, end: 'surprise' });
  await say('p05', { pose: 'surprise' });
  await say('p06', { pose: 'point', button: '응! 같이 볼래' });
  gsap.to('.statCard', { opacity: 0, scale: .6, duration: .6 });
  await pause(600);
}
async function countUp() {
  const [y, m, d] = S.settings.birth.split('-').map(Number);
  const start = new Date(y, m - 1, d), now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const total = Math.max(0, Math.round((today - start) / 86400000));
  const card = el('div', 'statCard', stage());
  Object.assign(card.style, { top: '30%', width: 'auto', padding: '3vh 7vh' });
  card.innerHTML = `<div style="font-size:7.4vh;color:#3c6fb6" id="cDate"></div><div style="font-size:4vh;margin-top:.6vh" id="cDays"></div>`;
  gsap.fromTo(card, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .5 });
  const dur = 7000 / SPEED, t0 = performance.now();
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
  FX.burst(innerWidth / 2, innerHeight * .3, 70); Sound.sfx('sparkle');
  S.daysTotal = total;
  await pause(700);
}

/* =============================================================
   추억 상자 — 하윤이가 직접 고르는 화면
   ============================================================= */
const CH_BG = ['ch1', 'ch2', 'ch3'];
function backButton(label) {
  const b = el('button', 'backBtn tappable', stage()); b.textContent = label;
  gsap.fromTo(b, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .4 });
  return new Promise(r => b.onclick = () => { Sound.sfx('pop'); r(); });
}
let asideToken = 0;
function aside(id, opts = {}) { // 기다리지 않는 짧은 한마디
  const text = fillText(opts.text || L[id] || '', opts.vars), my = ++asideToken;
  if (opts.pose) Elf.setPose(opts.pose);
  const kx = opts.kid === undefined ? KID[id] : opts.kid; if (kx) Portrait.show(kx); else Portrait.hide();
  $('bubbleText').textContent = text; $('bubble').classList.add('on');
  Sound.stopVoice();
  const voiceDone = Sound.playVoice(opts.voice || id);
  const readDone = new Promise(r => setTimeout(r, Math.max(2800, text.length * 170) / SPEED));
  // 글 읽는 시간과 목소리가 모두 끝난 뒤에 말풍선을 닫음
  Promise.all([voiceDone, readDone]).then(() => { if (my === asideToken) { $('bubble').classList.remove('on'); Portrait.hide(); } });
}
async function hubScreen(first) {
  clearStage(); setBg('night'); FX.snow = 0.5;
  await Elf.fly(0.01, 0.56, { end: 'point' });
  const wrap = el('div', 'hub', stage());
  const items = [];
  S.lib.chapters.forEach((ch, i) => items.push({ type: 'chapter', ch, i, title: ch.title || `${i + 1}번째 이야기`, bg: CH_BG[Math.min(i, 2)], photo: ch.photos[0] }));
  if (S.lib.places.some(p => p.albums.length)) items.push({ type: 'travel', title: '여행 지도', bg: null });
  items.push({ type: 'bye', title: '반짝이의 선물', bg: 'xmas' });
  let resolve; const chosen = new Promise(r => resolve = r);
  for (const it of items) {
    const c = el('div', 'hubCard tappable', wrap);
    const pic = el('div', 'hubPic', c);
    if (it.bg) pic.style.backgroundImage = `url(assets/bg/${it.bg}.jpg)`;
    if (it.type === 'chapter' && it.photo) { const pol = el('div', 'hubPol', pic); const im = el('img', '', pol); blobUrl(it.photo).then(u => im.src = u); }
    if (it.type === 'travel') { pic.classList.add('hubMap'); const arts = S.lib.places.map(p => placeArt(p.name)).filter(Boolean).slice(0, 4); arts.forEach((a, k) => { const im = el('img', 'hubTrip', pic); im.src = a; im.style.cssText = `left:${8 + (k % 2) * 46}%;top:${8 + Math.floor(k / 2) * 46}%`; }); if (!arts.length) pic.textContent = '🗺'; }
    if (it.type === 'bye') { const im = el('img', 'hubElf', pic); im.src = 'assets/elf/bye.webp'; }
    const t = el('div', 'hubTitle', c); t.textContent = it.title;
    const key = it.type + (it.i ?? '');
    if (S.visited.has(key)) el('div', 'hubStar', c).textContent = '⭐';
    if (it.type === 'travel' && S.lib.places.some(p => p.albums.some(a => a.isNew))) el('div', 'newBadge', c).textContent = 'NEW';
    c.onclick = () => { Sound.sfx('pop'); FX.burst(c.getBoundingClientRect().left + c.offsetWidth / 2, c.getBoundingClientRect().top + c.offsetHeight / 2, 30); S.visited.add(key); resolve(it); };
  }
  const cards = [...wrap.querySelectorAll('.hubCard')], mid = (cards.length - 1) / 2;
  cards.forEach((c, k) => {
    const off = k - mid;
    gsap.fromTo(c, { opacity: 0, z: -400, rotationY: off * -40, y: 60 }, { opacity: 1, z: -Math.abs(off) * 45, rotationY: off * -9, y: Math.abs(off) * 1.4 * VH(), duration: .9 / SPEED, delay: k * .1, ease: 'back.out(1.4)',
      onComplete: () => gsap.to(c, { y: `+=${1.2 * VH()}`, duration: 1.8 + k * .17, yoyo: true, repeat: -1, ease: 'sine.inOut' }) });
    c.addEventListener('pointerdown', () => gsap.to(c, { rotationX: 10, scale: .95, duration: .15 }));
  });
  aside(first ? 'h01' : 'h02', { pose: first ? 'wave' : 'point' });
  const it = await chosen; asideToken++; hideBubble();
  return it;
}
async function hub() {
  let first = true;
  for (;;) {
    const it = await hubScreen(first); first = false;
    if (it.type === 'chapter') await chapterScene(it.ch, it.i);
    else if (it.type === 'travel') await travelScene();
    else { await epilogue(); location.reload(); return; }
  }
}
/* ---- 사진첩 (작은 사진을 누르면 크게) ---- */
async function albumScene({ bg, shade = 'soft', title, photos, caption, backLabel = '🏠 추억 상자', intro = null, sceneKey }) {
  clearStage(); if (bg !== undefined) setBg(bg, shade); FX.snow = bg === 'night' ? .3 : 0;
  await Elf.fly(0.0, 0.58, { end: 'point' });
  const back = backButton(backLabel);
  const tt = el('div', 'albumTitle', stage()); tt.textContent = title;
  gsap.fromTo(tt, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .5 });
  const grid = el('div', 'albumGrid', stage());
  const PER = 12; let page = 0; const pages = Math.max(1, Math.ceil(photos.length / PER));
  const nav = el('div', 'pager', stage());
  const prevB = el('button', 'pgBtn tappable', nav); prevB.textContent = '◀';
  const pinfo = el('span', 'pgInfo', nav);
  const nextB = el('button', 'pgBtn tappable', nav); nextB.textContent = '▶';
  if (pages < 2) nav.classList.add('hidden');
  const drawPage = async () => {
    grid.innerHTML = ''; pinfo.textContent = `${page + 1} / ${pages}`;
    prevB.disabled = page === 0; nextB.disabled = page === pages - 1;
    const keys = photos.slice(page * PER, page * PER + PER);
    const n = keys.length, cols = Math.max(1, n <= 4 ? n : n <= 6 ? 3 : 4), rows = Math.ceil(n / cols);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const gap = 2.2 * VH(), gw = grid.clientWidth, gh = grid.clientHeight;
    const size = Math.min((gw - gap * (cols - 1)) / cols, (gh - gap * (rows - 1)) / rows, 34 * VH());
    for (let k = 0; k < n; k++) {
      const th = el('div', 'thumb tappable', grid); th.style.width = size + 'px'; th.style.height = size + 'px';
      const im = el('img', '', th); im.src = await blobUrl(keys[k]);
      th.style.setProperty('--r', rand(-6, 6).toFixed(1) + 'deg');
      th.onclick = () => openZoom(photos, page * PER + k, caption);
    }
    gsap.fromTo('.thumb', { opacity: 0, scale: .6, y: 30 }, { opacity: 1, scale: 1, y: 0, stagger: .05, duration: .5 / SPEED, ease: 'back.out(1.7)' });
    Sound.sfx('page');
  };
  prevB.onclick = () => { if (page > 0) { page--; drawPage(); } };
  nextB.onclick = () => { if (page < pages - 1) { page++; drawPage(); } };
  await drawPage();
  if (sceneKey && !S.giftFound.has(sceneKey)) hideGift(sceneKey);
  if (intro) aside(intro.id, intro);
  else if (!S.toldTap) { S.toldTap = true; aside('a01', { pose: 'point' }); }
  await back;
  asideToken++; hideBubble();
  await new Promise(r => gsap.to(stage().children, { opacity: 0, duration: .35, onComplete: r }));
}
function openZoom(list, idx, caption) {
  const z = el('div', 'zoomWrap tappable', stage());
  const box = el('div', 'zoomBox', z);
  const close = el('button', 'zoomClose tappable', z); close.textContent = '✕';
  const pv = el('button', 'zoomNav left tappable', z); pv.textContent = '◀';
  const nx = el('button', 'zoomNav right tappable', z); nx.textContent = '▶';
  let i = idx;
  const show = async dir => {
    const url = await blobUrl(list[i]); const img = await loadImg(url); if (!img) return;
    const ar = img.naturalWidth / img.naturalHeight; let h = 70 * VH(), w = h * ar; const maxW = 70 * VW(); if (w > maxW) { w = maxW; h = w / ar; }
    box.innerHTML = '';
    const card = el('div', 'polaroid', box); el('div', 'tape', card);
    const ph = el('div', 'ph', card); ph.style.width = w + 'px'; ph.style.height = h + 'px'; ph.appendChild(img);
    if (caption) el('div', 'cap', card).textContent = caption;
    card.style.position = 'relative';
    gsap.fromTo(card, { opacity: 0, x: dir * 80, rotationY: dir * -65, transformPerspective: 1100, scale: .85 }, { opacity: 1, x: 0, rotationY: 0, rotation: rand(-2, 2), scale: 1, duration: .6 / SPEED, ease: 'power3.out' });
    gsap.fromTo(img, { scale: 1 }, { scale: 1.08, duration: 8, ease: 'none' });
    pv.style.visibility = i > 0 ? 'visible' : 'hidden'; nx.style.visibility = i < list.length - 1 ? 'visible' : 'hidden';
    Sound.sfx('page');
    if (Math.random() < .4) aside(RANDOM_LINES[Math.floor(rand(0, RANDOM_LINES.length))], { pose: Math.random() < .5 ? 'surprise' : 'wave', kid: null });
  };
  pv.onclick = e => { e.stopPropagation(); if (i > 0) { i--; show(-1); } };
  nx.onclick = e => { e.stopPropagation(); if (i < list.length - 1) { i++; show(1); } };
  const shut = () => { gsap.to(z, { opacity: 0, duration: .25, onComplete: () => z.remove() }); Elf.setPose('point'); };
  close.onclick = e => { e.stopPropagation(); shut(); };
  z.addEventListener('click', e => { if (e.target === z) shut(); });
  gsap.fromTo(z, { opacity: 0 }, { opacity: 1, duration: .25 });
  show(1);
}
async function chapterScene(ch, i) {
  const lineId = 'c' + (i + 1);
  await albumScene({ bg: CH_BG[Math.min(i, CH_BG.length - 1)], title: ch.title || `${i + 1}번째 이야기`, photos: ch.photos, caption: ch.title,
    intro: { id: lineId, text: ch.memo || L[lineId] || L.cN, voice: ch.memo ? `c${i + 1}_memo` : lineId, pose: 'point' }, sceneKey: 'ch' + i });
}

/* =============================================================
   여행 — 지도에서 골라 보기
   ============================================================= */
/* =============================================================
   여행 출발 — 하윤이가 길을 걸어가고 반짝이가 같이 날아감
   ============================================================= */
const HILL = (y1, y2, y3, c) => `<svg viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M0 ${y1} C180 ${y2} 320 ${y3} 500 ${y2 + 20} C680 ${y1 - 30} 820 ${y3} 1000 ${y2} L1000 300 L0 300Z" fill="${c}"/></svg>`;
async function journey(place) {
  clearStage(); FX.snow = 0;
  setBg(null);
  const art = placeArt(place.name), walkName = WALK_NAMES.find(n => S.lib.expressions[n]);
  const J = el('div', 'journey', stage());
  J.innerHTML = `<div class="jSky"></div><div class="jSun"></div>
    <div class="jCloud" style="top:8%;left:8%"></div><div class="jCloud" style="top:16%;left:62%;transform:scale(.7)"></div><div class="jCloud" style="top:4%;left:38%;transform:scale(.5)"></div>
    <div class="jDest">${art ? `<img src="${art}">` : `<div class="jDestTxt">${place.name}</div>`}</div>
    <div class="jHill far">${HILL(150, 90, 130, '#b9d9a6')}</div>
    <div class="jHill mid">${HILL(170, 120, 150, '#9ccb88')}</div>
    <div class="jRoadWrap"><div class="jRoad"></div></div>
    <div class="jBush l"></div><div class="jBush r"></div>
    <div class="jKidWrap"></div>`;
  const kidWrap = J.querySelector('.jKidWrap');
  if (walkName) { const im = el('img', 'jKid', kidWrap); im.src = await blobUrl(S.lib.expressions[walkName]); }
  gsap.fromTo(J, { opacity: 0 }, { opacity: 1, duration: .6 });
  // 반짝이는 하윤이 오른쪽 어깨 옆에서 출발
  Elf.place(walkName ? .56 : .42, .44); Elf.setPose('fly'); Elf.face(1); Elf.show(); $('elfWrap').classList.add('bob');
  const T = 8 / SPEED;
  const tl = gsap.timeline();
  tl.fromTo(J.querySelector('.jDest'), { scale: .32, y: '2vh' }, { scale: 1, y: '7vh', duration: T, ease: 'power1.in' }, 0)
    .to(J.querySelector('.jHill.far'), { scale: 1.18, duration: T, ease: 'none' }, 0)
    .to(J.querySelector('.jHill.mid'), { scale: 1.45, y: '4vh', duration: T, ease: 'none' }, 0)
    .to(J.querySelector('.jBush.l'), { scale: 2.6, x: '-26vw', opacity: 0, duration: T * .7, ease: 'power1.in' }, 0)
    .to(J.querySelector('.jBush.r'), { scale: 2.6, x: '26vw', opacity: 0, duration: T * .7, ease: 'power1.in' }, 0)
    .to(kidWrap, { scale: .5, y: '-17vh', duration: T, ease: 'sine.inOut' }, 0)
    .to('#elfWrap', { x: innerWidth * .5 + 5 * VH(), y: innerHeight * .26, scale: .6, duration: T, ease: 'sine.inOut' }, 0)
    .to(J.querySelectorAll('.jCloud'), { x: '-6vw', duration: T, ease: 'none' }, 0);
  aside('go1', { vars: { place: place.name }, voice: 'go1_' + place.name, pose: 'fly' });
  const mid = setTimeout(() => aside('go2', { vars: { place: place.name }, voice: 'go2_' + place.name, pose: 'surprise' }), T * 520);
  await new Promise(res => { tl.eventCallback('onComplete', res); tapResolver = () => { tl.progress(1); }; });
  tapResolver = null; clearTimeout(mid); asideToken++; hideBubble();
  // 도착: 반짝 빛나며 여행지 안으로
  FX.burst(innerWidth / 2, innerHeight * .3, 80); Sound.sfx('sparkle');
  const flash = el('div', 'flash', stage());
  await new Promise(r => gsap.fromTo(flash, { opacity: 0 }, { opacity: 1, duration: .45, yoyo: true, repeat: 1, onRepeat: () => { J.remove(); gsap.set('#elfWrap', { scale: 1 }); Elf.place(.0, .58); }, onComplete: () => { flash.remove(); r(); } }));
}

async function travelScene() {
  const places = S.lib.places.filter(p => p.albums.length);
  const dom = places.filter(p => p.region === '국내'), abroad = places.filter(p => p.region === '해외');
  await MapView.load();
  let firstTime = !S.visitedMap;
  S.visitedMap = true;
  for (;;) {
    clearStage(); setBg('night'); FX.snow = .15;
    const items = dom.map(p => ({ name: p.name, place: p, ll: PLACES[p.name] || null })).filter(it => it.ll);
    const unknown = dom.filter(p => !PLACES[p.name]);
    MapView.show(); MapView.korea(items, true);
    gsap.set('#map', { transformPerspective: 110 * VH(), rotationX: 34, scale: 1.12, y: '4vh', transformOrigin: '50% 72%' });
    await new Promise(r => requestAnimationFrame(r));
    // 기울어진 지도 위의 실제 화면 위치
    const scr = i => { const d = $('map').querySelector(`[data-dot="${i}"]`).getBoundingClientRect(); return [d.left + d.width / 2, d.top + d.height / 2]; };
    const home = scr('home'); items.forEach((it, i) => it.s = scr(i));
    const pins = layoutPins(items, home);
    let resolve; const chosen = new Promise(r => resolve = r);
    pins.forEach(it => it.node.addEventListener('click', () => resolve({ kind: 'dom', it })));
    const side = el('div', 'mapSide', stage());
    unknown.forEach(p => { const b = el('button', 'chip tappable', side); b.textContent = '🎒 ' + p.name; b.onclick = () => resolve({ kind: 'other', place: p }); });
    if (abroad.length) { const b = el('button', 'chip big tappable', side); b.textContent = '✈ 바다 건너'; b.onclick = () => resolve({ kind: 'abroad' }); }
    const back = backButton('🏠 추억 상자'); back.then(() => resolve({ kind: 'back' }));
    Elf.place(0.03, 0.16); Elf.setPose('wave'); Elf.show(); Shadow.on(innerHeight * .2);
    if (firstTime) {
      firstTime = false;
      const np = places.find(p => p.albums.some(a => a.isNew));
      aside(np ? 'newp' : 't04', np ? { vars: { place: np.name }, voice: 'new_' + np.name, pose: 'surprise' } : { pose: 'point' });
    } else aside('t04', { pose: 'point' });
    const c = await chosen; asideToken++; hideBubble();
    if (c.kind === 'back') { Shadow.off(); await MapView.hide(); return; }
    if (c.kind === 'abroad') { Shadow.off(); await globeScene(abroad); continue; }
    if (c.kind === 'other') { Shadow.off(); await MapView.hide(); await journey(c.place); await placeScene(c.place, '🗺 지도로'); continue; }
    // 고른 곳으로 날아가서 지도 안으로 들어가기
    const it = c.it; Sound.sfx('pop');
    await Elf.fly((it.px - Elf.size() * .2) / innerWidth, (it.py - Elf.size() * 1.1) / innerHeight, { dur: 1.8, end: 'point' });
    Shadow.off(); FX.burst(it.px, it.py, 34); Sound.sfx('sparkle');
    gsap.to('.pin,.homePin,.mapOverlay,.mapSide,.backBtn', { opacity: 0, duration: .5 });
    await new Promise(r => gsap.to('#map', { scale: 2.6, rotationX: 52, transformOrigin: `${it.p[0]}px ${it.p[1]}px`, opacity: 0, duration: 1.3 / SPEED, ease: 'power2.in', onComplete: r }));
    await MapView.hide();
    await journey(it.place);
    await say('place', { pose: 'surprise', vars: { place: it.name }, voice: 'place_' + it.name });
    await placeScene(it.place, '🗺 지도로');
  }
}
/* 반짝이 그림자 (지도 위) */
const Shadow = {
  el: null, ground: 0, fn: null,
  on(groundGap) {
    this.off(); this.el = el('div', 'elfShadow', stage());
    this.fn = () => { const r = $('elfWrap').getBoundingClientRect(); if (!this.el) return;
      gsap.set(this.el, { x: r.left + r.width * .5 - 5 * VH(), y: r.top + r.height * 1.02 + 2 * VH() }); };
    gsap.ticker.add(this.fn);
  },
  off() { if (this.fn) gsap.ticker.remove(this.fn); this.fn = null; if (this.el) this.el.remove(); this.el = null; }
};
/* 기울어진 지도 위에 서 있는 팻말 배치 */
function layoutPins(items, home) {
  const R = 7.6 * VH(), stem = 7 * VH();
  const ov = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ov.setAttribute('class', 'mapOverlay'); stage().appendChild(ov);
  items.forEach(it => { it.x = it.s[0]; it.y = it.s[1] - stem - R; });
  const fixed = { x: home[0], y: home[1] - 4 * VH(), r: 6 * VH() };
  for (let k = 0; k < 160; k++) {
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, need = R * 2.5;
      if (d < need) { const m = (need - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * m; a.y -= uy * m; b.x += ux * m; b.y += uy * m; }
    }
    for (const it of items) { const dx = it.x - fixed.x, dy = it.y - fixed.y, d = Math.hypot(dx, dy) || 1, need = R + fixed.r; if (d < need) { it.x += dx / d * (need - d); it.y += dy / d * (need - d); } }
    items.forEach(it => { it.x = Math.min(innerWidth - R * 1.2, Math.max(R * 1.2, it.x)); it.y = Math.min(innerHeight - R * 1.6, Math.max(R + 11 * VH(), it.y)); });
  }
  let svg = '';
  items.forEach(it => { svg += `<ellipse cx="${it.s[0]}" cy="${it.s[1]}" rx="${2.6 * VH()}" ry="${.9 * VH()}" fill="rgba(60,40,20,.28)"/>
    <line x1="${it.s[0]}" y1="${it.s[1]}" x2="${it.x}" y2="${it.y + R * .9}" stroke="#8a6a48" stroke-width="${.7 * VH()}" stroke-linecap="round"/>
    <circle cx="${it.s[0]}" cy="${it.s[1]}" r="${.8 * VH()}" fill="#e0574a"/>`; });
  svg += `<ellipse cx="${home[0]}" cy="${home[1]}" rx="${3 * VH()}" ry="${1 * VH()}" fill="rgba(60,40,20,.3)"/>`;
  ov.innerHTML = svg;
  const hp = el('div', 'homePin', stage()); hp.innerHTML = `<div class="hpLabel">우리 집</div><div class="hpIcon">🏠</div>`;
  Object.assign(hp.style, { left: home[0] + 'px', top: home[1] + 'px' });
  items.forEach((it, i) => {
    const pin = el('div', 'pin tappable', stage()); const art = placeArt(it.name);
    pin.innerHTML = (art ? `<img src="${art}">` : `<div class="pinTxt">🎒</div>`) + `<div class="pinLabel">${it.name}</div>`;
    if (it.place.albums.some(a => a.isNew)) el('span', 'newBadge', pin).textContent = 'NEW';
    Object.assign(pin.style, { left: it.x + 'px', top: it.y + 'px', width: R * 2 + 'px', height: R * 2 + 'px' });
    it.node = pin; it.px = it.x; it.py = it.y;
    gsap.fromTo(pin, { scale: 0, y: 20 }, { scale: 1, y: 0, duration: .6 / SPEED, delay: .15 * i, ease: 'back.out(2)' });
    gsap.to(pin, { y: '-=0.8vh', duration: 1.6 + i * .2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: .8 });
  });
  return items;
}
function addNewBadge(x, y) {
  const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g'); $('map').appendChild(g);
  g.innerHTML = `<rect x="${x - 3.4 * VH()}" y="${y - 1.8 * VH()}" rx="${1.8 * VH()}" width="${6.8 * VH()}" height="${3.6 * VH()}" fill="#e0574a"/>
    <text x="${x}" y="${y + 1.1 * VH()}" text-anchor="middle" font-size="${2.4 * VH()}" fill="#fff" font-family="Jua">NEW</text>`;
  g.style.pointerEvents = 'none';
}
async function placeScene(place, backLabel) {
  let album = place.albums[0];
  if (place.albums.length > 1) {
    clearStage(); setBg('night'); FX.snow = .2;
    Elf.fly(0.0, 0.58, { dur: 1.8, end: 'think' });
    const art = placeArt(place.name);
    const box = el('div', 'yearPick', stage());
    if (art) { const im = el('img', 'yearArt', box); im.src = art; }
    const row = el('div', 'yearRow', box);
    let resolve; const chosen = new Promise(r => resolve = r);
    place.albums.forEach(a => { const b = el('button', 'yearChip tappable', row); b.textContent = (a.year ? a.year + '년' : '그때');
      if (a.isNew) el('span', 'chipNew', b).textContent = 'NEW';
      b.onclick = () => { Sound.sfx('pop'); resolve(a); }; });
    const back = backButton(backLabel); back.then(() => resolve(null));
    gsap.fromTo('.yearChip', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: .1, duration: .5, ease: 'back.out(2)' });
    aside('y01', { pose: 'think', vars: { place: place.name } });
    album = await chosen; asideToken++; hideBubble();
    if (!album) return;
  }
  const cap = (album.year ? album.year + '년 ' : '') + place.name;
  await albumScene({ bg: 'night', shade: '', title: cap, photos: album.photos, caption: cap, backLabel,
    intro: album.memo ? { id: 'memo', text: album.memo, voice: `memo_${place.name}_${album.year}`, pose: 'wave' }
         : album.isNew ? { id: 'newp', vars: { place: place.name }, voice: 'new_' + place.name, pose: 'surprise' } : null,
    sceneKey: 'trip:' + place.name + album.year });
}
async function globeScene(abroad) {
  const W = innerWidth, H = innerHeight;
  await MapView.hide();
  for (;;) {
    clearStage(); setBg('night'); FX.snow = 0;
    const svg = $('map'); svg.classList.remove('hidden'); gsap.set(svg, { clearProps: 'transform' }); svg.style.opacity = 1; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const r = Math.min(W, H) * 0.40, cx = W * 0.55, cy = H * 0.50;
    const proj = d3.geoOrthographic().scale(r).translate([cx, cy]).clipAngle(90);
    const path = d3.geoPath(proj), grat = d3.geoGraticule10();
    const kr = MapView.world.features.filter(f => /Korea/.test(f.properties.name));
    const start = PLACES[HOME];
    const render = (rot, extra = '') => {
      proj.rotate(rot);
      let s = MapView.defs() + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ocean)"/><path d="${path(grat)}" fill="none" stroke="#fff" stroke-opacity=".25"/><g filter="url(#wc)">`;
      for (const f of MapView.world.features) { const d = path(f); if (d) s += `<path d="${d}" fill="${kr.includes(f) ? '#f2c66d' : '#cfe3a8'}" stroke="#8fae6a" stroke-width="1"/>`; }
      svg.innerHTML = s + `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow)"/>` + extra;
    };
    render([-start[0], -start[1]]);
    gsap.fromTo(svg, { opacity: 0, scale: .7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 1.2 / SPEED, ease: 'power2.out' });
    let resolve; const chosen = new Promise(r2 => resolve = r2);
    const side = el('div', 'mapSide', stage());
    abroad.forEach(p => { const b = el('button', 'chip big tappable', side); b.innerHTML = (placeArt(p.name) ? `<img src="${placeArt(p.name)}">` : '🧳 ') + p.name;
      if (p.albums.some(a => a.isNew)) el('span', 'chipNew', b).textContent = 'NEW';
      b.onclick = () => resolve(p); });
    const back = backButton('🗺 지도로'); back.then(() => resolve(null));
    Elf.place(0.02, 0.56); Elf.setPose('think'); Elf.show();
    aside('t03', { pose: 'think' });
    const p = await chosen; asideToken++; hideBubble();
    if (!p) { await MapView.hide(); return; }
    gsap.to('.chip,.backBtn', { opacity: 0, duration: .3 });
    const ll = PLACES[p.name];
    if (ll) {
      const mid = d3.geoInterpolate(start, ll)(0.5), o = { t: 0 }, from = [-start[0], -start[1]], to = [-mid[0], -mid[1]];
      await new Promise(res => gsap.to(o, { t: 1, duration: 3 / SPEED, ease: 'power2.inOut', onUpdate: () => render([from[0] + (to[0] - from[0]) * o.t, from[1] + (to[1] - from[1]) * o.t]), onComplete: res }));
      const interp = d3.geoInterpolate(start, ll), pts = d3.range(0, 1.0001, 0.02).map(t => proj(interp(t)));
      render(to, `<path d="M${pts.map(q => q.join(',')).join('L')}" fill="none" stroke="#e0574a" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/><circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="9" fill="#fff" stroke="#e0574a" stroke-width="4"/>`);
      Elf.place(pts[0][0] / W - 0.1, pts[0][1] / H - 0.25); Elf.setPose('fly'); Elf.face(pts[pts.length - 1][0] < pts[0][0] ? -1 : 1); Sound.sfx('whoosh');
      await new Promise(res => { const q = { i: 0 }; gsap.to(q, { i: pts.length - 1, duration: 4 / SPEED, ease: 'sine.inOut', onUpdate: () => {
        const a = pts[Math.floor(q.i)], b = pts[Math.min(pts.length - 1, Math.floor(q.i) + 1)], f = q.i % 1, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        gsap.set('#elfWrap', { x: x - Elf.size() * .5, y: y - Elf.size() * .75 }); FX.trail(x, y); }, onComplete: res }); });
      const end = pts[pts.length - 1]; Elf.pos = { fx: (end[0] - Elf.size() * .5) / W, fy: (end[1] - Elf.size() * .75) / H }; Elf.face(1);
      FX.burst(end[0], end[1], 40); Sound.sfx('sparkle');
      await pause(700);
    }
    await MapView.hide();
    await journey(p);
    await say('place', { pose: 'surprise', vars: { place: p.name }, voice: 'place_' + p.name });
    await placeScene(p, '🌏 지구본으로');
  }
}

/* =============================================================
   장면 4 — 에필로그
   ============================================================= */
async function epilogue() {
  clearStage(); setBg('xmas', 'soft'); FX.snow = 0.5;
  await Elf.fly(0.06, 0.40, { end: 'surprise' });
  await say('e01', { pose: 'surprise' });
  const trips = S.lib.places.reduce((n, p) => n + p.albums.length, 0);
  const card = el('div', 'statCard', stage());
  Object.assign(card.style, { top: '34%', left: '56%', width: 'min(60vw,96vh)' });
  card.innerHTML = `<h3>${fillText('{이름}이의 반짝이는 기록')}</h3><div class="stats">
    <div class="stat"><b id="s1">0</b><span>함께한 날</span></div>
    <div class="stat"><b id="s2">0</b><span>다녀온 여행</span></div>
    <div class="stat"><b id="s3">0</b><span>추억 사진</span></div>
    ${S.giftsFound ? `<div class="stat"><b id="s4">0</b><span>찾은 선물</span></div>` : ''}</div>`;
  gsap.fromTo(card, { opacity: 0, scale: .8, rotationX: -40, transformPerspective: 900 }, { opacity: 1, scale: 1, rotationX: 0, duration: .9, ease: 'back.out(1.6)' });
  const days = S.daysTotal || 0;
  const tick = (id, v) => { const o = { v: 0 }; gsap.to(o, { v, duration: 1.6 / SPEED, ease: 'power2.out', onUpdate: () => { const e = $(id); if (e) e.textContent = Math.round(o.v).toLocaleString(); } }); };
  const nWalk = WALK_NAMES.filter(n => S.lib.expressions[n]).length;
  tick('s1', days); tick('s2', trips); tick('s3', S.lib.photos - Object.keys(S.lib.expressions).length); if (S.giftsFound) tick('s4', S.giftsFound);
  Sound.sfx('sparkle'); Portrait.show('신남');
  await beat(4600);
  gsap.to(card, { opacity: 0, scale: .8, duration: .5, onComplete: () => card.remove() });
  await say('e02', { pose: 'bye' });
  await say('e03', { pose: 'bye' });
  await say('e04', { pose: 'wave' });
  await say('e05', { pose: 'wave' });
  FX.snow = 1;
  for (let i = 0; i < 6; i++) setTimeout(() => FX.burst(rand(.1, .9) * innerWidth, rand(.1, .5) * innerHeight, 30, rand(0, 360)), i * 300);
  await say('e06', { pose: 'wave', button: '↺ 처음으로' });
}
/* =============================================================
   전체 진행
   ============================================================= */
async function run(from = 'start') {
  if (S.running) return; S.running = true; S.giftsFound = 0; S.giftsTotal = 0;
  try {
    if (from === 'start') await prologue();
    if (S.daysTotal === undefined) { const [y, m, d] = S.settings.birth.split('-').map(Number); S.daysTotal = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d)) / 86400000); }
    await hub();
  } catch (e) { console.error(e); location.reload(); }
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
        `· 표정: ${Object.keys(lib.expressions).map(n => n + (lib.cutouts && lib.cutouts[n] ? '(오린 사진)' : '')).join(', ') || '없음'}`,
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
  // 부모 메뉴: 톱니를 2초 길게 누르기 또는 빠르게 5번 누르기 (태블릿 길게 누르기 오작동 대비)
  let hold = null, taps = [], down = 0; const g = $('gearBtn');
  const openParent = () => { clearTimeout(hold); g.classList.remove('holding'); taps = []; $('libSummary').innerHTML = libSummary(); $('parentLayer').classList.remove('hidden'); };
  g.addEventListener('contextmenu', e => e.preventDefault());
  g.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); down = Date.now(); g.classList.add('holding'); clearTimeout(hold); hold = setTimeout(openParent, 1800);
    const now = Date.now(); taps = taps.filter(t => now - t < 2500); taps.push(now); if (taps.length >= 5) openParent(); });
  g.addEventListener('pointerup', () => { clearTimeout(hold); g.classList.remove('holding'); });
  $('pmClose').onclick = () => $('parentLayer').classList.add('hidden');
  $('pmSetup').onclick = () => { $('parentLayer').classList.add('hidden'); $('startLayer').classList.add('hidden'); $('importReport').innerHTML = ''; $('progress').classList.add('hidden'); openSetup(true); };
  $('pmRestart').onclick = () => location.reload();
  $('pmJump').onclick = () => { $('parentLayer').classList.add('hidden'); $('startLayer').classList.add('hidden'); Sound.unlock(); Sound.startBgm(); run('hub'); };
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

/**
 * Figma Plugin API 목(mock). code.js 를 실제로 실행해서
 * 오타·잘못된 API 호출·존재하지 않는 프로퍼티를 잡아낸다.
 * (Figma의 레이아웃 계산까지 재현하지는 않는다.)
 */
const fs = require('fs');
const vm = require('vm');

const known = new Set([
  'name', 'type', 'layoutMode', 'primaryAxisSizingMode', 'counterAxisSizingMode',
  'itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fills', 'strokes', 'strokeWeight', 'strokeAlign', 'dashPattern', 'cornerRadius',
  'counterAxisAlignItems', 'primaryAxisAlignItems', 'effects', 'opacity',
  'layoutAlign', 'layoutGrow', 'clipsContent', 'constrainProportions',
  'textAutoResize', 'fontName', 'characters', 'fontSize', 'lineHeight',
  'letterSpacing', 'textDecoration', 'textAlignHorizontal', 'backgrounds',
  'width', 'height', 'x', 'y', 'children', 'parent', 'visible', 'locked',
]);

const VALID = {
  layoutMode: ['NONE', 'HORIZONTAL', 'VERTICAL'],
  primaryAxisSizingMode: ['FIXED', 'AUTO'],
  counterAxisSizingMode: ['FIXED', 'AUTO'],
  counterAxisAlignItems: ['MIN', 'CENTER', 'MAX', 'BASELINE'],
  primaryAxisAlignItems: ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'],
  layoutAlign: ['MIN', 'CENTER', 'MAX', 'STRETCH', 'INHERIT'],
  textAutoResize: ['NONE', 'WIDTH_AND_HEIGHT', 'HEIGHT', 'TRUNCATE'],
  strokeAlign: ['INSIDE', 'OUTSIDE', 'CENTER'],
  textDecoration: ['NONE', 'UNDERLINE', 'STRIKETHROUGH'],
  textAlignHorizontal: ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED'],
};

const problems = [];
let idSeq = 0;

function makeNode(type, w = 100, h = 100) {
  const state = {
    type,
    id: `${type}:${++idSeq}`,
    name: type,
    width: w,
    height: h,
    children: [],
    parent: null,
    fills: [],
    strokes: [],
    effects: [],
    opacity: 1,
    layoutMode: 'NONE',
    primaryAxisSizingMode: 'AUTO',
    counterAxisSizingMode: 'AUTO',
    itemSpacing: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    counterAxisAlignItems: 'MIN',
    primaryAxisAlignItems: 'MIN',
    layoutAlign: 'INHERIT',
    layoutGrow: 0,
    strokeWeight: 1,
    cornerRadius: 0,
    clipsContent: true,
    characters: '',
    fontSize: 12,
    textAutoResize: 'WIDTH_AND_HEIGHT',
    textDecoration: 'NONE',
    textAlignHorizontal: 'LEFT',
    fontName: { family: 'Inter', style: 'Regular' },
  };

  const methods = {
    resize(nw, nh) {
      if (typeof nw !== 'number' || typeof nh !== 'number' || Number.isNaN(nw) || Number.isNaN(nh)) {
        problems.push(`${state.name}: resize(${nw}, ${nh}) — 숫자가 아님`);
        return;
      }
      if (nw <= 0 || nh <= 0) problems.push(`${state.name}: resize(${nw}, ${nh}) — 0 이하`);
      state.width = nw;
      state.height = nh;
    },
    rescale(scale) {
      if (typeof scale !== 'number' || !Number.isFinite(scale) || scale <= 0) {
        problems.push(`${state.name}: rescale(${scale}) — 유효하지 않은 배율`);
        return;
      }
      state.width *= scale;
      state.height *= scale;
    },
    appendChild(child) {
      if (!child) { problems.push(`${state.name}: appendChild(undefined)`); return; }
      if (child.parent) {
        const sibs = child.parent.children;
        const i = sibs.indexOf(child);
        if (i >= 0) sibs.splice(i, 1);
      }
      state.children.push(child);
      child.parent = proxy;
    },
    remove() {
      if (state.parent) {
        const sibs = state.parent.children;
        const i = sibs.indexOf(proxy);
        if (i >= 0) sibs.splice(i, 1);
      }
    },
    findAll(pred) {
      const out = [];
      const walk = (n) => {
        (n.children || []).forEach((k) => {
          if (!pred || pred(k)) out.push(k);
          walk(k);
        });
      };
      walk(proxy);
      return out;
    },
    findOne(pred) { return methods.findAll(pred)[0] || null; },
  };

  const proxy = new Proxy(state, {
    get(t, prop) {
      if (prop in methods) return methods[prop];
      if (prop === 'then') return undefined; // await 대상 오인 방지
      if (typeof prop === 'symbol') return t[prop];
      if (!(prop in t) && !known.has(prop)) {
        problems.push(`${t.name}: 존재하지 않는 프로퍼티 읽기 "${String(prop)}"`);
      }
      return t[prop];
    },
    set(t, prop, value) {
      if (typeof prop !== 'symbol' && !known.has(prop) && !(prop in t)) {
        problems.push(`${t.name}: 존재하지 않는 프로퍼티 쓰기 "${String(prop)}"`);
      }
      if (VALID[prop] && !VALID[prop].includes(value)) {
        problems.push(`${t.name}: ${String(prop)} = "${value}" — 허용값 아님 (${VALID[prop].join('|')})`);
      }
      if (prop === 'fills' || prop === 'strokes' || prop === 'backgrounds') {
        if (!Array.isArray(value)) problems.push(`${t.name}: ${String(prop)} 는 배열이어야 함`);
        else value.forEach((p) => {
          if (p.type === 'SOLID') {
            const { r, g, b } = p.color || {};
            [r, g, b].forEach((v, i) => {
              if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 1) {
                problems.push(`${t.name}: ${String(prop)} 색상 채널 ${'rgb'[i]}=${v} (0~1 아님)`);
              }
            });
          }
        });
      }
      if (prop === 'characters' && typeof value !== 'string') {
        problems.push(`${t.name}: characters 가 문자열이 아님 (${typeof value})`);
      }
      if ((prop === 'fontSize' || prop === 'itemSpacing' || prop === 'cornerRadius') &&
          (typeof value !== 'number' || Number.isNaN(value))) {
        problems.push(`${t.name}: ${String(prop)} = ${value} — 숫자가 아님`);
      }
      if (prop === 'characters' && !loadedFonts.has(fontKey(t.fontName))) {
        problems.push(`${t.name}: 폰트 미로드 상태에서 characters 설정 (${fontKey(t.fontName)})`);
      }
      t[prop] = value;
      return true;
    },
  });

  return proxy;
}

const loadedFonts = new Set();
const fontKey = (f) => (f ? `${f.family}/${f.style}` : 'none');

// 매우 단순한 SVG 파서 — 도형 개수만큼 자식 노드를 만든다
function nodeFromSvg(svg) {
  const m = svg.match(/width="(\d+(?:\.\d+)?)"[^>]*height="(\d+(?:\.\d+)?)"/);
  const w = m ? Number(m[1]) : 24;
  const h = m ? Number(m[2]) : 24;
  const frame = makeNode('FRAME', w, h);
  frame.name = 'svg';
  const shapes = svg.match(/<(path|rect|circle|ellipse|line|polygon)\b/g) || [];
  if (shapes.length === 0) problems.push('createNodeFromSvg: 도형이 없는 SVG');
  shapes.forEach((tag, i) => {
    const child = makeNode('VECTOR', w, h);
    child.name = `${tag.slice(1)}-${i}`;
    child.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
    frame.appendChild(child);
  });
  return frame;
}

const pages = [];
const paintStyles = [];
const textStyles = [];
let closed = null;

const figma = {
  createFrame: () => makeNode('FRAME'),
  createText: () => {
    const t = makeNode('TEXT', 50, 20);
    t.name = 'Text';
    return t;
  },
  createRectangle: () => makeNode('RECTANGLE'),
  createEllipse: () => makeNode('ELLIPSE'),
  createComponent: () => makeNode('COMPONENT'),
  createNodeFromSvg: nodeFromSvg,
  createPage: () => {
    const p = makeNode('PAGE', 0, 0);
    p.name = 'Page';
    pages.push(p);
    return p;
  },
  createPaintStyle: () => {
    const s = { name: '', paints: [], type: 'PAINT' };
    paintStyles.push(s);
    return s;
  },
  createTextStyle: () => {
    const s = { name: '', fontName: null, fontSize: 0, lineHeight: null, letterSpacing: null, type: 'TEXT' };
    textStyles.push(s);
    return s;
  },
  combineAsVariants: (comps, parent) => {
    const set = makeNode('COMPONENT_SET');
    comps.forEach((c) => set.appendChild(c));
    parent.appendChild(set);
    return set;
  },
  loadFontAsync: async (f) => { loadedFonts.add(fontKey(f)); },
  loadAllPagesAsync: async () => {},
  setCurrentPageAsync: async (p) => { figma.currentPage = p; },
  currentPage: null,
  root: { children: pages },
  viewport: {
    scrollAndZoomIntoView: (nodes) => {
      if (!Array.isArray(nodes) || nodes.length === 0) problems.push('scrollAndZoomIntoView: 빈 배열');
    },
  },
  closePlugin: (msg) => { closed = msg; },
  notify: () => {},
};

figma.currentPage = figma.createPage();
figma.currentPage.name = 'Page 1';

const code = fs.readFileSync(`${__dirname}/code.js`, 'utf8');
const sandbox = { figma, console, setTimeout, Promise, Object, Array, Math, JSON, String, Number, parseInt, isNaN };
vm.createContext(sandbox);

(async () => {
  try {
    vm.runInContext(code, sandbox, { filename: 'code.js' });
    // main() 의 async 체인이 끝나기를 기다린다
    await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    problems.push(`실행 중 예외: ${err.stack}`);
  }

  // 결과 집계
  const countNodes = (n) => 1 + (n.children || []).reduce((a, k) => a + countNodes(k), 0);
  const total = pages.reduce((a, p) => a + countNodes(p), 0);

  console.log('=== 실행 결과 ===');
  console.log('closePlugin:', closed);
  console.log('페이지:', pages.map((p) => p.name).join(' | '));
  console.log('노드 총계:', total);
  console.log('Paint 스타일:', paintStyles.length, '| Text 스타일:', textStyles.length);

  const screensPage = pages.find((p) => p.name.includes('Screens'));
  if (screensPage) {
    const frames = screensPage.findAll((n) => n.type === 'FRAME' && /^\d\d[a-z]? · /.test(n.name));
    console.log('화면 프레임:', frames.length);
    const sizes = new Set(frames.map((f) => `${f.width}x${f.height}`));
    console.log('화면 크기:', [...sizes].join(', '));
    console.log('화면 목록:', [...new Set(frames.map((f) => f.name))].join(' / '));
  }

  const comps = pages.reduce((a, p) => a.concat(p.findAll((n) => n.type === 'COMPONENT')), []);
  console.log('컴포넌트:', comps.length, '→', comps.map((c) => c.name).join(', '));

  console.log('\n=== 문제 ===');
  if (problems.length === 0) console.log('없음 ✅');
  else {
    const uniq = [...new Set(problems)];
    uniq.slice(0, 40).forEach((p) => console.log(' -', p));
    if (uniq.length > 40) console.log(`... 외 ${uniq.length - 40}건`);
  }
  process.exit(problems.length ? 1 : 0);
})();

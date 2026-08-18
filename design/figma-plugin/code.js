/**
 * 양파마켓 Design System — Figma 플러그인
 *
 * mobile/ 의 React Native 코드와 같은 토큰·컴포넌트·화면을 Figma 레이어로 생성한다.
 * src/theme.ts 의 색상 값과 각 화면의 레이아웃 수치를 그대로 옮겨왔으므로
 * 디자인과 구현이 어긋나지 않는다.
 *
 * 실행: Figma > Plugins > Development > Import plugin from manifest… > manifest.json
 */

/* ------------------------------------------------------------------ *
 * 1. 디자인 토큰 — mobile/src/theme.ts 와 1:1
 * ------------------------------------------------------------------ */

var LIGHT = {
  bg: '#ffffff',
  surface: '#fafafa',
  surface2: '#f4f4f5',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  text: '#18181b',
  text2: '#52525b',
  text3: '#a1a1aa',
  accent: '#18181b',
  accentText: '#ffffff',
  accentSoft: '#f4f4f5',
  danger: '#b91c1c',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  ok: '#166534',
  okBg: '#f0fdf4',
  okBorder: '#bbf7d0',
  warn: '#92400e',
  warnBg: '#fffbeb',
  warnBorder: '#fde68a'
};

var DARK = {
  bg: '#09090b',
  surface: '#111113',
  surface2: '#18181b',
  border: '#27272a',
  borderStrong: '#3f3f46',
  text: '#fafafa',
  text2: '#a1a1aa',
  text3: '#71717a',
  accent: '#fafafa',
  accentText: '#09090b',
  accentSoft: '#1c1c1f',
  danger: '#f87171',
  dangerBg: '#1a1113',
  dangerBorder: '#4a2326',
  ok: '#4ade80',
  okBg: '#0e1a12',
  okBorder: '#1f4429',
  warn: '#fbbf24',
  warnBg: '#1c1508',
  warnBorder: '#4a3a12'
};

var RADIUS = { lg: 16, md: 12, sm: 8, xs: 6 };
var SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

// 화면 크기 — iPhone 14/15 (390 x 844), 상태바 47 / 헤더 44 / 홈 인디케이터 34
var SCREEN = { w: 390, h: 844, statusBar: 47, header: 44, homeBar: 34 };

var TYPE = {
  screenTitle: { size: 22, weight: 'Semi Bold', ls: -0.4, lh: 28 },
  headerTitle: { size: 17, weight: 'Semi Bold', ls: -0.3, lh: 22 },
  price: { size: 24, weight: 'Bold', ls: -0.6, lh: 30 },
  body: { size: 15, weight: 'Regular', ls: 0, lh: 24 },
  cardTitle: { size: 15, weight: 'Semi Bold', ls: -0.3, lh: 20 },
  tileTitle: { size: 14.5, weight: 'Semi Bold', ls: -0.3, lh: 19 },
  button: { size: 14, weight: 'Medium', ls: 0, lh: 18 },
  label: { size: 13, weight: 'Medium', ls: -0.1, lh: 17 },
  small: { size: 13.5, weight: 'Regular', ls: 0, lh: 20 },
  meta: { size: 12, weight: 'Regular', ls: 0, lh: 16 },
  micro: { size: 11.5, weight: 'Regular', ls: 0, lh: 15 }
};

/* ------------------------------------------------------------------ *
 * 2. 저수준 헬퍼
 * ------------------------------------------------------------------ */

function hexToRgb(hex) {
  var s = hex.replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  return {
    r: parseInt(s.slice(0, 2), 16) / 255,
    g: parseInt(s.slice(2, 4), 16) / 255,
    b: parseInt(s.slice(4, 6), 16) / 255
  };
}

function solid(hex, opacity) {
  return [{ type: 'SOLID', color: hexToRgb(hex), opacity: opacity === undefined ? 1 : opacity }];
}

/** 오토레이아웃 프레임. o = { gap, pad|[t,r,b,l], fill, stroke, radius, align, justify, w, h } */
function auto(name, direction, o) {
  o = o || {};
  var f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction;
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.itemSpacing = o.gap || 0;
  f.clipsContent = o.clip === undefined ? true : o.clip;

  var pad = o.pad || 0;
  if (typeof pad === 'number') pad = [pad, pad, pad, pad];
  f.paddingTop = pad[0];
  f.paddingRight = pad[1];
  f.paddingBottom = pad[2];
  f.paddingLeft = pad[3];

  f.fills = o.fill ? solid(o.fill) : [];
  if (o.stroke) {
    f.strokes = solid(o.stroke);
    f.strokeWeight = o.strokeWeight || 1;
    f.strokeAlign = 'INSIDE';
    if (o.dashed) f.dashPattern = [5, 4];
  }
  if (o.radius) f.cornerRadius = o.radius;
  if (o.align) f.counterAxisAlignItems = o.align; // MIN | CENTER | MAX
  if (o.justify) f.primaryAxisAlignItems = o.justify; // MIN | CENTER | MAX | SPACE_BETWEEN

  if (o.w) {
    f.counterAxisSizingMode = direction === 'VERTICAL' ? 'FIXED' : f.counterAxisSizingMode;
    f.primaryAxisSizingMode = direction === 'HORIZONTAL' ? 'FIXED' : f.primaryAxisSizingMode;
    f.resize(o.w, f.height || 1);
  }
  if (o.h) {
    f.primaryAxisSizingMode = direction === 'VERTICAL' ? 'FIXED' : f.primaryAxisSizingMode;
    f.counterAxisSizingMode = direction === 'HORIZONTAL' ? 'FIXED' : f.counterAxisSizingMode;
    f.resize(f.width || 1, o.h);
  }
  return f;
}

/** 자식을 부모 폭에 꽉 채운다 */
function stretch(node) {
  node.layoutAlign = 'STRETCH';
  return node;
}

/** 남는 공간을 차지한다 (flex: 1) */
function grow(node) {
  node.layoutGrow = 1;
  return node;
}

function text(chars, o) {
  o = o || {};
  var style = o.type || TYPE.body;
  var t = figma.createText();
  t.fontName = { family: 'Inter', style: o.weight || style.weight };
  t.characters = chars;
  t.fontSize = style.size;
  t.lineHeight = { unit: 'PIXELS', value: style.lh };
  t.letterSpacing = { unit: 'PIXELS', value: style.ls };
  t.fills = solid(o.color || '#000000');
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.w) {
    t.textAutoResize = 'HEIGHT';
    t.resize(o.w, t.height);
  } else {
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  return t;
}

function rect(w, h, o) {
  o = o || {};
  var r = figma.createRectangle();
  r.resize(w, h);
  r.fills = o.fill ? solid(o.fill) : [];
  if (o.stroke) {
    r.strokes = solid(o.stroke);
    r.strokeWeight = o.strokeWeight || 1;
    r.strokeAlign = 'INSIDE';
  }
  if (o.radius) r.cornerRadius = o.radius;
  if (o.name) r.name = o.name;
  return r;
}

/** SVG를 벡터로 넣고 stroke 색을 테마에 맞춰 덮어쓴다 */
function svgIcon(name, svg, color, size) {
  var node = figma.createNodeFromSvg(svg);
  node.name = name;
  var targets = node.findAll(function (n) {
    return 'strokes' in n;
  });
  targets.forEach(function (n) {
    if (n.strokes && n.strokes.length) n.strokes = solid(color);
    if (n.fills && n.fills.length && n.fills[0].type === 'SOLID') n.fills = solid(color);
  });
  if (size && node.width) node.rescale(size / node.width);
  return node;
}

/* ------------------------------------------------------------------ *
 * 3. 아이콘 (fe/src/components 의 SVG 재사용)
 * ------------------------------------------------------------------ */

var LOGO_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.4" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 6.4c.2-1.8 1.5-3.2 3.4-3.6"/>' +
  '<path d="M12 6.4c-.5-1.5-1.8-2.5-3.4-2.7"/>' +
  '<path d="M12 6.2c4.9 3 6.6 6.9 4.9 10.1-1.1 2-3 2.9-4.9 2.9s-3.8-.9-4.9-2.9C5.4 13.1 7.1 9.2 12 6.2Z"/>' +
  '<path d="M12 9.9c2 1.9 2.7 4.2 1.8 6-.4.8-1.1 1.2-1.8 1.2s-1.4-.4-1.8-1.2c-.9-1.8-.2-4.1 1.8-6Z"/>' +
  '</svg>';

var SEARCH_SVG =
  '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#000" stroke-width="1.8">' +
  '<circle cx="9" cy="9" r="6"/><path d="m13.5 13.5 3.5 3.5" stroke-linecap="round"/></svg>';

var GRID_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/>' +
  '<rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/>' +
  '<rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/>' +
  '<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>';

var LIST_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="4.5" width="18" height="4" rx="1.5"/>' +
  '<rect x="3" y="12" width="18" height="4" rx="1.5"/>' +
  '<path d="M3 19.5h18"/></svg>';

var HEART_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.7" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 20.3 4.2 12.5a4.8 4.8 0 0 1 6.8-6.8l1 1 1-1a4.8 4.8 0 1 1 6.8 6.8Z"/></svg>';

var HEART_FILLED_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="#000" stroke="none">' +
  '<path d="M12 20.3 4.2 12.5a4.8 4.8 0 0 1 6.8-6.8l1 1 1-1a4.8 4.8 0 1 1 6.8 6.8Z"/></svg>';

var HOUSE_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.7" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20Z"/></svg>';

var PERSON_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.7" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/></svg>';

var TRASH_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

var BACK_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';

var PLUS_SVG =
  '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#000" stroke-width="1.8" ' +
  'stroke-linecap="round"><path d="M14 3v22M3 14h22"/></svg>';

/* ------------------------------------------------------------------ *
 * 4. UI 프리미티브 — RN 컴포넌트와 대응
 * ------------------------------------------------------------------ */

/** components/Button.tsx */
function button(label, c, o) {
  o = o || {};
  var isPrimary = o.variant !== 'ghost';
  var vpad = o.compact ? 8 : 12;
  var hpad = o.compact ? 12 : 16;

  var f = auto('Button / ' + (isPrimary ? 'Primary' : 'Ghost'), 'HORIZONTAL', {
    gap: 8,
    pad: [vpad, hpad, vpad, hpad],
    fill: isPrimary ? c.accent : o.active ? c.surface2 : undefined,
    stroke: isPrimary ? c.accent : c.borderStrong,
    radius: RADIUS.sm,
    align: 'CENTER',
    justify: 'CENTER'
  });
  if (!isPrimary && !o.active) f.fills = [];
  f.appendChild(text(label, { type: TYPE.button, color: isPrimary ? c.accentText : c.text }));
  if (o.disabled) f.opacity = 0.5;
  return f;
}

/** components/Field.tsx */
function field(label, value, c, o) {
  o = o || {};
  var wrap = auto('Field / ' + label, 'VERTICAL', { gap: 7 });
  wrap.appendChild(text(label, { type: TYPE.label, color: c.text2 }));

  var box = auto('Input', 'HORIZONTAL', {
    pad: [11, 12, 11, 12],
    fill: c.bg,
    stroke: o.focused ? c.text2 : c.borderStrong,
    radius: RADIUS.sm,
    align: 'CENTER'
  });
  box.layoutAlign = 'STRETCH';
  box.primaryAxisSizingMode = 'FIXED';
  if (o.multiline) {
    box.counterAxisSizingMode = 'FIXED';
    box.resize(box.width || 1, 112);
    box.counterAxisAlignItems = 'MIN';
  }
  var t = text(value, { type: TYPE.body, color: o.placeholder ? c.text3 : c.text });
  grow(t);
  t.textAutoResize = 'HEIGHT';
  box.appendChild(t);
  wrap.appendChild(box);
  return wrap;
}

/** components/Alert.tsx */
function alert(message, tone, c) {
  var palette = {
    error: { fg: c.danger, bg: c.dangerBg, border: c.dangerBorder },
    warn: { fg: c.warn, bg: c.warnBg, border: c.warnBorder },
    ok: { fg: c.ok, bg: c.okBg, border: c.okBorder }
  }[tone || 'error'];

  var f = auto('Alert / ' + (tone || 'error'), 'HORIZONTAL', {
    pad: [10, 12, 10, 12],
    fill: palette.bg,
    stroke: palette.border,
    radius: RADIUS.sm
  });
  var t = text(message, { type: TYPE.small, color: palette.fg });
  grow(t);
  t.textAutoResize = 'HEIGHT';
  f.appendChild(t);
  return f;
}

/** components/ViewToggle.tsx */
function viewToggle(c, active) {
  var f = auto('ViewToggle', 'HORIZONTAL', {
    stroke: c.borderStrong,
    radius: RADIUS.sm,
    fill: c.bg
  });
  [['card', GRID_SVG], ['list', LIST_SVG]].forEach(function (pair) {
    var isActive = active === pair[0];
    var btn = auto('Btn / ' + pair[0], 'HORIZONTAL', {
      pad: [8, 10, 8, 10],
      fill: isActive ? c.surface2 : undefined,
      align: 'CENTER',
      justify: 'CENTER'
    });
    if (!isActive) btn.fills = [];
    btn.appendChild(svgIcon(pair[0], pair[1], isActive ? c.text : c.text3, 17));
    f.appendChild(btn);
  });
  return f;
}

/** components/SearchBar.tsx */
function searchBar(value, c, o) {
  o = o || {};
  var f = auto('SearchBar', 'HORIZONTAL', {
    gap: 8,
    pad: [11, 12, 11, 12],
    fill: c.surface,
    stroke: c.borderStrong,
    radius: RADIUS.sm,
    align: 'CENTER'
  });
  f.appendChild(svgIcon('search', SEARCH_SVG, c.text3, 17));
  var t = text(value || '상품명으로 검색', {
    type: TYPE.body,
    color: o.filled ? c.text : c.text3
  });
  grow(t);
  t.textAutoResize = 'HEIGHT';
  f.appendChild(t);

  if (o.filled) {
    var clear = auto('Clear', 'HORIZONTAL', {
      fill: c.surface2,
      radius: 10,
      align: 'CENTER',
      justify: 'CENTER',
      w: 20,
      h: 20
    });
    clear.appendChild(text('×', { type: TYPE.label, color: c.text2 }));
    f.appendChild(clear);
  }
  return f;
}

/** 사진 위에 얹히는 찜 버튼 (components/HeartButton.tsx, variant="overlay") */
function heartChip(favorited) {
  var f = auto('HeartButton', 'HORIZONTAL', {
    radius: 16,
    align: 'CENTER',
    justify: 'CENTER',
    w: 32,
    h: 32
  });
  f.fills = [{ type: 'SOLID', color: hexToRgb('#000000'), opacity: 0.35 }];
  f.appendChild(
    svgIcon('heart', favorited ? HEART_FILLED_SVG : HEART_SVG, favorited ? '#ef4444' : '#ffffff', 20)
  );
  return f;
}

/**
 * 하단 탭바 — 홈 / 찜 / + / 마이.
 * 가운데 + 는 탭이 아니라 행동이라 원형 버튼으로 그린다.
 */
function tabBar(c, active) {
  var wrap = auto('Tab bar', 'VERTICAL', { w: SCREEN.w, fill: c.bg });
  wrap.layoutAlign = 'STRETCH';
  wrap.appendChild(stretch(rect(SCREEN.w, 1, { fill: c.border, name: 'top border' })));

  var row = auto('Tabs', 'HORIZONTAL', {
    pad: [8, 0, 8, 0],
    align: 'CENTER',
    justify: 'CENTER',
    w: SCREEN.w,
    h: 56
  });
  row.layoutAlign = 'STRETCH';

  function tab(key, label, svg, filledSvg) {
    var isActive = active === key;
    var color = isActive ? c.text : c.text3;
    var item = auto('Tab / ' + label, 'VERTICAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
    grow(item);
    item.appendChild(svgIcon(key, isActive && filledSvg ? filledSvg : svg, color, 23));
    item.appendChild(text(label, { type: TYPE.micro, weight: 'Medium', color: color }));
    return item;
  }

  row.appendChild(tab('home', '홈', HOUSE_SVG));
  row.appendChild(tab('favorites', '찜', HEART_SVG, HEART_FILLED_SVG));

  var plusWrap = auto('Tab / 등록', 'VERTICAL', { align: 'CENTER', justify: 'CENTER' });
  grow(plusWrap);
  var plus = auto('Plus button', 'HORIZONTAL', {
    fill: c.accent,
    radius: 24,
    align: 'CENTER',
    justify: 'CENTER',
    w: 48,
    h: 48
  });
  plus.appendChild(svgIcon('plus', PLUS_SVG, c.accentText, 26));
  plusWrap.appendChild(plus);
  row.appendChild(plusWrap);

  row.appendChild(tab('my', '마이', PERSON_SVG));
  wrap.appendChild(row);
  return wrap;
}

/** 이미지 자리표시자 */
function photo(w, h, c, r) {
  var f = auto('Photo', 'HORIZONTAL', {
    fill: c.surface2,
    radius: r === undefined ? 0 : r,
    align: 'CENTER',
    justify: 'CENTER',
    w: w,
    h: h
  });
  f.appendChild(text('IMG', { type: TYPE.meta, color: c.text3 }));
  return f;
}

/** SaleList 카드 타일 */
function tile(name, price, email, c, w, favorited) {
  var f = auto('Tile', 'VERTICAL', {
    fill: c.bg,
    stroke: c.border,
    radius: RADIUS.md,
    w: w
  });

  // 사진 + 우하단 하트. 하트는 절대배치라 사진 프레임의 오토레이아웃을 끈다.
  var media = photo(w, w, c, 0);
  media.layoutAlign = 'STRETCH';
  media.layoutMode = 'NONE';
  var chip = heartChip(Boolean(favorited));
  media.appendChild(chip);
  chip.x = w - 40;
  chip.y = w - 40;
  f.appendChild(media);

  var body = auto('Body', 'VERTICAL', { gap: 3, pad: 12 });
  body.layoutAlign = 'STRETCH';
  body.primaryAxisSizingMode = 'AUTO';
  body.appendChild(text(name, { type: TYPE.tileTitle, color: c.text }));
  body.appendChild(text(price, { type: TYPE.cardTitle, color: c.text }));
  body.appendChild(text(email, { type: TYPE.meta, color: c.text3 }));
  f.appendChild(body);
  return f;
}

/** SaleList 리스트 행 */
function row(name, desc, email, date, price, c, w) {
  var f = auto('Row', 'HORIZONTAL', {
    gap: 12,
    pad: 12,
    fill: c.bg,
    stroke: c.border,
    radius: RADIUS.md,
    align: 'CENTER',
    w: w
  });
  f.appendChild(photo(76, 76, c, RADIUS.sm));

  var body = auto('Body', 'VERTICAL', { gap: 3 });
  grow(body);
  body.counterAxisSizingMode = 'FIXED';
  body.appendChild(stretch(text(name, { type: TYPE.cardTitle, color: c.text })));
  body.appendChild(stretch(text(desc, { type: TYPE.meta, color: c.text2 })));

  var meta = auto('Meta', 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  meta.appendChild(text(email, { type: TYPE.meta, color: c.text3 }));
  var dot = figma.createEllipse();
  dot.resize(3, 3);
  dot.fills = solid(c.text3);
  dot.name = 'dot';
  meta.appendChild(dot);
  meta.appendChild(text(date, { type: TYPE.meta, color: c.text3 }));
  body.appendChild(meta);

  f.appendChild(body);
  f.appendChild(text(price, { type: TYPE.cardTitle, color: c.text }));
  return f;
}

/** components/Card.tsx */
function card(c, gap) {
  var f = auto('Card', 'VERTICAL', {
    gap: gap === undefined ? 18 : gap,
    pad: 24,
    fill: c.bg,
    stroke: c.border,
    radius: RADIUS.md
  });
  f.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0.09, g: 0.09, b: 0.11, a: 0.06 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL'
    }
  ];
  return f;
}

/* ------------------------------------------------------------------ *
 * 5. 화면 셸 (상태바 / 네비게이션 헤더 / 홈 인디케이터)
 * ------------------------------------------------------------------ */

function statusBar(c) {
  var f = auto('Status bar', 'HORIZONTAL', {
    pad: [0, 24, 0, 28],
    align: 'CENTER',
    justify: 'SPACE_BETWEEN',
    w: SCREEN.w,
    h: SCREEN.statusBar
  });
  f.layoutAlign = 'STRETCH';
  f.appendChild(text('9:41', { type: TYPE.label, weight: 'Semi Bold', color: c.text }));
  var right = auto('Indicators', 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  right.appendChild(rect(17, 11, { fill: c.text, radius: 2, name: 'cellular' }));
  right.appendChild(rect(15, 11, { fill: c.text, radius: 2, name: 'wifi' }));
  right.appendChild(rect(24, 11, { fill: c.text, radius: 3, name: 'battery' }));
  f.appendChild(right);
  return f;
}

function homeBar(c) {
  var f = auto('Home indicator', 'HORIZONTAL', {
    align: 'CENTER',
    justify: 'CENTER',
    w: SCREEN.w,
    h: SCREEN.homeBar
  });
  f.layoutAlign = 'STRETCH';
  f.appendChild(rect(134, 5, { fill: c.text, radius: 3, name: 'bar' }));
  return f;
}

/** 좌: 뒤로가기 or 로고 / 중앙: 제목 / 우: 액션 */
function navHeader(c, o) {
  o = o || {};
  var f = auto('Header', 'HORIZONTAL', {
    pad: [0, 16, 0, 12],
    gap: 8,
    align: 'CENTER',
    justify: 'SPACE_BETWEEN',
    w: SCREEN.w,
    h: SCREEN.header
  });
  f.layoutAlign = 'STRETCH';

  var left = auto('Left', 'HORIZONTAL', { gap: 8, align: 'CENTER' });
  if (o.modal) left.appendChild(text('닫기', { type: TYPE.small, color: c.text2 }));
  if (o.back) left.appendChild(svgIcon('back', BACK_SVG, c.text, 24));
  if (o.brand) {
    left.appendChild(svgIcon('logo', LOGO_SVG, c.text, 22));
    left.appendChild(text('양파마켓', { type: TYPE.headerTitle, color: c.text }));
  } else if (o.title) {
    left.appendChild(text(o.title, { type: TYPE.headerTitle, color: c.text }));
  }
  f.appendChild(left);

  var right = auto('Right', 'HORIZONTAL', { gap: 10, align: 'CENTER' });
  if (o.email) right.appendChild(text(o.email, { type: TYPE.micro, color: c.text3 }));
  if (o.action) right.appendChild(text(o.action, { type: TYPE.small, weight: 'Medium', color: c.text }));
  f.appendChild(right);

  var line = rect(SCREEN.w, 1, { fill: c.border, name: 'divider' });
  return { header: f, divider: line };
}

/** 화면 프레임 껍데기. content(VERTICAL, 세로로 늘어남)를 돌려준다. */
function screen(name, c, o) {
  o = o || {};
  var f = auto(name, 'VERTICAL', { fill: c.bg, w: SCREEN.w, h: SCREEN.h, gap: 0 });
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  f.resize(SCREEN.w, SCREEN.h);

  if (o.modal) {
    // 아래에서 올라온 시트. 상태바 대신 손잡이(grabber)를 그린다.
    var grabber = auto('Grabber', 'HORIZONTAL', {
      pad: [10, 0, 6, 0], align: 'CENTER', justify: 'CENTER', w: SCREEN.w
    });
    grabber.layoutAlign = 'STRETCH';
    grabber.appendChild(rect(36, 5, { fill: c.borderStrong, radius: 3, name: 'grabber' }));
    f.appendChild(grabber);
  } else {
    f.appendChild(statusBar(c));
  }

  if (o.header !== false) {
    var h = navHeader(c, o);
    f.appendChild(h.header);
    f.appendChild(stretch(h.divider));
  }

  var content = auto('Content', 'VERTICAL', {
    gap: o.gap === undefined ? 12 : o.gap,
    pad: o.pad === undefined ? 16 : o.pad,
    align: o.contentAlign,
    justify: o.contentJustify
  });
  content.layoutAlign = 'STRETCH';
  grow(content);
  content.counterAxisSizingMode = 'FIXED';
  content.primaryAxisSizingMode = 'FIXED';
  f.appendChild(content);

  if (o.tab) f.appendChild(tabBar(c, o.tab));
  f.appendChild(homeBar(c));
  return { frame: f, content: content };
}

/* ------------------------------------------------------------------ *
 * 6. 화면들
 * ------------------------------------------------------------------ */

function buildSignIn(c) {
  var s = screen('01 · 로그인', c, { header: false, pad: 20, gap: 20, contentJustify: 'CENTER' });

  var brand = auto('Brand', 'VERTICAL', { gap: 10, align: 'CENTER' });
  brand.layoutAlign = 'STRETCH';
  brand.appendChild(svgIcon('logo', LOGO_SVG, c.text, 34));
  brand.appendChild(text('양파마켓', { type: TYPE.headerTitle, color: c.text }));
  s.content.appendChild(brand);

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('로그인', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(field('이메일', 'you@example.com', c, { placeholder: true })));
  box.appendChild(stretch(field('비밀번호', '••••••••', c)));
  box.appendChild(stretch(button('로그인', c)));
  s.content.appendChild(box);

  var footer = auto('Footer', 'HORIZONTAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
  footer.layoutAlign = 'STRETCH';
  footer.appendChild(text('계정이 없으신가요?', { type: TYPE.small, color: c.text3 }));
  var link = text('회원가입', { type: TYPE.small, weight: 'Semi Bold', color: c.text });
  link.textDecoration = 'UNDERLINE';
  footer.appendChild(link);
  s.content.appendChild(footer);

  return s.frame;
}

function buildSignInExpired(c) {
  var s = screen('01b · 로그인 (세션 만료)', c, {
    header: false,
    pad: 20,
    gap: 20,
    contentJustify: 'CENTER'
  });

  var brand = auto('Brand', 'VERTICAL', { gap: 10, align: 'CENTER' });
  brand.layoutAlign = 'STRETCH';
  brand.appendChild(svgIcon('logo', LOGO_SVG, c.text, 34));
  brand.appendChild(text('양파마켓', { type: TYPE.headerTitle, color: c.text }));
  s.content.appendChild(brand);

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('로그인', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(alert('로그인이 만료되었습니다. 다시 로그인해 주세요.', 'warn', c)));
  box.appendChild(stretch(field('이메일', 'yangpa@example.com', c)));
  box.appendChild(stretch(field('비밀번호', '••••••••', c, { focused: true })));
  box.appendChild(stretch(alert('이메일 또는 비밀번호가 올바르지 않습니다.', 'error', c)));
  box.appendChild(stretch(button('확인 중...', c, { disabled: true })));
  s.content.appendChild(box);

  return s.frame;
}

function buildSignUp(c) {
  var s = screen('02 · 회원가입', c, { title: '회원가입', back: true, pad: 20, gap: 20, contentJustify: 'CENTER' });

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('회원가입', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(field('이메일', 'you@example.com', c, { placeholder: true })));
  box.appendChild(stretch(field('이름', '김양파', c)));
  box.appendChild(stretch(field('비밀번호', '••••••••', c)));
  box.appendChild(stretch(field('비밀번호 확인', '••••••••', c)));
  box.appendChild(stretch(button('가입하기', c)));
  s.content.appendChild(box);

  var footer = auto('Footer', 'HORIZONTAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
  footer.layoutAlign = 'STRETCH';
  footer.appendChild(text('이미 계정이 있으신가요?', { type: TYPE.small, color: c.text3 }));
  var link = text('로그인', { type: TYPE.small, weight: 'Semi Bold', color: c.text });
  link.textDecoration = 'UNDERLINE';
  footer.appendChild(link);
  s.content.appendChild(footer);

  return s.frame;
}

var SAMPLE = [
  { name: '무선 이어폰', price: '89,000원', desc: '거의 새것, 박스 구성품 모두 있습니다.', seller: '김양파', date: '8월 17일', fav: true },
  { name: '캠핑 의자 2개', price: '45,000원', desc: '두 번 사용했고 오염 없습니다.', seller: '이양파', date: '8월 16일', fav: false },
  { name: '기계식 키보드', price: '120,000원', desc: '적축, 키캡 교체품 포함.', seller: '박양파', date: '8월 15일', fav: false },
  { name: '자전거 헬멧', price: '32,000원', desc: 'M 사이즈, 흠집 없음.', seller: '최양파', date: '8월 14일', fav: true }
];

function homeHeader(c, o) {
  o = o || {};
  var wrap = auto('Search row', 'HORIZONTAL', { gap: 8, align: 'CENTER' });
  wrap.layoutAlign = 'STRETCH';
  wrap.appendChild(grow(searchBar(o.query, c, { filled: !!o.query })));
  wrap.appendChild(viewToggle(c, o.view || 'card'));
  return wrap;
}

/** 목록 끝 안내 / 더 불러오는 중 */
function listFooter(c, label) {
  var f = auto('Footer', 'HORIZONTAL', { pad: [20, 0, 4, 0], align: 'CENTER', justify: 'CENTER' });
  f.layoutAlign = 'STRETCH';
  f.appendChild(text(label, { type: TYPE.small, color: c.text3 }));
  return f;
}

function buildSignIn(c) {
  var s = screen('01 · 로그인', c, { header: false, pad: 20, gap: 20, contentJustify: 'CENTER' });

  var brand = auto('Brand', 'VERTICAL', { gap: 10, align: 'CENTER' });
  brand.layoutAlign = 'STRETCH';
  brand.appendChild(svgIcon('logo', LOGO_SVG, c.text, 34));
  brand.appendChild(text('양파마켓', { type: TYPE.headerTitle, color: c.text }));
  s.content.appendChild(brand);

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('로그인', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(field('이메일', 'you@example.com', c, { placeholder: true })));
  box.appendChild(stretch(field('비밀번호', '••••••••', c)));
  box.appendChild(stretch(button('로그인', c)));
  s.content.appendChild(box);

  var footer = auto('Footer', 'HORIZONTAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
  footer.layoutAlign = 'STRETCH';
  footer.appendChild(text('계정이 없으신가요?', { type: TYPE.small, color: c.text3 }));
  var link = text('회원가입', { type: TYPE.small, weight: 'Semi Bold', color: c.text });
  link.textDecoration = 'UNDERLINE';
  footer.appendChild(link);
  s.content.appendChild(footer);

  return s.frame;
}

function buildSignInExpired(c) {
  var s = screen('01b · 로그인 (세션 만료)', c, {
    header: false, pad: 20, gap: 20, contentJustify: 'CENTER'
  });

  var brand = auto('Brand', 'VERTICAL', { gap: 10, align: 'CENTER' });
  brand.layoutAlign = 'STRETCH';
  brand.appendChild(svgIcon('logo', LOGO_SVG, c.text, 34));
  brand.appendChild(text('양파마켓', { type: TYPE.headerTitle, color: c.text }));
  s.content.appendChild(brand);

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('로그인', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(alert('로그인이 만료되었습니다. 다시 로그인해 주세요.', 'warn', c)));
  box.appendChild(stretch(field('이메일', 'yangpa@example.com', c)));
  box.appendChild(stretch(field('비밀번호', '••••••••', c, { focused: true })));
  box.appendChild(stretch(alert('비밀번호가 일치하지 않습니다.', 'error', c)));
  box.appendChild(stretch(button('확인 중...', c, { disabled: true })));
  s.content.appendChild(box);

  return s.frame;
}

function buildSignUp(c) {
  var s = screen('02 · 회원가입', c, {
    title: '회원가입', back: true, pad: 20, gap: 20, contentJustify: 'CENTER'
  });

  var box = card(c);
  box.layoutAlign = 'STRETCH';
  box.appendChild(text('회원가입', { type: TYPE.screenTitle, color: c.text }));
  box.appendChild(stretch(field('이메일', 'you@example.com', c, { placeholder: true })));
  box.appendChild(stretch(field('이름', '김양파', c)));
  box.appendChild(stretch(field('비밀번호', '••••••••', c)));
  box.appendChild(stretch(field('비밀번호 확인', '••••••••', c)));
  box.appendChild(stretch(button('가입하기', c)));
  s.content.appendChild(box);

  var footer = auto('Footer', 'HORIZONTAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
  footer.layoutAlign = 'STRETCH';
  footer.appendChild(text('이미 계정이 있으신가요?', { type: TYPE.small, color: c.text3 }));
  var link = text('로그인', { type: TYPE.small, weight: 'Semi Bold', color: c.text });
  link.textDecoration = 'UNDERLINE';
  footer.appendChild(link);
  s.content.appendChild(footer);

  return s.frame;
}

/** 홈 — 카드형 */
function buildHomeCard(c) {
  var s = screen('03 · 홈 (카드형)', c, {
    brand: true, action: '로그아웃', pad: 16, gap: 12, tab: 'home'
  });

  s.content.appendChild(homeHeader(c, { view: 'card' }));

  var tileW = (SCREEN.w - 16 * 2 - 12) / 2;
  for (var r = 0; r < 2; r++) {
    var line = auto('Row ' + (r + 1), 'HORIZONTAL', { gap: 12 });
    line.layoutAlign = 'STRETCH';
    for (var i = 0; i < 2; i++) {
      var item = SAMPLE[r * 2 + i];
      line.appendChild(tile(item.name, item.price, item.seller, c, tileW, item.fav));
    }
    s.content.appendChild(line);
  }

  return s.frame;
}

/** 홈 — 목록형 + 검색중 */
function buildHomeList(c) {
  var s = screen('04 · 홈 (목록형 · 검색중)', c, {
    brand: true, action: '로그아웃', pad: 16, gap: 12, tab: 'home'
  });

  s.content.appendChild(homeHeader(c, { view: 'list', query: '캠핑' }));
  s.content.appendChild(text('‘캠핑’ 검색 결과 3건', { type: TYPE.small, color: c.text3 }));

  var w = SCREEN.w - 32;
  SAMPLE.slice(0, 3).forEach(function (item) {
    s.content.appendChild(row(item.name, item.desc, item.seller, item.date, item.price, c, w));
  });

  s.content.appendChild(listFooter(c, '모든 상품을 다 봤어요'));
  return s.frame;
}

/** 찜 탭 */
function buildFavorites(c) {
  var s = screen('05 · 찜한 상품', c, { title: '찜한 상품', pad: 16, gap: 12, tab: 'favorites' });

  s.content.appendChild(text('찜한 상품 2개', { type: TYPE.small, color: c.text3 }));

  var w = SCREEN.w - 32;
  [SAMPLE[0], SAMPLE[3]].forEach(function (item) {
    s.content.appendChild(row(item.name, item.desc, item.seller, item.date, item.price, c, w));
  });

  return s.frame;
}

/** 찜 탭 — 비어 있을 때 */
function buildFavoritesEmpty(c) {
  var s = screen('06 · 찜 (비어 있음)', c, {
    title: '찜한 상품', pad: 16, gap: 12, tab: 'favorites', contentJustify: 'CENTER'
  });

  var empty = auto('EmptyState', 'VERTICAL', { gap: 8, align: 'CENTER', justify: 'CENTER' });
  empty.layoutAlign = 'STRETCH';

  var iconBox = auto('Icon', 'HORIZONTAL', {
    fill: c.surface2, radius: 32, align: 'CENTER', justify: 'CENTER', w: 64, h: 64
  });
  iconBox.appendChild(svgIcon('heart', HEART_SVG, c.text3, 26));
  empty.appendChild(iconBox);

  empty.appendChild(text('찜한 상품이 없어요', { type: TYPE.cardTitle, color: c.text }));
  empty.appendChild(
    text('마음에 드는 상품의 하트를 눌러 여기에 모아보세요.', {
      type: TYPE.small, color: c.text3, align: 'CENTER', w: 260
    })
  );
  empty.appendChild(button('상품 둘러보기', c, { variant: 'ghost', compact: true }));
  s.content.appendChild(empty);

  return s.frame;
}

/** 마이 탭 */
function buildMy(c) {
  var s = screen('07 · 마이', c, { title: '마이', pad: 16, gap: 16, tab: 'my' });

  // 프로필
  var profile = auto('Profile', 'HORIZONTAL', {
    gap: 14, pad: 16, fill: c.surface, stroke: c.border, radius: RADIUS.md, align: 'CENTER'
  });
  profile.layoutAlign = 'STRETCH';

  var avatar = auto('Avatar', 'HORIZONTAL', {
    fill: c.accent, radius: 28, align: 'CENTER', justify: 'CENTER', w: 56, h: 56
  });
  avatar.appendChild(text('김', { type: TYPE.price, color: c.accentText }));
  profile.appendChild(avatar);

  var info = auto('Info', 'VERTICAL', { gap: 3 });
  grow(info);
  info.appendChild(text('김양파', { type: TYPE.headerTitle, color: c.text }));
  info.appendChild(text('kim@example.com', { type: TYPE.label, weight: 'Regular', color: c.text3 }));
  info.appendChild(text('8월 2일 가입', { type: TYPE.meta, color: c.text3 }));
  profile.appendChild(info);
  s.content.appendChild(profile);

  // 카운트
  var stats = auto('Stats', 'HORIZONTAL', {
    pad: [14, 0, 14, 0], stroke: c.border, radius: RADIUS.md
  });
  stats.layoutAlign = 'STRETCH';
  [['판매', '14'], ['찜', '2']].forEach(function (pair, i) {
    if (i > 0) {
      var divider = rect(1, 44, { fill: c.border, name: 'divider' });
      stats.appendChild(divider);
    }
    var col = auto('Stat', 'VERTICAL', { gap: 4, align: 'CENTER', justify: 'CENTER' });
    grow(col);
    col.appendChild(text(pair[1], { type: TYPE.screenTitle, weight: 'Bold', color: c.text }));
    col.appendChild(text(pair[0], { type: TYPE.meta, color: c.text3 }));
    stats.appendChild(col);
  });
  s.content.appendChild(stats);

  s.content.appendChild(text('내 판매상품', { type: TYPE.cardTitle, color: c.text }));

  // 내 상품 (삭제 버튼 포함)
  [SAMPLE[0], SAMPLE[2]].forEach(function (item) {
    var line = auto('My sale', 'HORIZONTAL', {
      gap: 12, pad: 12, fill: c.bg, stroke: c.border, radius: RADIUS.md, align: 'CENTER'
    });
    line.layoutAlign = 'STRETCH';
    line.appendChild(photo(66, 66, c, RADIUS.sm));

    var body = auto('Body', 'VERTICAL', { gap: 3 });
    grow(body);
    body.appendChild(text(item.name, { type: TYPE.cardTitle, color: c.text }));
    body.appendChild(text(item.price, { type: TYPE.cardTitle, color: c.text }));
    body.appendChild(text(item.date + ' 등록 · 관심 2', { type: TYPE.meta, color: c.text3 }));
    line.appendChild(body);

    line.appendChild(svgIcon('trash', TRASH_SVG, c.text3, 19));
    s.content.appendChild(line);
  });

  return s.frame;
}

/** 상품 등록 — 모달 시트 */
function buildSaleNew(c) {
  var s = screen('08 · 상품 등록 (모달)', c, { title: '상품 등록', modal: true, pad: 0, gap: 0 });

  var body = auto('Body', 'VERTICAL', { gap: 0, pad: [8, 0, 0, 0] });
  body.layoutAlign = 'STRETCH';

  var pickerWrap = auto('Picker wrap', 'VERTICAL', { pad: [0, 20, 0, 20] });
  pickerWrap.layoutAlign = 'STRETCH';
  var picker = auto('Picker', 'VERTICAL', {
    gap: 8,
    fill: c.surface,
    stroke: c.borderStrong,
    dashed: true,
    radius: RADIUS.md,
    align: 'CENTER',
    justify: 'CENTER',
    h: (SCREEN.w - 40) * 0.75
  });
  picker.layoutAlign = 'STRETCH';
  picker.primaryAxisSizingMode = 'FIXED';
  picker.appendChild(svgIcon('plus', PLUS_SVG, c.text3, 30));
  picker.appendChild(text('탭해서 사진 선택', { type: TYPE.meta, color: c.text3 }));
  pickerWrap.appendChild(picker);
  body.appendChild(pickerWrap);

  var form = auto('Form', 'VERTICAL', { gap: 18, pad: 20 });
  form.layoutAlign = 'STRETCH';
  form.appendChild(stretch(field('상품명', '무선 이어폰', c)));
  form.appendChild(stretch(field('설명', '상품 상태, 구입 시기, 거래 방법 등을 적어주세요.', c, { multiline: true, placeholder: true })));
  form.appendChild(stretch(field('가격', '89,000', c)));
  form.appendChild(stretch(button('등록하기', c)));
  body.appendChild(form);

  s.content.appendChild(body);
  return s.frame;
}

/** 상품 상세 — 탭바 없음 (루트 스택) */
function buildSaleDetail(c) {
  var s = screen('09 · 상품 상세', c, { title: '무선 이어폰', back: true, pad: 0, gap: 0 });

  s.content.appendChild(stretch(photo(SCREEN.w, 280, c, 0)));

  var body = auto('Body', 'VERTICAL', { gap: 14, pad: 20 });
  body.layoutAlign = 'STRETCH';

  var titleRow = auto('Title row', 'HORIZONTAL', { gap: 12, align: 'MIN' });
  titleRow.layoutAlign = 'STRETCH';
  var titleCol = auto('Title', 'VERTICAL', { gap: 6 });
  grow(titleCol);
  titleCol.appendChild(text('무선 이어폰', { type: TYPE.screenTitle, color: c.text }));
  titleCol.appendChild(text('89,000원', { type: TYPE.price, color: c.text }));
  titleRow.appendChild(titleCol);

  var heartRow = auto('Heart', 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  heartRow.appendChild(svgIcon('heart', HEART_FILLED_SVG, '#ef4444', 26));
  heartRow.appendChild(text('2', { type: TYPE.small, weight: 'Semi Bold', color: '#ef4444' }));
  titleRow.appendChild(heartRow);
  body.appendChild(titleRow);

  body.appendChild(stretch(rect(1, 1, { fill: c.border, name: 'divider' })));
  body.appendChild(
    stretch(
      text('거의 새것이고 박스와 구성품 모두 있습니다.\n직거래는 강남역 부근에서 가능합니다.', {
        type: TYPE.body, color: c.text2, w: SCREEN.w - 40
      })
    )
  );

  var meta = auto('Meta', 'VERTICAL', {
    pad: [0, 14, 0, 14], fill: c.surface, stroke: c.border, radius: RADIUS.md
  });
  meta.layoutAlign = 'STRETCH';

  [['판매자', '김양파'], ['이메일', 'kim@example.com'], ['등록일', '2026. 8. 17. 오후 3:04'], ['관심', '2명']]
    .forEach(function (pair, i) {
      if (i > 0) meta.appendChild(stretch(rect(1, 1, { fill: c.border, name: 'divider' })));
      var line = auto('Row', 'HORIZONTAL', {
        pad: [12, 0, 12, 0], gap: 12, justify: 'SPACE_BETWEEN', align: 'CENTER'
      });
      line.layoutAlign = 'STRETCH';
      line.appendChild(text(pair[0], { type: TYPE.label, weight: 'Regular', color: c.text3 }));
      line.appendChild(text(pair[1], { type: TYPE.small, weight: 'Medium', color: c.text }));
      meta.appendChild(line);
    });
  body.appendChild(meta);

  s.content.appendChild(body);
  return s.frame;
}

/* ------------------------------------------------------------------ *
 * 7. Foundations 페이지
 * ------------------------------------------------------------------ */

function swatch(name, hex, c) {
  var f = auto('Swatch / ' + name, 'VERTICAL', { gap: 8, w: 132 });
  var chip = rect(132, 64, { fill: hex, radius: RADIUS.sm, stroke: c.border, name: 'chip' });
  f.appendChild(chip);
  var label = auto('Label', 'VERTICAL', { gap: 2 });
  label.appendChild(text(name, { type: TYPE.label, color: c.text }));
  label.appendChild(text(hex.toUpperCase(), { type: TYPE.meta, color: c.text3 }));
  f.appendChild(label);
  return f;
}

function buildFoundations(page) {
  var c = LIGHT;
  var root = auto('Foundations', 'VERTICAL', { gap: 40, pad: 48, fill: c.bg });
  root.name = '🎨 Foundations';

  root.appendChild(text('양파마켓 · 디자인 토큰', { type: TYPE.price, color: c.text }));
  root.appendChild(
    text('mobile/src/theme.ts 의 값과 동일합니다. 값을 바꾸면 코드도 같이 바꿔 주세요.', {
      type: TYPE.small,
      color: c.text3
    })
  );

  ['Light', 'Dark'].forEach(function (mode) {
    var palette = mode === 'Light' ? LIGHT : DARK;
    var section = auto(mode + ' palette', 'VERTICAL', { gap: 16 });
    section.appendChild(text(mode, { type: TYPE.screenTitle, color: c.text }));

    var keys = Object.keys(palette);
    for (var i = 0; i < keys.length; i += 6) {
      var line = auto('Row', 'HORIZONTAL', { gap: 16 });
      keys.slice(i, i + 6).forEach(function (k) {
        line.appendChild(swatch(k, palette[k], c));
      });
      section.appendChild(line);
    }
    root.appendChild(section);
  });

  // 타이포그래피
  var typo = auto('Typography', 'VERTICAL', { gap: 16 });
  typo.appendChild(text('Typography', { type: TYPE.screenTitle, color: c.text }));
  Object.keys(TYPE).forEach(function (k) {
    var t = TYPE[k];
    var line = auto('Type / ' + k, 'HORIZONTAL', { gap: 24, align: 'CENTER' });
    var meta = text(k + '  ·  ' + t.size + '/' + t.lh + '  ' + t.weight, {
      type: TYPE.meta,
      color: c.text3,
      w: 240
    });
    line.appendChild(meta);
    line.appendChild(text('양파마켓 Yangpa 12,345원', { type: t, color: c.text }));
    typo.appendChild(line);
  });
  root.appendChild(typo);

  // 스페이싱 / 라운딩
  var metrics = auto('Metrics', 'VERTICAL', { gap: 16 });
  metrics.appendChild(text('Spacing & Radius', { type: TYPE.screenTitle, color: c.text }));

  var spacing = auto('Spacing', 'HORIZONTAL', { gap: 20, align: 'MAX' });
  Object.keys(SPACE).forEach(function (k) {
    var col = auto('space-' + k, 'VERTICAL', { gap: 8, align: 'CENTER' });
    col.appendChild(rect(SPACE[k], SPACE[k], { fill: c.accent, name: k }));
    col.appendChild(text(k + ' ' + SPACE[k], { type: TYPE.meta, color: c.text3 }));
    spacing.appendChild(col);
  });
  metrics.appendChild(spacing);

  var radii = auto('Radius', 'HORIZONTAL', { gap: 20, align: 'MAX' });
  Object.keys(RADIUS).forEach(function (k) {
    var col = auto('radius-' + k, 'VERTICAL', { gap: 8, align: 'CENTER' });
    col.appendChild(rect(64, 48, { fill: c.surface2, stroke: c.borderStrong, radius: RADIUS[k], name: k }));
    col.appendChild(text(k + ' ' + RADIUS[k], { type: TYPE.meta, color: c.text3 }));
    radii.appendChild(col);
  });
  metrics.appendChild(radii);
  root.appendChild(metrics);

  page.appendChild(root);
  return root;
}

/* ------------------------------------------------------------------ *
 * 8. Components 페이지
 * ------------------------------------------------------------------ */

function toComponent(node, name) {
  var comp = figma.createComponent();
  comp.name = name;
  comp.layoutMode = node.layoutMode;
  comp.primaryAxisSizingMode = node.primaryAxisSizingMode;
  comp.counterAxisSizingMode = node.counterAxisSizingMode;
  comp.itemSpacing = node.itemSpacing;
  comp.paddingTop = node.paddingTop;
  comp.paddingRight = node.paddingRight;
  comp.paddingBottom = node.paddingBottom;
  comp.paddingLeft = node.paddingLeft;
  comp.counterAxisAlignItems = node.counterAxisAlignItems;
  comp.primaryAxisAlignItems = node.primaryAxisAlignItems;
  comp.fills = node.fills;
  comp.strokes = node.strokes;
  comp.strokeWeight = node.strokeWeight;
  comp.dashPattern = node.dashPattern;
  comp.cornerRadius = node.cornerRadius;
  comp.effects = node.effects;
  comp.opacity = node.opacity;

  var kids = node.children.slice();
  kids.forEach(function (k) {
    comp.appendChild(k);
  });
  if (node.width && node.height) comp.resize(node.width, node.height);
  node.remove();
  return comp;
}

function buildComponents(page) {
  var c = LIGHT;
  var root = auto('Components', 'VERTICAL', { gap: 40, pad: 48, fill: c.bg });
  root.name = '🧩 Components';

  root.appendChild(text('양파마켓 · 컴포넌트', { type: TYPE.price, color: c.text }));
  root.appendChild(
    text('각 컴포넌트는 mobile/src/components 의 같은 이름 파일과 대응합니다.', {
      type: TYPE.small,
      color: c.text3
    })
  );

  function group(title, items) {
    var g = auto(title, 'VERTICAL', { gap: 16 });
    g.appendChild(text(title, { type: TYPE.screenTitle, color: c.text }));
    var line = auto('Variants', 'HORIZONTAL', { gap: 20, align: 'CENTER' });
    items.forEach(function (item) {
      var col = auto('Variant', 'VERTICAL', { gap: 8, align: 'MIN' });
      col.appendChild(text(item[0], { type: TYPE.meta, color: c.text3 }));
      col.appendChild(toComponent(item[1], title + ' / ' + item[0]));
      line.appendChild(col);
    });
    g.appendChild(line);
    return g;
  }

  var buttons = [
    ['Primary / Default', button('등록하기', c)],
    ['Primary / Disabled', button('등록 중...', c, { disabled: true })],
    ['Primary / Compact', button('상품 등록', c, { compact: true })],
    ['Ghost / Default', button('내 상품만', c, { variant: 'ghost', compact: true })],
    ['Ghost / Active', button('내 상품만', c, { variant: 'ghost', compact: true, active: true })],
    ['Ghost / Disabled', button('이전', c, { variant: 'ghost', compact: true, disabled: true })]
  ];
  root.appendChild(group('Button', buttons));

  var fields = [
    ['Default', wrapWidth(field('이메일', 'you@example.com', c, { placeholder: true }), 300)],
    ['Focused', wrapWidth(field('비밀번호', '••••••••', c, { focused: true }), 300)],
    ['Multiline', wrapWidth(field('설명', '거의 새것입니다.', c, { multiline: true }), 300)]
  ];
  root.appendChild(group('Field', fields));

  var alerts = [
    ['Error', wrapWidth(alert('비밀번호가 일치하지 않습니다.', 'error', c), 300)],
    ['Warn', wrapWidth(alert('로그인이 만료되었습니다.', 'warn', c), 300)],
    ['Ok', wrapWidth(alert('회원가입이 완료되었습니다.', 'ok', c), 300)]
  ];
  root.appendChild(group('Alert', alerts));

  root.appendChild(
    group('ViewToggle · SearchBar', [
      ['card 선택', viewToggle(c, 'card')],
      ['list 선택', viewToggle(c, 'list')],
      ['Empty', wrapWidth(searchBar('', c), 260)],
      ['Filled', wrapWidth(searchBar('캠핑', c, { filled: true }), 260)]
    ])
  );

  root.appendChild(
    group('목록 아이템', [
      ['Tile (카드형)', tile('무선 이어폰', '89,000원', '김양파', c, 171, false)],
      ['Tile (찜한 상태)', tile('자전거 헬멧', '32,000원', '최양파', c, 171, true)],
      ['Row (목록형)', row('캠핑 의자 2개', '두 번 사용했고 오염 없습니다.', '이양파', '8월 16일', '45,000원', c, 358)]
    ])
  );

  root.appendChild(
    group('HeartButton', [
      ['Overlay / 기본', heartChip(false)],
      ['Overlay / 찜함', heartChip(true)]
    ])
  );

  // 탭바는 폭이 화면 전체라 group() 의 가로 나열에 맞지 않으므로 따로 세로로 쌓는다
  var tabs = auto('TabBar', 'VERTICAL', { gap: 16 });
  tabs.appendChild(text('TabBar', { type: TYPE.screenTitle, color: c.text }));
  [['홈 선택', 'home'], ['찜 선택', 'favorites'], ['마이 선택', 'my']].forEach(function (pair) {
    var col = auto('Variant', 'VERTICAL', { gap: 8 });
    col.appendChild(text(pair[0], { type: TYPE.meta, color: c.text3 }));
    col.appendChild(toComponent(tabBar(c, pair[1]), 'TabBar / ' + pair[0]));
    tabs.appendChild(col);
  });
  root.appendChild(tabs);

  page.appendChild(root);
  return root;
}

/** 오토레이아웃 자식에 고정 폭을 주기 위한 래퍼 */
function wrapWidth(node, w) {
  var f = auto('Wrapper', 'VERTICAL', { w: w });
  f.counterAxisSizingMode = 'FIXED';
  f.appendChild(stretch(node));
  return f;
}

/* ------------------------------------------------------------------ *
 * 9. Screens 페이지
 * ------------------------------------------------------------------ */

function buildScreens(page) {
  var root = auto('Screens', 'VERTICAL', { gap: 64, pad: 64, fill: LIGHT.bg });
  root.name = '📱 Screens';
  root.appendChild(text('양파마켓 · 화면', { type: TYPE.price, color: LIGHT.text }));
  root.appendChild(
    text('mobile/src/screens 의 화면들. 390×844 (iPhone 14/15) 기준. 하단 4탭 — 홈 / 찜 / + / 마이.', {
      type: TYPE.small,
      color: LIGHT.text3
    })
  );

  var builders = [
    buildSignIn,
    buildSignInExpired,
    buildSignUp,
    buildHomeCard,
    buildHomeList,
    buildFavorites,
    buildFavoritesEmpty,
    buildMy,
    buildSaleNew,
    buildSaleDetail
  ];

  [['Light', LIGHT], ['Dark', DARK]].forEach(function (pair) {
    var section = auto(pair[0], 'VERTICAL', { gap: 24 });
    section.appendChild(text(pair[0] + ' mode', { type: TYPE.screenTitle, color: LIGHT.text }));
    var line = auto('Frames', 'HORIZONTAL', { gap: 40, align: 'MIN' });
    builders.forEach(function (build) {
      line.appendChild(build(pair[1]));
    });
    section.appendChild(line);
    root.appendChild(section);
  });

  page.appendChild(root);
  return root;
}

/* ------------------------------------------------------------------ *
 * 10. 스타일 등록 (로컬 색상/텍스트 스타일)
 * ------------------------------------------------------------------ */

function registerStyles() {
  [['Light', LIGHT], ['Dark', DARK]].forEach(function (pair) {
    var mode = pair[0];
    var palette = pair[1];
    Object.keys(palette).forEach(function (k) {
      var style = figma.createPaintStyle();
      style.name = mode + '/' + k;
      style.paints = solid(palette[k]);
    });
  });

  Object.keys(TYPE).forEach(function (k) {
    var t = TYPE[k];
    var style = figma.createTextStyle();
    style.name = 'Mobile/' + k;
    style.fontName = { family: 'Inter', style: t.weight };
    style.fontSize = t.size;
    style.lineHeight = { unit: 'PIXELS', value: t.lh };
    style.letterSpacing = { unit: 'PIXELS', value: t.ls };
  });
}

/* ------------------------------------------------------------------ *
 * 11. 진입점
 * ------------------------------------------------------------------ */

async function main() {
  await figma.loadAllPagesAsync();

  var fonts = ['Regular', 'Medium', 'Semi Bold', 'Bold'];
  for (var i = 0; i < fonts.length; i++) {
    await figma.loadFontAsync({ family: 'Inter', style: fonts[i] });
  }

  function makePage(name) {
    var p = figma.createPage();
    p.name = name;
    p.backgrounds = solid('#f7f7f8');
    return p;
  }

  var foundationsPage = makePage('🎨 Foundations');
  var componentsPage = makePage('🧩 Components');
  var screensPage = makePage('📱 Screens');

  registerStyles();

  buildFoundations(foundationsPage);
  buildComponents(componentsPage);
  var screensRoot = buildScreens(screensPage);

  await figma.setCurrentPageAsync(screensPage);
  figma.viewport.scrollAndZoomIntoView([screensRoot]);

  figma.closePlugin('양파마켓 디자인 시스템을 생성했습니다 — Foundations · Components · Screens 3개 페이지');
}

main().catch(function (err) {
  figma.closePlugin('오류: ' + (err && err.message ? err.message : String(err)));
});

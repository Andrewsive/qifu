let lanternSequence = 0;

const escapeXml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char]));

const palettes = {
  lotus: { edge: '#ad4f32', mid: '#e8ab62', paper: '#fff0c9', ink: '#553b2c', trim: '#ad753d' },
  moon: { edge: '#c29b61', mid: '#e8d2a5', paper: '#fff9df', ink: '#625039', trim: '#a38a52' },
  fish: { edge: '#bb5934', mid: '#efb461', paper: '#fff0bb', ink: '#653e27', trim: '#ab6738' },
  plum: { edge: '#a14c43', mid: '#e4a37a', paper: '#ffedca', ink: '#633b32', trim: '#a16d4a' }
};

const shapes = {
  lotus: 'M160 79 C204 79 246 92 260 124 C272 153 270 252 250 279 C232 302 195 315 160 318 C125 315 88 302 70 279 C50 252 48 153 60 124 C74 92 116 79 160 79Z',
  moon: 'M160 79 C224 79 271 125 271 193 C271 260 225 310 160 318 C95 310 49 260 49 193 C49 125 96 79 160 79Z',
  fish: 'M160 79 C219 79 256 103 266 151 C274 194 261 271 235 295 C216 311 187 318 160 318 C133 318 104 311 85 295 C59 271 46 194 54 151 C64 103 101 79 160 79Z',
  plum: 'M124 80 Q160 72 196 80 L246 106 Q259 113 262 129 L272 183 L259 267 Q257 281 243 290 L194 314 Q160 325 126 314 L77 290 Q63 281 61 267 L48 183 L58 129 Q61 113 74 106Z'
};

function wishLettering(wish, ink) {
  const characters = Array.from(String(wish || '愿新岁常安常乐')).slice(0, 28);
  const perColumn = characters.length <= 7 ? characters.length : characters.length === 8 ? 4 : 7;
  const columns = Math.ceil(characters.length / perColumn);
  const rows = Math.min(characters.length, perColumn);
  const fontSize = rows <= 4 ? 27 : rows === 5 ? 21 : rows === 6 ? 18 : 16;
  const rowGap = rows <= 4 ? 28 : rows === 5 ? 22 : rows === 6 ? 18 : 16;
  const columnGap = fontSize + 7;
  const startY = 226.5 - (rows - 1) * rowGap / 2;
  return `<g fill="${ink}" font-family="'Songti SC','SimSun',serif" font-size="${fontSize}" text-anchor="middle">${characters.map((char, index) => {
    const column = Math.floor(index / perColumn);
    const x = 160 + (columns - 1) * columnGap / 2 - column * columnGap;
    const y = startY + (index % perColumn) * rowGap;
    return `<g class="wish-character" style="--letter-i:${index}"><text class="wish-letter" x="${x}" y="${y}" dominant-baseline="central">${escapeXml(char)}</text><g class="wish-pen" display="none" transform="translate(${x+8} ${y-11})"><path d="M0 0 L15 -29 L20 -26 L5 2Z" fill="#755137"/><path d="M0 0 Q-5 5 -4 10 Q4 7 5 2Z" fill="#3e3025"/><path d="M15 -29 L18 -35 L23 -32 L20 -26Z" fill="#b78a4e"/></g></g>`;
  }).join('')}</g>`;
}

function floralSpray(x, y, mirrored, color) {
  return `<g transform="translate(${x} ${y}) scale(${mirrored ? -1 : 1} 1)" fill="none" stroke="${color}" stroke-width="1.1" opacity=".76">
    <path d="M0 88 Q18 47 6 0 M8 51 Q29 36 28 17 M9 29 Q-7 22 -10 7 M3 72 Q-15 57 -15 39"/>
    ${[[7, 18], [22, 31], [-9, 15], [-12, 49], [6, 62]].map(([cx, cy]) => `<g transform="translate(${cx} ${cy})" fill="${color}" stroke="none"><ellipse cy="-3" rx="2.2" ry="3.5"/><ellipse cx="3" cy="-1" rx="3.5" ry="2.2" transform="rotate(30 3 -1)"/><ellipse cx="2" cy="3" rx="2.2" ry="3.5" transform="rotate(-25 2 3)"/><ellipse cx="-3" cy="2" rx="3.5" ry="2.2" transform="rotate(-25 -3 2)"/><circle r="1.3" fill="#f6dba1"/></g>`).join('')}
  </g>`;
}

function lanternMotif(type, palette) {
  if (type === 'moon') return `<g stroke="${palette.trim}" stroke-width="1" fill="none" opacity=".54"><circle cx="86" cy="178" r="15"/><path d="M93 164 Q76 178 94 192 M72 231 Q83 222 94 231 Q105 239 117 230 M216 178 Q228 170 240 179 M217 185 Q231 178 244 186"/></g>`;
  if (type === 'fish') return `<g fill="none" stroke="${palette.trim}" stroke-width="1" opacity=".64"><path d="M72 192 Q88 173 103 190 Q88 208 72 192 L64 182 V202Z M245 242 Q230 224 216 241 Q231 258 245 242 L252 232 V252Z M71 257 Q84 249 99 257 M69 263 Q84 255 103 264 M218 177 Q233 169 248 177"/><circle cx="95" cy="190" r="1.4" fill="${palette.trim}"/><circle cx="222" cy="241" r="1.4" fill="${palette.trim}"/></g>`;
  if (type === 'plum') return floralSpray(76, 161, false, '#a65e46') + floralSpray(246, 137, true, '#a65e46');
  return `<g fill="none" stroke="${palette.trim}" stroke-width="1" opacity=".62"><path d="M73 231 Q88 218 102 231 Q95 249 87 254 Q77 245 73 231Z M87 254 Q63 250 67 232 Q80 231 87 254 Q94 231 108 232 Q111 249 87 254 M220 185 Q232 173 243 185 Q239 199 232 203 Q225 197 220 185Z M232 203 Q212 199 215 186 Q227 185 232 203 Q237 185 249 186 Q252 199 232 203"/></g>`;
}

/** Decorative, self-contained lantern artwork for the generated wish preview. */
export function renderWishLantern({ type = 'lotus', serial = '', name = '', wish = '', blank = false, sky = false } = {}) {
  const selected = palettes[type] ? type : 'lotus';
  const palette = palettes[selected];
  const path = sky ? 'M70 100 Q160 55 250 100 Q263 114 260 134 L235 287 Q160 322 85 287 L60 134 Q57 114 70 100Z' : shapes[selected];
  const id = `wish-lantern-${++lanternSequence}`;
  const title = `第${serial}盏愿灯，${name}的心愿：${wish}`;
  return `<svg class="wish-lantern-art" viewBox="0 0 320 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(title)}">
    <defs>
      <radialGradient id="${id}-paper" cx="50%" cy="44%" r="64%"><stop stop-color="${palette.paper}"/><stop offset=".57" stop-color="${palette.paper}"/><stop offset=".84" stop-color="${palette.mid}"/><stop offset="1" stop-color="${palette.edge}"/></radialGradient>
      <linearGradient id="${id}-metal" x1="0" x2="1"><stop stop-color="#80502e"/><stop offset=".24" stop-color="#c4995c"/><stop offset=".5" stop-color="#efd8a3"/><stop offset=".78" stop-color="#bc884e"/><stop offset="1" stop-color="#74472c"/></linearGradient>
      <linearGradient id="${id}-silk" x1="0" x2="1"><stop stop-color="#8f3e2e"/><stop offset=".48" stop-color="#d17448"/><stop offset="1" stop-color="#9e4330"/></linearGradient>
      <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
      <filter id="${id}-shadow" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#875325" flood-opacity=".16"/></filter>
    </defs>
    ${sky ? '' : `<g fill="none" stroke="#9b633b"><path d="M160 9 V56" stroke-width="2"/><path d="M157 9 V56 M163 9 V56" stroke-width=".5" opacity=".55"/><path d="M152 57 Q151 50 159 49 Q167 49 168 57 Q168 64 160 65 Q152 65 152 57Z" stroke-width="2"/></g><path d="M134 70 Q160 60 186 70 L188 80 H132Z" fill="url(#${id}-metal)"/>`}
    <g class="wish-lamp-body" filter="url(#${id}-shadow)">
      <path d="${path}" fill="url(#${id}-paper)" stroke="${palette.trim}" stroke-width="1.5"/>
      <g clip-path="url(#${id}-clip)">
        <path class="wish-ribs" d="M106 74 Q74 192 111 325 M214 74 Q246 192 209 325" fill="none" stroke="${palette.trim}" stroke-width="1" opacity=".36"/>
        <path d="M123 74 Q105 192 126 325 M197 74 Q215 192 194 325" fill="none" stroke="#fff4d7" stroke-width="1.5" opacity=".58"/>
        <path d="M46 105 Q160 76 274 105 M46 287 Q160 322 274 287" fill="none" stroke="${palette.trim}" stroke-width="1" opacity=".55"/>
        ${lanternMotif(selected, palette)}
        <g fill="none" stroke="${palette.trim}" stroke-width="1" opacity=".65"><path d="M108 297 H212 M114 294 Q160 267 206 294 M125 291 V297 M138 285 V297 M151 281 V297 M164 281 V297 M177 284 V297 M190 289 V297"/><path d="M101 302 Q113 298 125 302 T149 302 T173 302 T197 302 T221 302" opacity=".55"/></g>
      </g>
      <path d="M144 96 H176 M143 99 H177" stroke="${palette.trim}" stroke-width="1" opacity=".55"/>
      <text x="160" y="123" text-anchor="middle" fill="${palette.ink}" font-family="Georgia,'Songti SC',serif" font-size="20" letter-spacing="1">${escapeXml(serial)}</text>
      <text class="wish-signature" x="160" y="145" text-anchor="middle" fill="${palette.ink}" font-family="'Songti SC','SimSun',serif" font-size="10.5" letter-spacing="1">${escapeXml(name)}</text>
      <path d="M136 155 H151 M169 155 H184 M156 155 L160 151 L164 155 L160 159Z" fill="none" stroke="${palette.trim}" stroke-width=".75"/>
      ${blank ? '' : wishLettering(wish, palette.ink)}
      <rect x="226" y="263" width="10" height="13" rx="1.5" fill="#ac5038" opacity=".8"/><text x="231" y="272.5" text-anchor="middle" font-size="8" fill="#fff0cc" font-family="serif">愿</text>
    </g>
    ${sky ? `<ellipse cx="160" cy="291" rx="74" ry="17" fill="#b87b4666" stroke="${palette.trim}" stroke-width="2"/><ellipse cx="160" cy="291" rx="65" ry="12" fill="#ffe7ad" opacity=".5"/><path d="M100 289 L220 293 M160 280 V305" stroke="${palette.trim}" fill="none"/><g class="craft-svg-flame" display="none"><path d="M160 302 Q142 291 160 270 Q158 285 167 288 Q173 298 160 302Z" fill="#ffc763"/><path d="M160 301 Q153 295 160 286 Q166 295 160 301Z" fill="#fff9da"/></g>` : `<path d="M137 315 Q160 323 183 315 L181 324 Q160 331 139 324Z" fill="url(#${id}-metal)"/>
    <path d="M160 328 V340" stroke="#a64d32" stroke-width="2"/>
    <g fill="none" stroke="#ac5937" stroke-width="1.4"><path d="M160 335 L167 342 L160 349 L153 342Z M156 338 H164 V346 H156Z"/><path d="M160 349 Q141 368 142 394 M160 349 Q150 376 151 401 M160 349 V404 M160 349 Q170 376 169 401 M160 349 Q179 368 178 394" stroke="url(#${id}-silk)" stroke-width="2"/><path d="M156 351 Q146 375 146 399 M164 351 Q174 375 174 399" opacity=".55"/></g>`}
  </svg>`;
}

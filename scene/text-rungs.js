import * as THREE from '../js/vendor/three.module.js';

const MSDF_PX_RANGE = 8.0;

// ---------- helpers ----------

function mod(n, m) {
  return ((n % m) + m) % m;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function makeGlyphMap(fontData) {
  const map = new Map();
  for (const glyph of fontData.chars) {
    map.set(glyph.id, glyph);
  }
  return map;
}

function getGlyph(glyphMap, ch) {
  const code = ch.charCodeAt(0);
  return glyphMap.get(code) || glyphMap.get(32) || null;
}

function measureWord(word, glyphMap, letterSpacing = 0) {
  let width = 0;
  for (let i = 0; i < word.length; i += 1) {
    const glyph = getGlyph(glyphMap, word[i]);
    if (!glyph) continue;
    width += glyph.xadvance + letterSpacing;
  }
  return width;
}

function wrapTextToLines(text, glyphMap, maxWidthPx, letterSpacing = 0) {
  const paragraphs = text.trim().split(/\n\s*\n/); // blank line = new paragraph
  const lines = [];

  for (let p = 0; p < paragraphs.length; p += 1) {
    const words = paragraphs[p].trim().replace(/\s+/g, ' ').split(' ');
    const spaceWidth = measureWord(' ', glyphMap, letterSpacing);

    let currentWords = [];
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = measureWord(word, glyphMap, letterSpacing);
      const extra = currentWords.length > 0 ? spaceWidth : 0;

      if (currentWords.length > 0 && currentWidth + extra + wordWidth > maxWidthPx) {
        lines.push(currentWords.join(' '));
        currentWords = [word];
        currentWidth = wordWidth;
      } else {
        if (currentWords.length > 0) currentWidth += spaceWidth;
        currentWords.push(word);
        currentWidth += wordWidth;
      }
    }

    if (currentWords.length > 0) lines.push(currentWords.join(' '));

    if (p < paragraphs.length - 1) {
      lines.push(''); // blank line between paragraphs
    }
  }

  return lines;
}

function layoutLine(lineText, glyphMap, letterSpacing = 0) {
  const glyphs = [];
  let penX = 0;

  for (let i = 0; i < lineText.length; i += 1) {
    const ch = lineText[i];
    const glyph = getGlyph(glyphMap, ch);
    if (!glyph) continue;

    if (glyph.width > 0 && glyph.height > 0) {
      glyphs.push({
        x: penX + glyph.xoffset,
        y: glyph.yoffset,
        width: glyph.width,
        height: glyph.height,
        xadvance: glyph.xadvance,
        uv: {
          x: glyph.x,
          y: glyph.y,
          width: glyph.width,
          height: glyph.height,
          page: glyph.page || 0
        }
      });
    }

    penX += glyph.xadvance + letterSpacing;
  }

  return {
    width: penX,
    glyphs
  };
}

function createMSDFMaterial(atlasTexture, atlasWidth, atlasHeight) {
  atlasTexture.needsUpdate = true;
  atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
  atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.generateMipmaps = false;

  if ('colorSpace' in atlasTexture) {
    atlasTexture.colorSpace = THREE.SRGBColorSpace;
  }

  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uMap: { value: atlasTexture },
      uAtlasSize: { value: new THREE.Vector2(atlasWidth, atlasHeight) },
      uPxRange: { value: MSDF_PX_RANGE }
    },
    vertexShader: `
      attribute float aAlpha;
      varying vec2 vUv;
      varying float vAlpha;

      void main() {
        vUv = uv;
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec2 uAtlasSize;
      uniform float uPxRange;

      varying vec2 vUv;
      varying float vAlpha;

      float median(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
      }

      float screenPxRange() {
        vec2 unitRange = vec2(uPxRange) / uAtlasSize;
        vec2 screenTexSize = vec2(1.0) / fwidth(vUv);
        return max(0.5 * dot(unitRange, screenTexSize), 1.0);
      }

      void main() {
        vec3 sampleColor = texture2D(uMap, vUv).rgb;
        float sd = median(sampleColor.r, sampleColor.g, sampleColor.b) - 0.5;
        float screenPxDistance = screenPxRange() * sd;
        float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);

        float finalAlpha = opacity * vAlpha;
        if (finalAlpha < 0.01) discard;

        gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha);
      }
    `
  });
}

// ---------- main ----------

export async function createTextRungs({ helixPoint, tubeRadius, longText, atlasPath, fontJsonPath }) {
  const group = new THREE.Group();

  const [fontData, atlasTexture] = await Promise.all([
    fetch(fontJsonPath).then((r) => r.json()),
    new THREE.TextureLoader().loadAsync(atlasPath)
  ]);


  const atlasWidth = fontData.common.scaleW;
  const atlasHeight = fontData.common.scaleH;
  const lineHeightPx = fontData.common.lineHeight;
  const glyphMap = makeGlyphMap(fontData);

  // ribbon width from actual DNA geometry
  const inset = tubeRadius * 0.56;
  const leftMid = helixPoint(0.5, -1, inset);
  const rightMid = helixPoint(0.5, 1, inset);
  const usableRibbonWidthWorld = leftMid.distanceTo(rightMid) * 0.90;

  // source text scale on ribbon
  const targetLineHeightWorld = 0.44;
  const fontScale = targetLineHeightWorld / lineHeightPx;
  const maxLineWidthPx = usableRibbonWidthWorld / fontScale;

  const lines = wrapTextToLines(longText, glyphMap, maxLineWidthPx, 0)
  .map((line) => line === '' ? { width: 0, glyphs: [], isSpacer: true } : layoutLine(line, glyphMap, 0))
  .reverse();

  const approxVisibleLines = Math.ceil(56 / targetLineHeightWorld) + 12;
  const avgGlyphsPerLine = Math.max(
    18,
    Math.ceil(lines.reduce((sum, l) => sum + l.glyphs.length, 0) / lines.length)
  );
  const maxGlyphs = approxVisibleLines * avgGlyphsPerLine;

  const positions = new Float32Array(maxGlyphs * 4 * 3);
  const uvs = new Float32Array(maxGlyphs * 4 * 2);
  const alphas = new Float32Array(maxGlyphs * 4);
  const indices = new Uint32Array(maxGlyphs * 6);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  
  const material = createMSDFMaterial(atlasTexture, atlasWidth, atlasHeight);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  group.add(mesh);
  
  function setVertex(posArray, index, vec) {
    posArray[index * 3 + 0] = vec.x;
    posArray[index * 3 + 1] = vec.y;
    posArray[index * 3 + 2] = vec.z;
  }

  function setUV(uvArray, index, u, v) {
    uvArray[index * 2 + 0] = u;
    uvArray[index * 2 + 1] = v;
  }

  function update(flow) {
    const dnaHeightWorld = 56; // matches your current dna.js height family closely enough
    const visibleLineCount = approxVisibleLines;
    const scrollLines = flow * 24.0;
    const baseLineIndex = Math.floor(scrollLines);
    const fracLine = scrollLines - baseLineIndex;

    const firstLineTop = -dnaHeightWorld * 0.5 - targetLineHeightWorld * 3 - fracLine * targetLineHeightWorld;

    let glyphCount = 0;

    for (let slot = 0; slot < visibleLineCount; slot += 1) {
      const lineData = lines[mod(baseLineIndex + slot, lines.length)];
      const lineTopWorld = firstLineTop + slot * targetLineHeightWorld;
      const lineCenterWorld = lineTopWorld + targetLineHeightWorld * 0.5;

      // readable center, softer top/bottom
      const distNorm = Math.abs(lineCenterWorld) / (dnaHeightWorld * 0.5);
      const lineAlpha = 1.0 - smoothstep(0.56, 0.96, distNorm);
      if (lineAlpha <= 0.001) continue;

      const lineWidthWorld = lineData.width * fontScale;
      const leftMarginWorld = (usableRibbonWidthWorld - lineWidthWorld) * 0.5;

      for (const glyph of lineData.glyphs) {
        if (glyphCount >= maxGlyphs) break;

        const glyphLeftWorld = leftMarginWorld + glyph.x * fontScale;
        const glyphRightWorld = glyphLeftWorld + glyph.width * fontScale;

        const glyphTopInLineWorld = (lineHeightPx - glyph.y - glyph.height) * fontScale;
        const glyphBottomInLineWorld = glyphTopInLineWorld + glyph.height * fontScale;

        const glyphTopWorld = lineTopWorld + glyphTopInLineWorld;
        const glyphBottomWorld = lineTopWorld + glyphBottomInLineWorld;

        const s0 = glyphLeftWorld / usableRibbonWidthWorld;
        const s1 = glyphRightWorld / usableRibbonWidthWorld;

        const t0 = glyphTopWorld / dnaHeightWorld + 0.5;
        const t1 = glyphBottomWorld / dnaHeightWorld + 0.5;

        // skip outside useful param range
        if (t1 < -0.08 || t0 > 1.08) continue;

        const leftTop = helixPoint(t0, -1, inset);
        const rightTop = helixPoint(t0, 1, inset);
        const leftBottom = helixPoint(t1, -1, inset);
        const rightBottom = helixPoint(t1, 1, inset);

        const p0 = leftTop.clone().lerp(rightTop, s0);
        const p1 = leftTop.clone().lerp(rightTop, s1);
        const p2 = leftBottom.clone().lerp(rightBottom, s0);
        const p3 = leftBottom.clone().lerp(rightBottom, s1);

        const u0 = glyph.uv.x / atlasWidth;
        const u1 = (glyph.uv.x + glyph.uv.width) / atlasWidth;
        const v0 = 1.0 - (glyph.uv.y + glyph.uv.height) / atlasHeight;
        const v1 = 1.0 - glyph.uv.y / atlasHeight;

        const vi = glyphCount * 4;
        const ii = glyphCount * 6;

        setVertex(positions, vi + 0, p0);
        setVertex(positions, vi + 1, p1);
        setVertex(positions, vi + 2, p2);
        setVertex(positions, vi + 3, p3);

        setUV(uvs, vi + 0, u0, v0);
        setUV(uvs, vi + 1, u1, v0);
        setUV(uvs, vi + 2, u0, v1);
        setUV(uvs, vi + 3, u1, v1);

        alphas[vi + 0] = lineAlpha;
        alphas[vi + 1] = lineAlpha;
        alphas[vi + 2] = lineAlpha;
        alphas[vi + 3] = lineAlpha;

        indices[ii + 0] = vi + 0;
        indices[ii + 1] = vi + 2;
        indices[ii + 2] = vi + 1;
        indices[ii + 3] = vi + 2;
        indices[ii + 4] = vi + 3;
        indices[ii + 5] = vi + 1;

        glyphCount += 1;
      }
    }

    geometry.setDrawRange(0, glyphCount * 6);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.uv.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
    geometry.index.needsUpdate = true;
    geometry.computeBoundingSphere();
  }

  return {
    group,
    mesh,
    material,
    update
  };
}
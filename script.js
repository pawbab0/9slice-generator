/* ==========================================================================
   Generator 9-Slice UI - Logic & Interactivity
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const inputDimension = document.getElementById('inputDimension');
  const inputBgColor = document.getElementById('inputBgColor');
  const bgColorVal = document.getElementById('bgColorVal');
  const inputRadius = document.getElementById('inputRadius');
  const radiusVal = document.getElementById('radiusVal');
  const inputSliceInset = document.getElementById('inputSliceInset');
  const sliceInsetVal = document.getElementById('sliceInsetVal');
  const chkAutoInset = document.getElementById('chkAutoInset');
  const inputBorderWidth = document.getElementById('inputBorderWidth');
  const borderWidthVal = document.getElementById('borderWidthVal');
  const inputBorderColor = document.getElementById('inputBorderColor');
  const borderColorVal = document.getElementById('borderColorVal');
  const chkShadow = document.getElementById('chkShadow');

  // DOM Elements - Color Presets
  const presetBtns = document.querySelectorAll('.preset-btn');

  // DOM Elements - Metrics & Displays
  const metricSize = document.getElementById('metricSize');
  const metricCorners = document.getElementById('metricCorners');
  const metricCenter = document.getElementById('metricCenter');
  const codeCss = document.getElementById('codeCss');

  // DOM Elements - Canvases & Overlay
  const baseCanvas = document.getElementById('baseCanvas');
  const guideOverlay = document.getElementById('sliceGuideOverlay');
  const canvas1x1 = document.getElementById('canvas1x1');
  const canvas16x9 = document.getElementById('canvas16x9');
  const canvas9x16 = document.getElementById('canvas9x16');

  // Buttons
  const btnExportPng = document.getElementById('btnExportPng');
  const btnExportSvg = document.getElementById('btnExportSvg');
  const btnCopyCss = document.getElementById('btnCopyCss');

  // Helper to draw smooth rounded rect with vector arcTo precision
  function drawRoundRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
    radius = Math.min(radius, width / 2, height / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle && strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw 9-slice onto target canvas with high quality smoothing
  function render9Slice(srcCanvas, destCanvas, inset, srcW_orig, srcH_orig) {
    const dCtx = destCanvas.getContext('2d');
    const destW = destCanvas.width;
    const destH = destCanvas.height;

    // Enable high quality image smoothing
    dCtx.imageSmoothingEnabled = true;
    dCtx.imageSmoothingQuality = 'high';

    // Clear destination
    dCtx.clearRect(0, 0, destW, destH);

    const srcW = srcCanvas.width;
    const srcH = srcCanvas.height;
    const scaleX = srcW / srcW_orig;
    const scaleY = srcH / srcH_orig;

    // Safeguard inset bounds
    const safeInset = Math.min(inset, Math.floor(srcW_orig / 2) - 1, Math.floor(srcH_orig / 2) - 1);
    if (safeInset <= 0) return;

    const sL = safeInset * scaleX;
    const sR = safeInset * scaleX;
    const sT = safeInset * scaleY;
    const sB = safeInset * scaleY;

    const sMidW = srcW - sL - sR;
    const sMidH = srcH - sT - sB;

    const dL = safeInset * (destW / (canvas1x1.dataset.logicalW || 160));
    const dR = dL;
    const dT = safeInset * (destH / (canvas1x1.dataset.logicalH || 160));
    const dB = dT;

    const dMidW = destW - dL - dR;
    const dMidH = destH - dT - dB;

    // 1. Top-Left
    dCtx.drawImage(srcCanvas, 0, 0, sL, sT, 0, 0, dL, dT);
    // 2. Top-Center
    dCtx.drawImage(srcCanvas, sL, 0, sMidW, sT, dL, 0, dMidW, dT);
    // 3. Top-Right
    dCtx.drawImage(srcCanvas, srcW - sR, 0, sR, sT, destW - dR, 0, dR, dT);

    // 4. Middle-Left
    dCtx.drawImage(srcCanvas, 0, sT, sL, sMidH, 0, dT, dL, dMidH);
    // 5. Middle-Center
    dCtx.drawImage(srcCanvas, sL, sT, sMidW, sMidH, dL, dT, dMidW, dMidH);
    // 6. Middle-Right
    dCtx.drawImage(srcCanvas, srcW - sR, sT, sR, sMidH, destW - dR, dT, dR, dMidH);

    // 7. Bottom-Left
    dCtx.drawImage(srcCanvas, 0, srcH - sB, sL, sB, 0, destH - dB, dL, dB);
    // 8. Bottom-Center
    dCtx.drawImage(srcCanvas, sL, srcH - sB, sMidW, sB, dL, destH - dB, dMidW, dB);
    // 9. Bottom-Right
    dCtx.drawImage(srcCanvas, srcW - sR, srcH - sB, sR, sB, destW - dR, destH - dB, dR, dB);
  }

  // Main Render Update
  function updateGenerator() {
    const dim = parseInt(inputDimension.value, 10) || 64;
    const w = dim;
    const h = dim;
    const bgColor = inputBgColor.value;
    const radius = parseInt(inputRadius.value, 10) || 0;

    // Auto inset handler
    if (chkAutoInset.checked) {
      inputSliceInset.value = Math.max(radius, 2);
    }
    const inset = parseInt(inputSliceInset.value, 10) || 12;

    const bWidth = parseInt(inputBorderWidth.value, 10) || 0;
    const bColor = inputBorderColor.value;
    const hasShadow = chkShadow.checked;

    // Update Text Labels
    bgColorVal.textContent = bgColor.toUpperCase();
    radiusVal.textContent = `${radius} px`;
    sliceInsetVal.textContent = `${inset} px`;
    borderWidthVal.textContent = `${bWidth} px`;
    borderColorVal.textContent = bColor.toUpperCase();

    metricSize.textContent = `${w} × ${h} px`;
    metricCorners.textContent = `${inset} × ${inset} px`;
    const centerW = Math.max(0, w - 2 * inset);
    const centerH = Math.max(0, h - 2 * inset);
    metricCenter.textContent = `${centerW} × ${centerH} px`;

    // HiDPI Supersampling multiplier (4x for razor sharp curves on screen)
    const superScale = 4;
    baseCanvas.width = w * superScale;
    baseCanvas.height = h * superScale;

    const ctx = baseCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);

    // Optional Shadow
    if (hasShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8 * superScale;
      ctx.shadowOffsetY = 4 * superScale;
    }

    // Draw base shape at 4x resolution
    const halfBorder = bWidth > 0 ? (bWidth / 2) * superScale : 0;
    drawRoundRect(
      ctx,
      halfBorder,
      halfBorder,
      (w - bWidth) * superScale,
      (h - bWidth) * superScale,
      radius * superScale,
      bgColor,
      bWidth > 0 ? bColor : null,
      bWidth * superScale
    );

    if (hasShadow) {
      ctx.restore();
    }

    // Scale display canvas for base preview
    const maxDisplaySize = 180;
    const displayScale = Math.min(maxDisplaySize / w, maxDisplaySize / h, 3);
    const displayW = Math.round(w * displayScale);
    const displayH = Math.round(h * displayScale);

    baseCanvas.style.width = `${displayW}px`;
    baseCanvas.style.height = `${displayH}px`;

    // Position Guide Overlay
    guideOverlay.style.width = `${displayW}px`;
    guideOverlay.style.height = `${displayH}px`;

    const vLeft = guideOverlay.querySelector('.v-line-left');
    const vRight = guideOverlay.querySelector('.v-line-right');
    const hTop = guideOverlay.querySelector('.h-line-top');
    const hBottom = guideOverlay.querySelector('.h-line-bottom');

    const scaledInsetX = inset * displayScale;
    const scaledInsetY = inset * displayScale;

    vLeft.style.left = `${scaledInsetX}px`;
    vRight.style.left = `${displayW - scaledInsetX}px`;
    hTop.style.top = `${scaledInsetY}px`;
    hBottom.style.top = `${displayH - scaledInsetY}px`;

    // Position Cell Labels
    positionGridCells(displayW, displayH, scaledInsetX, scaledInsetY);

    // Render HiDPI Previews (2x DPR resolution for crisp previews)
    setupHiDpiCanvas(canvas1x1, 160, 160);
    setupHiDpiCanvas(canvas16x9, 320, 180);
    setupHiDpiCanvas(canvas9x16, 180, 320);

    render9Slice(baseCanvas, canvas1x1, inset, w, h);
    render9Slice(baseCanvas, canvas16x9, inset, w, h);
    render9Slice(baseCanvas, canvas9x16, inset, w, h);

    // Update CSS Code snippet
    codeCss.textContent = `/* CSS Border-Image Specification */
border-image-source: url('9slice-image.png');
border-image-slice: ${inset} fill;
border-image-width: ${inset}px;
border-image-repeat: stretch;`;
  }

  // Helper for HiDPI setup of preview canvases
  function setupHiDpiCanvas(canvas, logicalW, logicalH) {
    const dpr = 2;
    canvas.dataset.logicalW = logicalW;
    canvas.dataset.logicalH = logicalH;
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
  }

  // Helper to position labels TL, T, TR...
  function positionGridCells(w, h, ix, iy) {
    const cells = {
      '.cell-tl': { left: 0, top: 0, width: ix, height: iy },
      '.cell-t': { left: ix, top: 0, width: w - 2 * ix, height: iy },
      '.cell-tr': { left: w - ix, top: 0, width: ix, height: iy },
      '.cell-l': { left: 0, top: iy, width: ix, height: h - 2 * iy },
      '.cell-c': { left: ix, top: iy, width: w - 2 * ix, height: h - 2 * iy },
      '.cell-r': { left: w - ix, top: iy, width: ix, height: h - 2 * iy },
      '.cell-bl': { left: 0, top: h - iy, width: ix, height: iy },
      '.cell-b': { left: ix, top: h - iy, width: w - 2 * ix, height: iy },
      '.cell-br': { left: w - ix, top: h - iy, width: ix, height: iy }
    };

    for (const [selector, pos] of Object.entries(cells)) {
      const el = guideOverlay.querySelector(selector);
      if (el) {
        el.style.left = `${pos.left}px`;
        el.style.top = `${pos.top}px`;
        el.style.width = `${pos.width}px`;
        el.style.height = `${pos.height}px`;
      }
    }
  }

  // Event Listeners for Controls
  const inputs = [
    inputDimension, inputBgColor, inputRadius,
    inputSliceInset, chkAutoInset, inputBorderWidth,
    inputBorderColor, chkShadow
  ];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateGenerator);
      input.addEventListener('change', updateGenerator);
    }
  });

  // Preset Buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      inputBgColor.value = btn.dataset.color;
      updateGenerator();
    });
  });

  // Export PNG
  btnExportPng.addEventListener('click', () => {
    const link = document.createElement('a');
    const dim = inputDimension.value;
    link.download = `9slice_${dim}x${dim}.png`;
    link.href = baseCanvas.toDataURL('image/png');
    link.click();
  });

  // Copy CSS Code
  btnCopyCss.addEventListener('click', () => {
    navigator.clipboard.writeText(codeCss.textContent).then(() => {
      btnCopyCss.textContent = 'Skopiowano!';
      setTimeout(() => {
        btnCopyCss.textContent = 'Skopiuj CSS';
      }, 2000);
    });
  });

  // Export SVG
  btnExportSvg.addEventListener('click', () => {
    const dim = parseInt(inputDimension.value, 10) || 64;
    const bgColor = inputBgColor.value;
    const radius = parseInt(inputRadius.value, 10) || 0;
    const bWidth = parseInt(inputBorderWidth.value, 10) || 0;
    const bColor = inputBorderColor.value;
    const hasShadow = chkShadow.checked;

    const halfBorder = bWidth > 0 ? bWidth / 2 : 0;
    const rectW = dim - bWidth;
    const rectH = dim - bWidth;
    const r = Math.min(radius, rectW / 2, rectH / 2);

    let filterDef = '';
    let filterAttr = '';

    if (hasShadow) {
      filterDef = `
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>`;
      filterAttr = ' filter="url(#shadow)"';
    }

    const strokeAttr = bWidth > 0 ? ` stroke="${bColor}" stroke-width="${bWidth}"` : '';

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}">
${filterDef}
  <rect x="${halfBorder}" y="${halfBorder}" width="${rectW}" height="${rectH}" rx="${r}" ry="${r}" fill="${bgColor}"${strokeAttr}${filterAttr}/>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `9slice_${dim}x${dim}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Run
  updateGenerator();
});

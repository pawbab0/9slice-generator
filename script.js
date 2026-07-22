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
  const btnExportPdf = document.getElementById('btnExportPdf');
  const btnCopyCss = document.getElementById('btnCopyCss');

  // Helper to draw smooth rounded rect with subpixel precision
  function drawRoundRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
    radius = Math.min(radius, width / 2, height / 2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
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
  function render9Slice(srcCanvas, destCanvas, inset) {
    const dCtx = destCanvas.getContext('2d');
    const srcW = srcCanvas.width;
    const srcH = srcCanvas.height;
    const destW = destCanvas.width;
    const destH = destCanvas.height;

    // Enable high quality image smoothing
    dCtx.imageSmoothingEnabled = true;
    dCtx.imageSmoothingQuality = 'high';

    // Clear destination
    dCtx.clearRect(0, 0, destW, destH);

    // Safeguard inset bounds
    const safeInset = Math.min(inset, Math.floor(srcW / 2) - 1, Math.floor(srcH / 2) - 1);
    if (safeInset <= 0) return;

    const sL = safeInset;
    const sR = safeInset;
    const sT = safeInset;
    const sB = safeInset;

    const sMidW = srcW - sL - sR;
    const sMidH = srcH - sT - sB;

    const dMidW = destW - sL - sR;
    const dMidH = destH - sT - sB;

    // 1. Top-Left
    dCtx.drawImage(srcCanvas, 0, 0, sL, sT, 0, 0, sL, sT);
    // 2. Top-Center
    dCtx.drawImage(srcCanvas, sL, 0, sMidW, sT, sL, 0, dMidW, sT);
    // 3. Top-Right
    dCtx.drawImage(srcCanvas, srcW - sR, 0, sR, sT, destW - sR, 0, sR, sT);

    // 4. Middle-Left
    dCtx.drawImage(srcCanvas, 0, sT, sL, sMidH, 0, sT, sL, dMidH);
    // 5. Middle-Center
    dCtx.drawImage(srcCanvas, sL, sT, sMidW, sMidH, sL, sT, dMidW, dMidH);
    // 6. Middle-Right
    dCtx.drawImage(srcCanvas, srcW - sR, sT, sR, sMidH, destW - sR, sT, sR, dMidH);

    // 7. Bottom-Left
    dCtx.drawImage(srcCanvas, 0, srcH - sB, sL, sB, 0, destH - sB, sL, sB);
    // 8. Bottom-Center
    dCtx.drawImage(srcCanvas, sL, srcH - sB, sMidW, sB, sL, destH - sB, dMidW, sB);
    // 9. Bottom-Right
    dCtx.drawImage(srcCanvas, srcW - sR, srcH - sB, sR, sB, destW - sR, destH - sB, sR, sB);
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

    // Resize Base Canvas
    baseCanvas.width = w;
    baseCanvas.height = h;

    const ctx = baseCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    // Optional Shadow
    if (hasShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
    }

    // Draw base shape
    const halfBorder = bWidth > 0 ? bWidth / 2 : 0;
    drawRoundRect(
      ctx,
      halfBorder,
      halfBorder,
      w - bWidth,
      h - bWidth,
      radius,
      bgColor,
      bWidth > 0 ? bColor : null,
      bWidth
    );

    if (hasShadow) {
      ctx.restore();
    }

    // Scale display canvas for base preview (Zoom factor for visual comfort)
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

    // Render Scaling Previews (1:1, 16:9, 9:16)
    render9Slice(baseCanvas, canvas1x1, inset);
    render9Slice(baseCanvas, canvas16x9, inset);
    render9Slice(baseCanvas, canvas9x16, inset);

    // Update CSS Code snippet
    codeCss.textContent = `/* CSS Border-Image Specification */
border-image-source: url('9slice-image.png');
border-image-slice: ${inset} fill;
border-image-width: ${inset}px;
border-image-repeat: stretch;`;
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

  // Export PDF with jsPDF
  btnExportPdf.addEventListener('click', () => {
    if (!window.jspdf) {
      alert('Biblioteka PDF nie została jeszcze załadowana.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark PDF styling or clean professional printable styling
    pdf.setFillColor(15, 23, 42); // #0f172a
    pdf.rect(0, 0, 210, 297, 'F');

    // Title Header
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('Specyfikacja Grafiki 9-Slice', 20, 25);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184); // #94a3b8
    pdf.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 20, 32);

    // Divider Line
    pdf.setDrawColor(46, 61, 91);
    pdf.setLineWidth(0.5);
    pdf.line(20, 36, 190, 36);

    // Section 1: Parameters Table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Parametry techniczne', 20, 48);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(203, 213, 225);

    const dimVal = inputDimension.value;
    const params = [
      ['Rozmiar bazowy:', `${dimVal} × ${dimVal} px`],
      ['Kolor tła:', `${inputBgColor.value.toUpperCase()}`],
      ['Zaokrąglenie (Radius):', `${inputRadius.value} px`],
      ['Margines cięcia (Slice Inset):', `${inputSliceInset.value} px`],
      ['Obramowanie:', `${inputBorderWidth.value} px (${inputBorderColor.value.toUpperCase()})`]
    ];

    let startY = 56;
    params.forEach(([label, val]) => {
      pdf.setTextColor(148, 163, 184);
      pdf.text(label, 25, startY);
      pdf.setTextColor(96, 165, 250);
      pdf.text(val, 85, startY);
      startY += 7;
    });

    // Section 2: Base Image & Slice Breakdown
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Obraz źródłowy 9-Slice (1:1 oryginał)', 20, startY + 10);

    const imgData = baseCanvas.toDataURL('image/png');
    // Draw base image centered
    const baseDim = parseInt(dimVal, 10) || 64;
    const scaleFactor = Math.min(30 / baseDim, 1);
    const drawW = baseDim * scaleFactor;
    const drawH = baseDim * scaleFactor;

    pdf.addImage(imgData, 'PNG', 25, startY + 16, drawW, drawH);

    // Section 3: Previews (1:1, 16:9, 9:16)
    const prevY = startY + 55;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Podglądy skalowania w proporcjach', 20, prevY);

    const p1 = canvas1x1.toDataURL('image/png');
    const p2 = canvas16x9.toDataURL('image/png');
    const p3 = canvas9x16.toDataURL('image/png');

    // 1:1 Image
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Format 1:1 (160×160)', 25, prevY + 10);
    pdf.addImage(p1, 'PNG', 25, prevY + 14, 40, 40);

    // 16:9 Image
    pdf.text('Format 16:9 (320×180)', 75, prevY + 10);
    pdf.addImage(p2, 'PNG', 75, prevY + 14, 60, 33.75);

    // 9:16 Image
    pdf.text('Format 9:16 (180×320)', 145, prevY + 10);
    pdf.addImage(p3, 'PNG', 145, prevY + 14, 30, 53.33);

    // CSS Snippet Section
    const cssY = prevY + 75;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Kod konfiguracyjny CSS', 20, cssY);

    pdf.setFillColor(19, 27, 46);
    pdf.rect(20, cssY + 5, 170, 25, 'F');
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(165, 243, 252);
    pdf.text(`border-image-source: url('9slice-image.png');`, 25, cssY + 13);
    pdf.text(`border-image-slice: ${inputSliceInset.value} fill;`, 25, cssY + 18);
    pdf.text(`border-image-width: ${inputSliceInset.value}px;`, 25, cssY + 23);

    // Save PDF
    pdf.save(`9slice_spec_${dimVal}x${dimVal}.pdf`);
  });

  // Initial Run
  updateGenerator();
});

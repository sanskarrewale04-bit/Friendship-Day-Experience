import html2canvas from 'html2canvas';

const canvasCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

function oklchToRgbFallback(match: string): string {
  try {
    const content = match.replace(/oklch\((.*)\)/i, '$1').trim();
    const parts = content.split(/[\s\/]+/).filter(Boolean);
    if (parts.length < 3) return 'rgba(128,128,128,1)';

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l = parseFloat(parts[0]) / 100;
    const c = parseFloat(parts[1]);
    const h = parseFloat(parts[2]);
    const a = parts[3] ? (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])) : 1;

    const hRad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    r = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
    b = Math.min(255, Math.max(0, Math.round(gamma(b) * 255)));

    return `rgba(${r}, ${g}, ${b}, ${isNaN(a) ? 1 : a})`;
  } catch (e) {
    return 'rgba(128,128,128,1)';
  }
}

function oklabToRgbFallback(match: string): string {
  try {
    const content = match.replace(/oklab\((.*)\)/i, '$1').trim();
    const parts = content.split(/[\s\/]+/).filter(Boolean);
    if (parts.length < 3) return 'rgba(128,128,128,1)';

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l = parseFloat(parts[0]) / 100;
    let aLab = parseFloat(parts[1]);
    let bLab = parseFloat(parts[2]);
    const a = parts[3] ? (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])) : 1;

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    r = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
    b = Math.min(255, Math.max(0, Math.round(gamma(b) * 255)));

    return `rgba(${r}, ${g}, ${b}, ${isNaN(a) ? 1 : a})`;
  } catch (e) {
    return 'rgba(128,128,128,1)';
  }
}

export function parseColorToRgb(colorStr: string): string {
  if (!colorStr || (!colorStr.includes('oklch') && !colorStr.includes('oklab'))) return colorStr;

  return colorStr.replace(/oklch\([^)]+\)|oklab\([^)]+\)/gi, (match) => {
    if (canvasCtx) {
      try {
        canvasCtx.fillStyle = 'rgba(0,0,0,0)';
        canvasCtx.fillStyle = match;
        const res = canvasCtx.fillStyle;
        if (res && res !== 'rgba(0,0,0,0)' && res !== '#000000') {
          return res;
        }
      } catch (e) {
        // fallback
      }
    }
    if (match.toLowerCase().startsWith('oklab')) {
      return oklabToRgbFallback(match);
    }
    return oklchToRgbFallback(match);
  });
}

export async function safeHtml2Canvas(element: HTMLElement, options: Parameters<typeof html2canvas>[1] = {}) {
  // 1. Wait for fonts to be ready
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore
    }
  }

  // 2. Pre-inline external images in cloned or source element if cross-origin
  const imgs = Array.from(element.querySelectorAll<HTMLImageElement>('img'));
  const originalSources: { el: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith('data:')) return;
      try {
        const resp = await fetch(src, { mode: 'cors' });
        if (resp.ok) {
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          originalSources.push({ el: img, src });
          img.src = dataUrl;
        }
      } catch (e) {
        // If fetch fails, keep original src
      }
    })
  );

  // Backup and temporary convert style tags in main document
  const originalStyles: { el: HTMLStyleElement; text: string }[] = [];
  if (typeof document !== 'undefined') {
    const styleTags = Array.from(document.querySelectorAll('style'));
    styleTags.forEach((tag) => {
      let cssText = tag.textContent || '';
      if (!cssText && tag.sheet) {
        try {
          const rules = Array.from(tag.sheet.cssRules);
          cssText = rules.map((r) => r.cssText).join('\n');
        } catch (e) {
          // ignore
        }
      }
      if (cssText && (cssText.includes('oklch') || cssText.includes('oklab'))) {
        originalStyles.push({ el: tag, text: tag.textContent || '' });
        tag.textContent = parseColorToRgb(cssText);
      }
    });
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      ...options,
      onclone: (clonedDoc, clonedElement) => {
        // 1. Sanitize all <style> tags in clonedDoc
        try {
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          styleTags.forEach((tag) => {
            let cssText = tag.textContent || '';
            if (!cssText && tag.sheet) {
              try {
                const rules = Array.from(tag.sheet.cssRules);
                cssText = rules.map((r) => r.cssText).join('\n');
              } catch (e) {
                // ignore
              }
            }
            if (cssText && (cssText.includes('oklch') || cssText.includes('oklab'))) {
              tag.textContent = parseColorToRgb(cssText);
            }
          });
        } catch (e) {
          // ignore
        }

        // 2. Convert all element computed styles and inline styles to explicit converted RGB
        try {
          const allElements = [clonedElement, ...Array.from(clonedElement.querySelectorAll<HTMLElement>('*'))];
          allElements.forEach((el) => {
            try {
              const computed = window.getComputedStyle(el);
              const colorProps = [
                'color',
                'background-color',
                'border-color',
                'border-top-color',
                'border-right-color',
                'border-bottom-color',
                'border-left-color',
                'outline-color',
                'fill',
                'stroke',
                'box-shadow',
                'background'
              ];

              colorProps.forEach((prop) => {
                const val = computed.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  const converted = parseColorToRgb(val);
                  el.style.setProperty(prop, converted, 'important');
                }
              });

              const inlineStyle = el.getAttribute('style');
              if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab'))) {
                el.setAttribute('style', parseColorToRgb(inlineStyle));
              }
            } catch (e) {
              // ignore
            }
          });
        } catch (e) {
          // ignore
        }

        if (options.onclone) {
          options.onclone(clonedDoc, clonedElement);
        }
      }
    });

    return canvas;
  } finally {
    // Restore original style tags in main document
    originalStyles.forEach(({ el, text }) => {
      el.textContent = text;
    });
    // Restore original image sources
    originalSources.forEach(({ el, src }) => {
      el.src = src;
    });
  }
}




// Quick-convert from un-normalized HSL to normalized RGB
export const hslToRgb = (color) => {
  const [h, s, l] = color;

  const calcVal = (n) => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  let r = calcVal(0),
    g = calcVal(8),
    b = calcVal(4);

  return [r, g, b];
};

// Calculate relative luminance for a normalized RGB color
export const calcLuminance = (color) => {
  const [r, g, b] = color.map((val) => {
    if (val <= 0.03928) {
      return val / 12.92;
    }

    return Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate relative luminance contrast ratio for two luminance values
export const calcContrast = (l1, l2) => {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Binary search for determining a lightness value resulting in a relative luminance contrast ratio equalling 4.5 given a hue, a saturation, and an HSL color.
export const findLightnessForContrast = (h, s, color) => {
  const targetRatio = 4.5;
  const targetDistance = 0.00001;

  let l1min = 0.0;
  let l1max = 1.0;

  const l2 = calcLuminance(hslToRgb(color));

  // Calculate l1's sign by solving calcContrast for l1
  let dir = 1;
  if ((l2 + 0.05) / targetRatio - 0.05 < 0) {
    dir = -1;
  }

  let loop = 0,
    contrast = 0.0;

  // Perform our binary search until we get within targetDistance
  while (Math.abs(targetRatio - contrast) > targetDistance) {
    let l = l1min + (l1max - l1min) / 2;
    const l1 = calcLuminance(hslToRgb([h, s, l]));

    contrast = calcContrast(l1, l2);

    // We need to handle contrast in both directions
    if (dir > 0) {
      if (contrast < targetRatio) {
        l1max = l;
      } else {
        l1min = l;
      }
    } else {
      if (contrast < targetRatio) {
        l1min = l;
      } else {
        l1max = l;
      }
    }

    // Safety net for our loop, just in case
    if (loop++ > 50) break;
  }

  return l1min + (l1max - l1min) / 2;
};

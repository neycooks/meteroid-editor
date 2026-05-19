export function applyBoxBlur(imageData: ImageData, radius: number): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const outputData = output.data;
  const copy = new Uint8ClampedArray(data);

  const size = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += copy[idx];
            g += copy[idx + 1];
            b += copy[idx + 2];
            a += copy[idx + 3];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      outputData[idx] = r / count;
      outputData[idx + 1] = g / count;
      outputData[idx + 2] = b / count;
      outputData[idx + 3] = a / count;
    }
  }

  return output;
}

export function applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  const sigma = radius / 2;
  const size = radius * 2 + 1;
  const kernel: number[] = [];
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - radius;
    const val = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }

  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  const temp = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let val = 0;
        for (let k = 0; k < size; k++) {
          const px = Math.min(Math.max(x + k - radius, 0), width - 1);
          val += data[(y * width + px) * 4 + c] * kernel[k];
        }
        temp[(y * width + x) * 4 + c] = val;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let val = 0;
        for (let k = 0; k < size; k++) {
          const py = Math.min(Math.max(y + k - radius, 0), height - 1);
          val += temp[(py * width + x) * 4 + c] * kernel[k];
        }
        output.data[(y * width + x) * 4 + c] = val;
      }
    }
  }

  return output;
}

export function applySharpen(imageData: ImageData, amount: number): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const copy = new Uint8ClampedArray(data);

  const kernel = [
    0, -amount, 0,
    -amount, 1 + 4 * amount, -amount,
    0, -amount, 0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output.data[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, sum));
      }
      output.data[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }

  return output;
}

export function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c] + brightness;
      val = factor * (val - 128) + 128;
      outputData[i + c] = Math.max(0, Math.min(255, val));
    }
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyHueSaturation(
  imageData: ImageData,
  hue: number,
  saturation: number,
  lightness: number
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255;
    let g = data[i + 1] / 255;
    let b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = (h + hue / 360) % 1;
    if (h < 0) h += 1;
    s = Math.max(0, Math.min(1, s + saturation / 100));
    const newL = Math.max(0, Math.min(1, l + lightness / 100));

    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
    const p = 2 * newL - q;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    outputData[i] = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    outputData[i + 1] = Math.round(hue2rgb(p, q, h) * 255);
    outputData[i + 2] = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyInvert(imageData: ImageData): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    outputData[i] = 255 - data[i];
    outputData[i + 1] = 255 - data[i + 1];
    outputData[i + 2] = 255 - data[i + 2];
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyDesaturate(imageData: ImageData): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    outputData[i] = gray;
    outputData[i + 1] = gray;
    outputData[i + 2] = gray;
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyLevels(
  imageData: ImageData,
  inBlack: number,
  inWhite: number,
  gamma: number,
  outBlack: number,
  outWhite: number
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  const inRange = inWhite - inBlack;
  const outRange = outWhite - outBlack;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = (data[i + c] - inBlack) / inRange;
      val = Math.max(0, Math.min(1, val));
      val = Math.pow(val, 1 / gamma);
      val = outBlack + val * outRange;
      outputData[i + c] = Math.max(0, Math.min(255, val));
    }
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyPosterize(imageData: ImageData, levels: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      outputData[i + c] = Math.round(Math.round(data[i + c] / step) * step);
    }
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray >= threshold ? 255 : 0;
    outputData[i] = val;
    outputData[i + 1] = val;
    outputData[i + 2] = val;
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyNoise(imageData: ImageData, amount: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      outputData[i + c] = Math.max(0, Math.min(255, data[i + c] + (Math.random() - 0.5) * amount));
    }
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

export function applyPixelate(imageData: ImageData, size: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let y = 0; y < imageData.height; y += size) {
    for (let x = 0; x < imageData.width; x += size) {
      const idx = (y * imageData.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      for (let dy = 0; dy < size && y + dy < imageData.height; dy++) {
        for (let dx = 0; dx < size && x + dx < imageData.width; dx++) {
          const pIdx = ((y + dy) * imageData.width + (x + dx)) * 4;
          outputData[pIdx] = r;
          outputData[pIdx + 1] = g;
          outputData[pIdx + 2] = b;
          outputData[pIdx + 3] = a;
        }
      }
    }
  }

  return output;
}

export function applyColorBalance(
  imageData: ImageData,
  cyanRed: number,
  magentaGreen: number,
  yellowBlue: number
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const outputData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    outputData[i] = Math.max(0, Math.min(255, data[i] + cyanRed));
    outputData[i + 1] = Math.max(0, Math.min(255, data[i + 1] + magentaGreen));
    outputData[i + 2] = Math.max(0, Math.min(255, data[i + 2] + yellowBlue));
    outputData[i + 3] = data[i + 3];
  }

  return output;
}

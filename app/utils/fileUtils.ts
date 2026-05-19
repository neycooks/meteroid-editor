export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function exportToPNG(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportToJPEG(canvas: HTMLCanvasElement, filename: string, quality: number = 0.92): void {
  const link = document.createElement('a');
  link.download = `${filename}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', quality);
  link.click();
}

export function exportToWebP(canvas: HTMLCanvasElement, filename: string, quality: number = 0.92): void {
  const link = document.createElement('a');
  link.download = `${filename}.webp`;
  link.href = canvas.toDataURL('image/webp', quality);
  link.click();
}

export function exportToBMP(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.bmp`;
  link.href = canvas.toDataURL('image/bmp');
  link.click();
}

export function flattenLayers(
  layers: { canvas: HTMLCanvasElement; visible: boolean; opacity: number; x: number; y: number }[],
  width: number,
  height: number
): HTMLCanvasElement {
  const flatCanvas = document.createElement('canvas');
  flatCanvas.width = width;
  flatCanvas.height = height;
  const ctx = flatCanvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const reversedLayers = [...layers].reverse();
  for (const layer of reversedLayers) {
    if (!layer.visible) continue;
    ctx.globalAlpha = layer.opacity / 100;
    ctx.drawImage(layer.canvas, layer.x, layer.y);
  }

  return flatCanvas;
}

export function createCheckerboardPattern(size: number = 8): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cccccc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#999999';
  ctx.fillRect(0, 0, size, size);
  ctx.fillRect(size, size, size, size);

  return canvas;
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return loadImage(file).then((img) => ({
    width: img.width,
    height: img.height,
  }));
}

export function resizeCanvas(
  source: HTMLCanvasElement,
  newWidth: number,
  newHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, newWidth, newHeight);
  return canvas;
}

export function rotateCanvas(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (degrees === 90 || degrees === 270 || degrees === -90) {
    canvas.width = source.height;
    canvas.height = source.width;
  } else {
    canvas.width = source.width;
    canvas.height = source.height;
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}

export function flipCanvas(source: HTMLCanvasElement, horizontal: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d')!;

  if (horizontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(source, 0, 0);
  return canvas;
}

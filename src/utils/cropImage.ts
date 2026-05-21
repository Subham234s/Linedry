/**
 * Generates a cropped circular image Blob from the source image and crop area.
 * Uses an offscreen canvas to extract the exact pixels selected by react-easy-crop.
 */

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Returns a Blob of the cropped region rendered into a circular PNG.
 * Output is a square canvas with the cropped region clipped to a circle.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize: number = 256
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to get canvas context');

  // Set output dimensions
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw the cropped region scaled to the output size
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  // Apply circular mask using composite operation
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Convert canvas to Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      },
      'image/png',
      1
    );
  });
}

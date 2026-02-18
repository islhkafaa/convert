export interface ImageOptions {
  resize?: {
    width?: number;
    height?: number;
    percentage?: number;
    maintainRatio?: boolean;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotate?: 0 | 90 | 180 | 270;
  flip?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
  filters?: {
    grayscale?: boolean;
    sepia?: boolean;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  };
}

export async function processImage(
  file: File | Blob,
  options: ImageOptions,
  outputType: string = "image/png",
  quality: number = 0.92,
): Promise<Blob> {
  const imgBitmap = await createImageBitmap(file);
  let { width, height } = imgBitmap;

  if (options.resize) {
    if (options.resize.percentage) {
      width = (width * options.resize.percentage) / 100;
      height = (height * options.resize.percentage) / 100;
    } else if (options.resize.width || options.resize.height) {
      if (options.resize.maintainRatio) {
        const ratio = imgBitmap.width / imgBitmap.height;
        if (options.resize.width && options.resize.height) {
          width = options.resize.width;
          height = options.resize.height;
        } else if (options.resize.width) {
          width = options.resize.width;
          height = width / ratio;
        } else if (options.resize.height) {
          height = options.resize.height;
          width = height * ratio;
        }
      } else {
        width = options.resize.width || width;
        height = options.resize.height || height;
      }
    }
  }

  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let ctx: CanvasRenderingContext2D | OffscreenRenderingContext | null;

  const targetWidth =
    options.rotate === 90 || options.rotate === 270 ? height : width;
  const targetHeight =
    options.rotate === 90 || options.rotate === 270 ? width : height;

  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(targetWidth, targetHeight);
    ctx = canvas.getContext("2d");
  } else {
    const htmlCanvas = document.createElement("canvas");
    htmlCanvas.width = targetWidth;
    htmlCanvas.height = targetHeight;
    canvas = htmlCanvas;
    ctx = htmlCanvas.getContext("2d");
  }

  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.save();

  if (options.rotate || options.flip?.horizontal || options.flip?.vertical) {
    ctx.translate(targetWidth / 2, targetHeight / 2);

    if (options.rotate) {
      ctx.rotate((options.rotate * Math.PI) / 180);
    }

    if (options.flip?.horizontal || options.flip?.vertical) {
      ctx.scale(
        options.flip.horizontal ? -1 : 1,
        options.flip.vertical ? -1 : 1,
      );
    }

    ctx.translate(-width / 2, -height / 2);
  }

  if (options.filters) {
    let filterString = "";
    if (options.filters.grayscale) filterString += "grayscale(100%) ";
    if (options.filters.sepia) filterString += "sepia(100%) ";
    if (options.filters.brightness !== undefined)
      filterString += `brightness(${100 + options.filters.brightness}%) `;
    if (options.filters.contrast !== undefined)
      filterString += `contrast(${100 + options.filters.contrast}%) `;
    if (options.filters.saturation !== undefined)
      filterString += `saturate(${100 + options.filters.saturation}%) `;
    if (options.filters.blur)
      filterString += `blur(${options.filters.blur}px) `;

    if (filterString) {
      (ctx as CanvasRenderingContext2D).filter = filterString.trim();
    }
  }

  if (options.crop) {
    ctx.drawImage(
      imgBitmap,
      options.crop.x,
      options.crop.y,
      options.crop.width,
      options.crop.height,
      0,
      0,
      width,
      height,
    );
  } else {
    ctx.drawImage(imgBitmap, 0, 0, width, height);
  }

  ctx.restore();
  imgBitmap.close();

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: outputType, quality });
  }

  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
      outputType,
      quality,
    );
  });
}

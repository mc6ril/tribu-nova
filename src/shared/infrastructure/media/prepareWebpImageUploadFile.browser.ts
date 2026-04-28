type PrepareWebpImageUploadFileOptions = {
  maxDimensionPx: number;
  outputMimeType: string;
  outputQuality: number;
  outputFilename: string;
};

const resizeDimensions = (
  width: number,
  height: number,
  maxDimensionPx: number
) => {
  const maxDimension = Math.max(width, height);

  if (maxDimension <= maxDimensionPx) {
    return { width, height };
  }

  const scale = maxDimensionPx / maxDimension;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const loadImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be processed"));
    };

    image.src = objectUrl;
  });
};

const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  outputMimeType: string,
  outputQuality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image could not be processed"));
          return;
        }

        resolve(blob);
      },
      outputMimeType,
      outputQuality
    );
  });
};

export const prepareWebpImageUploadFile = async (
  file: File,
  options: PrepareWebpImageUploadFileOptions
): Promise<File> => {
  const image = await loadImage(file);
  const { width, height } = resizeDimensions(
    image.width,
    image.height,
    options.maxDimensionPx
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image could not be processed");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(
    canvas,
    options.outputMimeType,
    options.outputQuality
  );

  return new File([blob], options.outputFilename, {
    type: options.outputMimeType,
    lastModified: Date.now(),
  });
};

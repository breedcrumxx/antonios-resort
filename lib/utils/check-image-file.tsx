// Utility function to check if a file is an image based on its extension
const isImageExtension = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
};

// Utility function to check if a file is an image based on its MIME type
const isImageMimeType = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Main function to check if a file is an image
export const isImageFile = (file: File): boolean => {
  return isImageExtension(file.name) && isImageMimeType(file);
};
export const base64ToBlob = (dataString: string, contentType = '', sliceSize = 512) => {

  const [data, base64] = dataString.split(",")

  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

export const b64ToFile = (dataString: string, filename: string, contentType = "") => {
  const blob = base64ToBlob(dataString, contentType)
  return new File([blob], filename, { type: contentType });
}

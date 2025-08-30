declare module "docxtemplater-image-module-free" {
  interface ImageModuleOptions {
    centered?: boolean;
    getImage: (tagValue: string) => false | ArrayBuffer | Buffer | Uint8Array;
    getSize: (img: Buffer | Uint8Array) => number[];
    fileType?: string;
  }

  export default class ImageModule {
    constructor(options: ImageModuleOptions);
  }
}

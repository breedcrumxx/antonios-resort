import * as CryptoJS from 'crypto-js';

export const md5Checker = (updatedRefList: string, previmages: string) => {
  try {

    const newdata = CryptoJS.MD5(updatedRefList).toString(CryptoJS.enc.Hex);
    const olddata = CryptoJS.MD5(previmages).toString(CryptoJS.enc.Hex);

    return { status: !(newdata === olddata) }
  } catch (error) {
    return { status: false }
  }
}
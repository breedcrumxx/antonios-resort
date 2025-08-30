
export const changesChecker = (update: any, current: any): boolean => {
  return Object.keys(current).some(key => current[key] != update[key]);
}
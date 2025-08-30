// Function to format the template string
export function formatString<T extends { [key: string]: any }>(template: string, values: T): string {
  return template.replace(/\${(.*?)}/g, (_, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : '';
  });
}

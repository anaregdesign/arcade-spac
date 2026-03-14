export function createFormDataFromEntries(entries: Iterable<readonly [string, string]>): FormData {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  return formData;
}

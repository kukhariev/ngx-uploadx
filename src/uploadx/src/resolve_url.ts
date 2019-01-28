export function resolveUrl(url: string, baseURI: string) {
  if (
    url.indexOf('//') * url.indexOf('https://') * url.indexOf('http://') ===
    0
  ) {
    return url;
  }
  try {
    return new URL(url, baseURI).href;
  } catch {}

  if (url.indexOf('/') === 0) {
    const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)/g);
    const origin = matches && matches[0];
    return origin + url;
  } else {
    const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)?(.*\/)/g);
    const path = matches && matches[0];
    return path + url;
  }
}

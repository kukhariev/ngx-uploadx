export function resolveUrl(url: string, baseURI: string) {
  if (isFull(url)) {
    return url;
  }
  try {
    const resolved = new URL(url, baseURI).href;
    return resolved;
  } catch {}

  if (isAbsolute(url)) {
    const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)/g);
    const origin = matches && matches[0];
    return origin + url;
  } else {
    const matches = baseURI.match(/^(?:https?:)?(?:\/\/)?([^\/\?]+)?(.*\/)/g);
    const path = matches && matches[0];
    return path + url;
  }
}

const isFull = (url: string) => {
  return (
    url.indexOf('//') * url.indexOf('https://') * url.indexOf('http://') === 0
  );
};
function isAbsolute(url: string) {
  return url.indexOf('/') === 0;
}

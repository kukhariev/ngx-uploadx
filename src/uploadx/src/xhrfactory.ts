export let XHRFactory = (() => {
  let stack = Array(1).fill(createXHR());
  const noop = null;

  function createXHR() {
    return new XMLHttpRequest();
  }

  return {
    release: (xhr) => {
      xhr.onreadystatechange = noop;
      xhr.onerror = noop;
      xhr.onload = noop;
      xhr.upload.onprogress = noop;
      stack.push(xhr);
    },
    getInstance() {
      if (!stack.length) {
        return createXHR();
      } else {
        return stack.pop();
      }
    },
    get size() {
      return stack.length;
    },
    set size(s) {
      stack = Array(s).fill(createXHR());
    }
  };
})();

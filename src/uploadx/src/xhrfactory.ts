export let XHRFactory = (() => {
  let stack = Array(1).fill(createXHR());

  function createXHR() {
    return new XMLHttpRequest();
  }

  return {
    release: xhr => {
      xhr.onreadystatechange = null;
      xhr.onerror = null;
      xhr.onload = null;
      xhr.upload.onprogress = null;
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

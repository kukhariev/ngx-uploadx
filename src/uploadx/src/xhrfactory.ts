export let XHRFactory = (() => {
  let stack: XMLHttpRequest[] = Array(1).fill(createXHR());

  function createXHR(): XMLHttpRequest {
    return new XMLHttpRequest();
  }

  return {
    release: (xhr: XMLHttpRequest) => {
      xhr.onreadystatechange = null;
      xhr.onerror = null;
      xhr.onload = null;
      xhr.upload.onprogress = null;
      stack.push(xhr);
    },
    getInstance(): XMLHttpRequest {
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

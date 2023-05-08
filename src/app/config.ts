declare let process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};
export const env = process.env.NODE_ENV;
export const serverUrl =
  env === 'production'
    ? 'https://uploadx-demo-server.onrender.com'
    : `${window.location.protocol}//${window.location.hostname}:3002`;

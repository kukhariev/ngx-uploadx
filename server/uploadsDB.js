'use strict';

const crypto = require('crypto');
const fs = require('fs');

/**
 *  Uploads data
 */
const uploadsDB = (() => {
  const map = new Map();
  return {
    save: data => {
      const id = crypto
        .createHash('md5')
        .update(JSON.stringify(data), 'utf8')
        .digest('hex');
      data.id = id;
      map.set(id, data);
      return map.get(id);
    },
    ready: id => {
      return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const filename = map.get(id).dstpath;
        const input = fs.createReadStream(filename);
        input.on('readable', () => {
          const data = input.read();
          if (data) hash.update(data);
          else {
            const checksum = hash.digest('hex');
            console.log('\x1b[36m%s\x1b[0m', `\n<<<COMPLETED>>> ${checksum} ${filename}`);
            map.delete(id);
            resolve(checksum);
          }
        });
      });
    },
    deleted: id => {
      console.log('\x1b[36m%s\x1b[0m', `<<<CANCELED>>> ${map.get(id).dstpath}`);
      map.delete(id);
    },
    findById: id => map.get(id)
  };
})();

exports.uploadsDB = uploadsDB;

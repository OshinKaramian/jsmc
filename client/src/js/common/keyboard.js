const callRegister = [];
let stash = [];
const keycode = require('keycode');

const push = (key, bucket, description, method) => {
  const methodReference = function(event) {
      if (event.target.type !== 'text' && event.keyCode === key) {
        event.preventDefault();
      }

      if (event.keyCode === key) {
        method(event);
      }
    };

  if (!callRegister[bucket]) {
    callRegister[bucket] = [];
  }

  callRegister[bucket].push({
    key,
    description,
    value: keycode(key),
    method: methodReference
  });

  document.addEventListener('keydown', methodReference);
};

module.exports = {
  /*stash: {
    push: (options) => {
      stash = callRegister.filter(item => !options.ignore.includes(item.key));
      callRegister = callRegister.filter(item => options.ignore.includes(item.key));
      stash.forEach(item => {
        if (!options.ignore.includes(item.key)) {
          document.removeEventListener('keydown', item.method)
        }
      });
    },

    pop: (options) => {
      stash.forEach(item => {
        if (!options.ignore.includes(item.key)) {
          push(item.key, item.description, item.method)
        }
      });
      stash = [];
    }
  },*/

  push: push,

  callRegister: (buckets) => {
    let returnRegister = [];

    buckets.forEach(bucket => {
      if (callRegister[bucket]) {
        returnRegister = returnRegister.concat(callRegister[bucket]);
      }
    });

    returnRegister.sort( (a,b) => {
      const aValue = a.value.toLowerCase();
      const bValue = b.value.toLowerCase();

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }

      return 0
    });

    return returnRegister;
  },

  remove: (method) => {
  },

  removeAll: () => {
  }
};
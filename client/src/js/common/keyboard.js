const callRegister = [];
const keycode = require('keycode');

module.exports = {
  push: (key, description, method) => {
    callRegister.push({
      key,
      description,
      value: keycode(key),
      method
    });

    callRegister.sort( (a,b) => {
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

    document.addEventListener('keydown', function(event) {
      if (event.target.type !== 'text' && event.keyCode === key) {
        event.preventDefault();
      }

      if (event.keyCode === key) {
        method(event);
      }
    });
  },

  callRegister: callRegister,

  remove: (method) => {
  },

  removeAll: () => {
  }
};
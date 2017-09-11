const callRegister = [];

module.exports = {
  push: (key, method) => {
    callRegister.push({
      key: key,
      method: method
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

  remove: (method) => {
  },

  removeAll: () => {
  }
};
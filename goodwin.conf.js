module.exports = function(config) {
  config.set({
    globals: {
      co: require('co'),
      Condvar: require('./index').Condvar,
      Semaphore: require('co-semaphore').Semaphore,
      wait: function(ms) {
        return function(done) {
          setTimeout(done, ms);
        }
      }
    },
    tests: [
      'test/*.js'
    ]
  });
}

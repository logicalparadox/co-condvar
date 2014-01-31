"use strict";

/*!
 * Module dependencies
 */

var Semaphore = require('co-semaphore').Semaphore;

/*!
 * Primary exports
 */

var exports = module.exports = function(lock) {
  return new Condvar(lock);
};

/**
 * Conditional variable implementation for `Mutex` and `RWLock`.
 * Can use stringed keys for multi-variable conditions so it
 * can be used as a yield-able event emitter.
 *
 * @param {Mutex|RWLock} state of target
 * @api public
 */

var Condvar = exports.Condvar = function Condvar(lock) {
  this.state = {
    type: 'condvar',
    conds: {},
    lock: lock || new Semaphore()
  };
}

/*!
 * Prototype
 */

Condvar.prototype = {

  constructor: Condvar,

  /**
   * Get the semaphore lock that will be dropped
   * for each `.wait()`.
   *
   * @return {Semaphore} lock
   * @api public
   */

  get lock() {
    return this.state.lock;
  },

  /**
   * Wait for signal on a given key. Key is optional.
   *
   * @param {String} key
   * @yield {Boolean} condition met
   * @api public
   */

  wait: function*(key) {
    key = key || '_';

    var self = this.state
    var lock = self.lock
    var sem = self.conds[key]
      || (self.conds[key] = new Semaphore(0));

    lock.release();
    yield sem.acquire();
    yield lock.acquire();

    return true;
  },

  /**
   * Signal that a condition has met. Will unlock only
   * the next waiting for the given key.
   *
   * @param {String} key optional
   * @return {Boolean} any receivers
   * @api public
   */

  signal: function(key) {
    var sem = this.state.conds[ key || '_' ];
    return sem ? sem.release() : false;
  },

  /**
   * Broadcast that a condition has met. Will unlock all
   * waiting for the given key.
   *
   * @param {String} key optional
   * @return {Boolean} any receivers
   * @api public
   */

  broadcast: function(key) {
    var sem = this.state.conds[ key || '_' ];
    return sem ? sem.flush() : false;
  }

}

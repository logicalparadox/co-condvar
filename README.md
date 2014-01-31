# co-condvar

[![Build Status](https://travis-ci.org/logicalparadox/co-condvar.png?branch=master)](https://travis-ci.org/logicalparadox/co-condvar)

> [Conditional variable](http://en.wikipedia.org/wiki/Monitor_(synchronization)#Condition_variables) primitive for generator flow-control.

## Installation

#### Node.js

`co-condvar` is available through [npm](http://npmjs.org):

    npm install co-condvar

## Example

The best way to think of a `condvar` is like a blocking event emitter. The
following demonstrates a solution to the [producer/consumer problem](http://en.wikipedia.org/wiki/Monitor_(synchronization)#Solving_the_bounded_producer.2Fconsumer_problem)
using a single conditional variable and its associated lock. 

In this example `yield cv.wait()` is invoked while a lock is acquired. Because 
the lock can only be owned by one "thread" at a time, this code looks like a 
deadlock scenario. However, when a conditional variable is waiting, it releases
it's lock and `yield cv.wait()` will only resume once the lock has been 
re-acquired.

This example requires code that manages the lock manually. This can be managed
automatically by using [co-mutex](https://github.com/logicalparadox/co-mutex) 
instead.

```js
var Condvar = require('co-condvar').Condvar;

var queue = [];

function *producer(cv) {
  var i = 0;
  while(true) {
    // acquire lock
    yield cv.lock.acquire();
    while (queue.length) yield cv.wait('shift');

    // async stuff
    yield wait(100);
    queue.push(i++);

    // signal and release
    cv.signal('push');
    cv.lock.release();
  }
}

function *consumer(cond) {
  while(true) {
    // acquire lock
    yield cv.lock.acquire();
    while (!queue.length) yield cv.wait('push');

    // async stuff
    yield wait(100);
    var item = queue.shift();

    // signal and release
    cv.signal('shift');
    cv.lock.release();
  }
}

co(function *main() {
  var cv = new Condvar();

  co(producer)(cv);
  co(consumer)(cv);

  yield wait(1000);
  process.exit();
})();
```

## Usage

Conditional variable implementation for `Mutex` and `RWLock`. Can use stringed 
keys for multi-variable conditions so it can be used as a yield-able event 
emitter.

* **@param** _{Semaphore}_ lock to drop on `.wait()`. optional.

### .lock

Get the semaphore lock that will be dropped for each `.wait()`.

* **@return** _{Semaphore}_  lock

```js
yield condvar.lock.acquire();
```

### .wait(key)

Wait for signal on a given key. Key is optional. Yieldable.

* **@param** _{String}_ key 

```js
while (!ready) yield condvar.wait('event');
```

### .signal(key)

Signal that a condition has met. Will unlock only the next waiting for the 
given key.

* **@param** _{String}_ key optional
* **@return** _{Boolean}_  any receivers

```js
var hadWaiting = condvar.signal('event');
```

### .broadcast(key)

Broadcast that a condition has met. Will unlock all waiting for the given key.

* **@param** _{String}_ key optional
* **@return** _{Boolean}_  any receivers

```js
var hadWaiting = condvar.broadcast('event');
```

## License

(The MIT License)

Copyright (c) 2014 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 

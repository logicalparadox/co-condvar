# co-condvar

[![Build Status](https://travis-ci.org/logicalparadox/co-condvar.png?branch=master)](https://travis-ci.org/logicalparadox/co-condvar)

> [Conditional variable](http://en.wikipedia.org/wiki/Monitor_(synchronization)#Condition_variables) primitive for generator flow-control.

## Installation

#### Node.js

`co-condvar` is available through [npm](http://npmjs.org):

    npm install co-condvar

## Example

The best way to think of a `condvar` is like a blocking event emitter. The
following demonstrates a solution to the [consumer/producer problem](http://en.wikipedia.org/wiki/Monitor_(synchronization)#Solving_the_bounded_producer.2Fconsumer_problem)
using a single conditional variable and its associated lock. 

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

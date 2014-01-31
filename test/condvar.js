suite('.lock', function() {
  test('get: returns lock to be dropped on wait', function() {
    var sem = new Semaphore();
    var cv = new Condvar(sem);
    sem._testing = true;
    cv.lock.should.deep.equal(sem);
  });
});

suite('.wait()', function() {
  test('creates semaphore @ key', co(function*() {
    var cv = new Condvar();
    cv.state.conds.should.not.have.property('key1');
    cv.state.conds.should.not.have.property('key2');

    co(function*() {
      yield cv.wait('key1');
    })();

    co(function*() {
      yield cv.wait('key2');
    })();

    cv.state.conds.should.have.property('key1')
      .an.instanceof(Semaphore);
    cv.state.conds.should.have.property('key2')
      .an.instanceof(Semaphore);
  }));

  test('releases provided lock', co(function*() {
    var lock = new Semaphore();
    var cv = new Condvar(lock);

    var acquired = false;
    var waited = false;

    lock.count.should.equal(1);

    co(function*() {
      yield lock.acquire();
      acquired = true;
      yield cv.wait();
      waited = true;
      lock.release();
    })();

    yield wait(10);
    yield lock.acquire();
    lock.count.should.equal(0);
    acquired.should.be.true;
    waited.should.be.false;
  }));
});

suite('.signal()', function() {
  test('single release of semaphore at key', co(function*() {
    var cv = new Condvar();

    var acquired = [];

    co(function*() {
      yield cv.wait('key');
      acquired.push(true);
    })();

    co(function*() {
      yield cv.wait('key');
      acquired.push(true);
    })();

    yield wait(10);
    acquired.length.should.equal(0);
    cv.signal('key').should.be.true;
    yield wait(10);
    acquired.length.should.equal(1);
  }));
});

suite('.broadcast()', function() {
  test('multiple release of semaphore at key', co(function*() {
    var cv = new Condvar();

    var acquired = [];

    co(function*() {
      yield cv.wait('key');
      acquired.push(true);
    })();

    co(function*() {
      yield cv.wait('key');
      acquired.push(true);
    })();

    yield wait(10);
    acquired.length.should.equal(0);
    cv.broadcast('key').should.be.true;
    yield wait(10);
    acquired.length.should.equal(2);
  }));
});

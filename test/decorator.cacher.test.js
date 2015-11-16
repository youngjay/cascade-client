var expect = require('chai').expect;
var sinon = require('sinon');

var Cacher = require('../').Cacher;
var checkPromise = require('./util/check-promise');
var LocalFetcher = require('../').LocalFetcher;
var getFieldAs = require('../').getFieldAs;
var Cascade = require('../').Cascade;

var calledTimesOnType = function(argsArray, type, category) {
    return argsArray.reduce(function(ret, args) {
        return ret.concat(args[0].reduce(function(ret, field) {
            if (field.type === type && (!category || category === field.category)) {
                ret.push(field)
            }
            return ret;
        }, []));
    }, []);
}

describe('Cacher', function() {
   

    var repo = {
        User: {
            query: {
                name: 'Jay'
            },

            load: {
                name: 'Tom'
            }
        }
    };

    it('cahce works for type', function(done) {
        

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');

        var cascade = new Cascade(new Cacher(fetcher, {
            fields: [{type: 'User'}]
        }))

        var r1, r2;

        cascade.query([{
           type: 'User'
        }]).then(function(data) {
            r1 = data;
        })

        cascade.query([{
           type: 'User'
        }]).then(function(data) {
            r2 = data;
        });

        setTimeout(function() {
            try {
                expect(r1).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(r2).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(calledTimesOnType(spy.args, 'User').length).to.be.equal(1)
                expect(spy.calledThrice).to.be.true;
                done();
            } catch (e) {
                done(e)
            }
        }, 20)

    })

    it('cahce works for type and category', function(done) {
        

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');

        var cascade = new Cascade(new Cacher(fetcher, {
            fields: [{type: 'User', category: 'query'}]
        }))

        var r1, r2, r3, r4;

        cascade.query([{
           type: 'User'
        }]).then(function(data) {
            r1 = data;
        })

        cascade.query([{
           type: 'User'
        }]).then(function(data) {
            r2 = data;
        });

        cascade.query([{
           type: 'User',
           category: 'load'
        }]).then(function(data) {
            r3 = data;
        })

        cascade.query([{
           type: 'User',
           category: 'load'
        }]).then(function(data) {
            r4 = data;
        });

        setTimeout(function() {
            try {
                expect(r1).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(r2).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(r3).deep.equal({
                    user_load: {
                        name: 'Tom'
                    }
                })
                expect(r4).deep.equal({
                    user_load: {
                        name: 'Tom'
                    }
                })
                expect(calledTimesOnType(spy.args, 'User', 'query').length).to.be.equal(1)
                expect(calledTimesOnType(spy.args, 'User', 'load').length).to.be.equal(2)
                
                done();
            } catch (e) {
                done(e)
            }
        }, 20)

    })

    
    it('cahce works for type and different params', function(done) {
        

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');

        var cascade = new Cascade(new Cacher(fetcher, {
            fields: [{type: 'User'}]
        }))

        var r1, r2;

        cascade.query([{
           type: 'User',
           params: {
                a: 1,
                b: 2
           }
        }]).then(function(data) {
            r1 = data;
        })

        cascade.query([{
           type: 'User',
           params: {
                a: 2,
                b: 2
           }
        }]).then(function(data) {
            r2 = data;
        });

        setTimeout(function() {
            try {
                expect(r1).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(r2).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })

                expect(calledTimesOnType(spy.args, 'User').length).to.be.equal(2)
                done();
            } catch (e) {
                done(e)
            }
        }, 20)

    })

    it('cahce works for type and same params', function(done) {
        

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');

        var cascade = new Cascade(new Cacher(fetcher, {
            fields: [{type: 'User'}]
        }))

        var r1, r2;

        cascade.query([{
           type: 'User',
           params: {
                a: 1,
                b: 2
           }
        }]).then(function(data) {
            r1 = data;
        })

        cascade.query([{
           type: 'User',
           params: {
                
                b: 2,
                a: 1
           }
        }]).then(function(data) {
            r2 = data;
        });

        setTimeout(function() {
            try {
                expect(r1).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(r2).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })

                expect(calledTimesOnType(spy.args, 'User').length).to.be.equal(1)
                done();
            } catch (e) {
                done(e)
            }
        }, 20)

    });

        it('cahce works for type', function(done) {
        

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');

        var cascade = new Cascade(new Cacher(fetcher, {
            fields: [{type: 'User'}]
        }))

        var r1, r2;

        cascade.query([{
           type: 'User',
           as: 'aa'
        }]).then(function(data) {
            r1 = data;
        })

        cascade.query([{
           type: 'User'
        }]).then(function(data) {
            r2 = data;
        });

        setTimeout(function() {
            try {
                expect(r1).deep.equal({
                    aa: {
                        name: 'Jay'
                    }
                })
                expect(r2).deep.equal({
                    user: {
                        name: 'Jay'
                    }
                })
                expect(calledTimesOnType(spy.args, 'User').length).to.be.equal(1)
                expect(spy.calledThrice).to.be.true;
                done();
            } catch (e) {
                done(e)
            }
        }, 20)

    })

})
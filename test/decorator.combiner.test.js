var expect = require('chai').expect;
var sinon = require('sinon');

var Combiner = require('../').Combiner;
var LocalFetcher = require('../').LocalFetcher;
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../').getFieldAs;
var Normalizer = require('../').Normalizer;

describe('Combiner', function() {
   
    var repo = {
        User: {
            query: {
                name: 'Jay'
            }
        },

        Book: {
            query: {
                name: 'tobe'
            }
        }
    };

    it('should work for normal', function(done) {
        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');      

        var cascade = new Normalizer(new Combiner(fetcher, {
            wait: 10
        }));

        checkPromise(cascade.fetch([{
            type: 'User'
        }]), done, function(data) {
            expect(spy.calledOnce).to.be.true;
            expect(data).deep.equal({
                user: {
                    name: 'Jay'
                }
            })
        })
    })

    it('should combine multiple fetches in one shot', function(done) {
        var clock = sinon.useFakeTimers();

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');      

        var cascade = new Normalizer(new Combiner(fetcher, {
            wait: 20
        }));

        var p1 = cascade.fetch([{
            type: 'User'
        }]);

        clock.tick(10);

        var p2 = cascade.fetch([{
            type: 'Book'
        }]);

        checkPromise(Promise.all([p1, p2]), done, function(data) {
            expect(spy.calledOnce).to.be.true;
            expect(data).deep.equal([{
                user: {
                    name: 'Jay'
                }
            },{
                book: {
                    name: 'tobe'
                }
            }])
        })

        clock.tick(30);

        clock.restore();
    })

    it('should combine multiple fetches in multiple shot if duration large then wait', function(done) {
        var clock = sinon.useFakeTimers();

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');      

        var cascade = new Normalizer(new Combiner(fetcher, {
            wait: 20
        }));

        var p1 = cascade.fetch([{
            type: 'User'
        }]);

        clock.tick(30);

        var p2 = cascade.fetch([{
            type: 'Book'
        }]);

        clock.tick(30);

        checkPromise(Promise.all([p1, p2]), done, function(data) {
            expect(spy.calledTwice).to.be.true;
            expect(data).deep.equal([{
                user: {
                    name: 'Jay'
                }
            },{
                book: {
                    name: 'tobe'
                }
            }])
        })

        clock.tick(30);

        clock.restore();
    })

    it('should combine multiple fetches with same as or same name', function(done) {

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');      

        var cascade = new Normalizer(new Combiner(fetcher, {
            wait: 20
        }));

        var p1 = cascade.fetch([{
            type: 'User'
        }]);

        var p2 = cascade.fetch([{
            type: 'User'
        }]);

        var p3 = cascade.fetch([{
            type: 'User',
            as: 'u'
        }]);

        var p4 = cascade.fetch([{
            type: 'User',
            as: 'u'
        }]);

        checkPromise(Promise.all([p1, p2, p3, p4]), done, function(data) {
            expect(spy.calledOnce).to.be.true;
            expect(data).deep.equal([{
                user: {
                    name: 'Jay'
                }
            },{
                user: {
                    name: 'Jay'
                }
            },{
                u: {
                    name: 'Jay'
                }
            },{
                u: {
                    name: 'Jay'
                }
            }])
        })

    })
})
var expect = require('chai').expect;
var sinon = require('sinon');

var CombineDecorator = require('../lib/fetcher/decorator/combiner');
var LocalFetcher = require('../lib/fetcher/local');
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../lib/util/get-field-as');
var Cascade = require('../lib/cascade');

describe('combiner decorator', function() {
   
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

        var cascade = new Cascade(new CombineDecorator(fetcher, {
            throttlePeriod: 10
        }));

        checkPromise(cascade.query([{
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

        var cascade = new Cascade(new CombineDecorator(fetcher, {
            throttlePeriod: 20
        }));

        var p1 = cascade.query([{
            type: 'User'
        }]);

        clock.tick(10);

        var p2 = cascade.query([{
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

    it('should combine multiple fetches in multiple shot if duration large then throttlePeriod', function(done) {
        var clock = sinon.useFakeTimers();

        var fetcher = new LocalFetcher(repo);

        var spy = sinon.spy(fetcher, 'fetch');      

        var cascade = new Cascade(new CombineDecorator(fetcher, {
            throttlePeriod: 20
        }));

        var p1 = cascade.query([{
            type: 'User'
        }]);

        clock.tick(30);

        var p2 = cascade.query([{
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

        var cascade = new Cascade(new CombineDecorator(fetcher, {
            throttlePeriod: 500
        }));

        var p1 = cascade.query([{
            type: 'User'
        }]);

        var p2 = cascade.query([{
            type: 'User'
        }]);

        var p3 = cascade.query([{
            type: 'User',
            as: 'u'
        }]);

        var p4 = cascade.query([{
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
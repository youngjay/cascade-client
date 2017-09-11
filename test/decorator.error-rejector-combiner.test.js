
var expect = require('chai').expect;
var sinon = require('sinon');

var ErrorRejector = require('../').ErrorRejector;
var Combiner = require('../').Combiner;

var LocalFetcher = require('../').LocalFetcher;
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../').getFieldAs;
var Normalizer = require('../').Normalizer;

describe('ErrorRejector with Combiner', function() {
    var ERROR = 'bala bala';
    var ERROR_REPLACE_TEXT = '系统繁忙,请稍候重试';
   
    var repo = {
        User: {
            query: '[Cascade Error] ' + ERROR
        },

        Car: {
            query: [
                {
                    name: 'car1'
                },
                {
                    name: 'car2'
                }
            ]
        },

        Book: {
            query: {
                name: 'tobe'
            }
        }
    };

    it('should reject errors and resolve correct data', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Normalizer(
            new ErrorRejector(
                new Combiner(fetcher, {
                    wait: 20
                })
            )
        );

        var p1 = cascade.fetch([{
            type: 'User'
        }]);

        var p2 = cascade.fetch([{
            type: 'Car'
        }]);

        var count = 2;

        var check = function(error) {
            count--;
            if (error) {
                done(error)
                return;
            }
            if (count === 0) {
                done();
            }
        }

        p1.catch(function(e) {
            try {
                expect(e.message).equal(ERROR_REPLACE_TEXT);
                check()
            } catch (ex) {
                check(ex);
            }
            return Promise.reject(e)
        }).then(function(data) {            
            check('p1 should not resolve')
        }).catch(function(error) {
            if (!error) {
                check('p1 should not resolve')
            }
        });

        p2.then(function(data) {
            try {
                expect(data).deep.equal({
                    car: [
                        {
                            name: 'car1'
                        },
                        {
                            name: 'car2'
                        }
                    ]
                })
                check()
            } catch (ex) {
                check(ex)
            }
        }).catch(function(e) {
            check(new Error('p2 should not reject'))
        })
    })
})
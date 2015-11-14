
var expect = require('chai').expect;
var sinon = require('sinon');

var ErrorRejector = require('../lib/fetcher/decorator/error-rejector');
var Combiner = require('../lib/fetcher/decorator/combiner');

var LocalFetcher = require('../lib/fetcher/local');
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../lib/util/get-field-as');
var Cascade = require('../lib/cascade');

describe('error rejector combiner', function() {
    var ERROR = 'bala bala';
   
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

        var cascade = new Cascade(
            new ErrorRejector(
                new Combiner(fetcher, {
                    wait: 20
                })
            )
        );

        var p1 = cascade.query([{
            type: 'User'
        }]);

        var p2 = cascade.query([{
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
                expect(e).equal(ERROR);
                check()
            } catch (ex) {
                check(ex);
            }
            return Promise.reject(e)
        }).then(function(data) {
            console.log(data)
            check('p1 should not resolve')
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
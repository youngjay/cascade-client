
var expect = require('chai').expect;
var sinon = require('sinon');

var ErrorRejector = require('../').ErrorRejector;
var LocalFetcher = require('../').LocalFetcher;
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../').getFieldAs;
var Normalizer = require('../').Normalizer;

describe('ErrorRejector', function() {
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

    it('should reject when error occurs', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Normalizer(new ErrorRejector(fetcher));

        cascade.fetch([{
            type: 'User'
        }]).catch(function(e) {
            try {
                expect(e.message).equal(ERROR)
                done();
            } catch (ex) {
                done(ex)
            }
        })        
    })

    it('should resolve where no error occurs', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Normalizer(new ErrorRejector(fetcher));


        checkPromise(cascade.fetch([{
            type: 'Book'
        }]), done, function() {})
        
    })


    it('should collect multiple errors', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Normalizer(new ErrorRejector(fetcher));

        cascade.fetch([{
            type: 'Car',
            children: [{
                type: 'User'
            }]
        }]).catch(function(e) {
            try {
                expect(e.message).equal(ERROR + '; ' + ERROR)
                done();
            } catch (ex) {
                done(ex)
            }
        })  
    })
})
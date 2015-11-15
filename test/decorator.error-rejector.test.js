
var expect = require('chai').expect;
var sinon = require('sinon');

var ErrorRejector = require('../').ErrorRejector;
var LocalFetcher = require('../').LocalFetcher;
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../').getFieldAs;
var Cascade = require('../').Cascade;

describe('error rejector', function() {
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

        var cascade = new Cascade(new ErrorRejector(fetcher));

        cascade.query([{
            type: 'User'
        }]).catch(function(e) {
            try {
                expect(e).equal(ERROR)
                done();
            } catch (ex) {
                done(ex)
            }
        })        
    })

    it('should resolve where no error occurs', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Cascade(new ErrorRejector(fetcher));


        checkPromise(cascade.query([{
            type: 'Book'
        }]), done, function() {})
        
    })


    it('should collect multiple errors', function(done) {
        var fetcher = new LocalFetcher(repo);

        var cascade = new Cascade(new ErrorRejector(fetcher));

        cascade.query([{
            type: 'Car',
            children: [{
                type: 'User'
            }]
        }]).catch(function(e) {
            try {
                expect(e).equal(ERROR + '; ' + ERROR)
                done();
            } catch (ex) {
                done(ex)
            }
        })  
    })
})
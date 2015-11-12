var expect = require('chai').expect;
var sinon = require('sinon');

var LocalCascade = require('../lib/cascade/local');
var checkPromise = require('./check-promise');
var getFieldAs = require('../lib/util/get-field-as');

describe('local cascade', function() {
    it('local repo with object category', function(done) {
        var Jay = {
            name: 'Jay'
        }

        var repo = {
            User: {
                query: Jay
            }
        };

        var cascade = new LocalCascade(repo);

        var field = {
            type: 'User'
        };

        checkPromise(cascade.query([field]), done, function(data) {
            var o = {};
            o[getFieldAs(field)] = Jay;
            expect(data).to.deep.equal(o)
        })

    });
})
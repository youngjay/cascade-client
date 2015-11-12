var expect = require('chai').expect;
var sinon = require('sinon');

var RemoteCascade = require('../lib/cascade/remote');

var URL = 'url';
var FIELDS = {};

describe('remote cascade', function() {
    it('query should call fetcher with right args', function() {
        var spyFetcher = sinon.spy();

        var cascade = new RemoteCascade(URL, spyFetcher);
        cascade.query(FIELDS);

        expect(spyFetcher.calledWith(URL, FIELDS)).to.be.true;

    });
})
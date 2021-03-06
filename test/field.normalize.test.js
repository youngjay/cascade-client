var expect = require('chai').expect;
var sinon = require('sinon');

var Normalizer = require('../').Normalizer;

describe('field normalize', function() {
    it('query should call fetcher with right args', function() {
        var spyFetcher = sinon.spy();

        var cascade = new Normalizer({
            fetch: spyFetcher
        });
        cascade.fetch({
            type: 'User'
        });

        expect(spyFetcher.args[0][0]).deep.equal([{
            type: 'User',
            category: 'query',
            params: {},
            children: []
        }])

        cascade.fetch([{
            params: {
                a: 1
            },
            children: [
                {
                    params: {
                        b: 2
                    },
                    children: [
                        {
                            type: 'User',
                            params: {
                                c: 3
                            },
                            children: [
                                {
                                    type: 'Book'
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'Book',
                    category: 'load',
                    params: {
                        d: 4
                    }
                }
            ]
        }]);

        expect(spyFetcher.args[1][0]).deep.equal([
            {
                type: 'User',
                category: 'query',
                params: {
                    a: 1,
                    b: 2,
                    c: 3
                },
                children: [{
                    type: 'Book',
                    category: 'query',
                    params: {},
                    children: []
                }]
            },
            {
                type: 'Book',
                category: 'load',
                params: {
                    a: 1,
                    d: 4,
                },
                children: []
            }
        ])
    });
})
//var expect = require('chai').expect;
//var sinon = require('sinon');
//
//var CacheDecorator = require('./cache');
//var checkPromise = require('./check-promise');
//var getFieldAs = require('../').getFieldAs;
//
//describe('cache cascade', function() {
//    it('local', function() {
//        var cascade = {
//            query: sinon.spy()
//        }
//
//        var cascade = new CacheDecorator(cascade)
//
//        cascade.query([{
//                type: 'User',
//                category: 'query',
//                params: {
//                    a: 1,
//                    b: 2,
//                    c: 3
//                },
//                children: [{
//                    type: 'Book',
//                    category: 'query',
//                    params: {},
//                    children: []
//                }]
//            },
//            {
//                type: 'Book',
//                category: 'load',
//                params: {
//                    a: 1,
//                    d: 4,
//                },
//                children: []
//            }])
//    })
//})
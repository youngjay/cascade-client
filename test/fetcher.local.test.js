var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');

var Normalizer = require('../').Normalizer;
var LocalFetcher = require('../').LocalFetcher;
var checkPromise = require('./util/check-promise');
var getFieldAs = require('../').getFieldAs;

describe('LocalFetcher', function() {
    it('local repo for category as return value', function(done) {
        var Jay = {
            name: 'Jay'
        };

        var repo = {
            User: {
                query: Jay
            }
        };

        var cascade = new Normalizer(new LocalFetcher(repo));

        var field = {
            type: 'User'
        };

        checkPromise(cascade.fetch([field]), done, function(data) {
            var o = {};
            o[getFieldAs(field)] = Jay;
            expect(data).to.deep.equal(o)
        })

    });

    it('local repo for category as function', function(done) {
        var Jay = {
            name: 'Jay'
        }

        var repo = {
            User: {
                query: function() {
                    return Jay
                }
            }
        };

        var cascade = new Normalizer(new LocalFetcher(repo));

        var field = {
            type: 'User'
        };

        checkPromise(cascade.fetch([field]), done, function(data) {
            var o = {};
            o[getFieldAs(field)] = Jay;
            expect(data).to.deep.equal(o)
        })

    });


    // it('category fn should receive all parent params', function(done) {
    //     var spy = sinon.spy();

    //     var repo = {
    //         A1: {
    //             query: {
    //                 b1: 1
    //             }
    //         },

    //         A2: {
    //             query: {
    //                 b2: 1
    //             }
    //         },

    //         A3: {
    //             query: function(a3) {
    //                 expect(a3.type).equal('A3')
    //                 expect(a3.params).deep.equal({
    //                     c3: 1
    //                 })

    //                 var a2 = a3.parent;

    //                 expect(a2.type).equal('A2')
    //                 expect(a2.params).deep.equal({
    //                     c2: 1
    //                 })

    //                 var a1 = a2.parent;

    //                 expect(a1.type).equal('A1')
    //                 expect(a1.category).equal('query')
    //                 expect(a1.params).deep.equal({
    //                     c1: 1
    //                 })

    //                 var a0 = a1.parent

    //                 expect(a0).to.be.null

    //                 return {
    //                     b3: 1
    //                 }
    //             }
    //         }
    //     }

    //     var cascade = new Normalizer(new LocalFetcher(repo));

    //     checkPromise(cascade.fetch([{
    //         type: 'A1',
    //         params: {
    //             c1: 1
    //         },
    //         children: [{
    //             type: 'A2',
    //             params: {
    //                 c2: 1
    //             },
    //             children: [{
    //                 type: 'A3',
    //                 params: {
    //                     c3: 1
    //                 }
    //             }]
    //         }]
    //     }]), done, function(data) {
    //         expect(data).to.deep.equal({
    //             a1: {
    //                 b1: 1,
    //                 a2: {
    //                     b2: 1,
    //                     a3: {
    //                         b3: 1
    //                     }
    //                 }
    //             }
    //         })
    //     })
    // })

    it('should throw error when query not exist type', function() {

        var repo = {};

        var field = {
            type: 'User'
        };

        var cascade = new Normalizer(new LocalFetcher(repo));

        cascade.fetch([field]).catch(function(e) {
            expect(e).not.to.be.null
        })
    })


    it('should support primary types', function(done) {
        var repo = {
            User: {
                query: [1,2]
            },

            Book: {
                byUser: (field) => {
                    return {
                        name: 'book'
                    }
                }
            }
        };

        var field = {
            type: 'User',
            children: [{
                type: 'Book',
                category: 'byUser',
                as: 'book'
            }]
        };

        var cascade = new Normalizer(new LocalFetcher(repo));

        checkPromise(cascade.fetch([field]), done, function(data) {
            assert.equal(2, data.user.length)
            assert.equal('book', data.user[0].book.name)            
        })
    })

    it('should support inherit', function(done) {
        var repo = {
            User: {
                query: {
                    items: [1, 2],
                    items2: [3, 4]
                }
            },

            Book: {
                byUser: (field) => {
                    return {
                        name: 'book'
                    }
                }
            }
        };

        var field = {
            type: 'User',
            children: [
                {
                    inherit: 'items',
                    type: 'Book',
                    category: 'byUser',
                    as: 'book'
                },
                {
                    inherit: 'items2',
                    type: 'Book',
                    category: 'byUser',
                    as: 'book'
                },
                {
                    inherit: 'items',
                    type: 'Book',
                    category: 'byUser',
                    as: 'book3'
                }
            ]
        };

        var cascade = new Normalizer(new LocalFetcher(repo));

        checkPromise(cascade.fetch([field]), done, function(data) {
            assert.equal(2, data.user.items.length)
            assert.equal(2, data.user.items2.length)

            assert.equal("book", data.user.items[0].book.name)  
            assert.equal("book", data.user.items[0].book3.name)  

            console.log(JSON.stringify(data.user))        
        })

    })
})
var expect = require('chai').expect;
var getFieldAs = require('../').getFieldAs;

describe('field', function() {
    it('should return type when no category is specified', function() {
        expect(getFieldAs({
            type: 'User'
        })).equal('user')
    });

    it('should return type when category use "query"', function() {
        expect(getFieldAs({
            type: 'User',
            category: 'query'
        })).equal('user')
    });

    it('should return type and category', function() {
        expect(getFieldAs({
            type: 'User',
            category: 'load'
        })).equal('user_load')
    })
});
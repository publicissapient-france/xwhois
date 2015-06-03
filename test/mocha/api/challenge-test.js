var assert = require("assert"),
    trombinoscopeDb = require('../../../src/api/infrastructure/trombinoscopeDb'),
    challengeModule = require("../../../src/api/challenge")('/assets/images/xebians'),
    sinon = require('sinon');

describe("Challenge Module Test", function () {
    var trombinoscopeIsNotEmptyStub,
        trombinoscopeGetAllPeople;

    beforeEach(function (done) {
        trombinoscopeIsNotEmptyStub = sinon.stub(trombinoscopeDb, 'isNotEmpty').returns({
            'then': function (callback) {
                return callback();
            }
        });
        trombinoscopeGetAllPeople = sinon.stub(trombinoscopeDb, 'getAllPeople').returns({
            'then': function (callback) {
                return callback([
                    {'name': 'Firstname1 Lastname1'},
                    {'name': 'Firstname2 Lastname2'}
                ]);
            }
        });
        done();
    });

    afterEach(function (done) {
        trombinoscopeIsNotEmptyStub.restore();
        trombinoscopeGetAllPeople.restore();
        done();
    });

    it('should create a challenge', function () {
        var challenge = challengeModule.createChallenge();

        assert(challenge.firstImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1, 'first image is in form /assets/images/xebians/Firstname[1|2] Lastname[1|2]');
        assert(challenge.secondImage.search('/assets/images/xebians/Firstname[1|2] Lastname[1|2]') !== -1, 'second image is in form /assets/images/xebians/Firstname[1|2] Lastname[1|2]');
        assert(challenge.name.search('Firstname[1|2] Lastname[1|2]') !== -1, 'name is in form Firstname[1|2] Lastname[1|2]');
    });

    it('should valid a winning answer', function () {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname1 Lastname1'};
        var result = challengeModule.validAnswer(answer);

        assert(result === true, 'The answer should be a winning one');
    });

    it('should valid a losing answer', function () {
        var answer = {image: '/assets/images/xebians/Firstname1 Lastname1', name: 'Firstname2 Lastname2'};
        var result = challengeModule.validAnswer(answer);

        assert(result === false, 'The answer should be a losing one');
    });

    it('should not create challenge if database is empty', function () {
        trombinoscopeIsNotEmptyStub.returns({
            'then': function () {
                // do not execute then callback if database is empty
                return {
                    'then': function () {
                        // do not execute then callback if database is empty
                    }
                }
            }
        });

        var challenge = challengeModule.createChallenge();

        assert.ok(!trombinoscopeGetAllPeople.called, 'trombinoscopeDb.getAllPeople has never been called');
    });

    it('should not create challenge if database has only one person', function () {
        trombinoscopeGetAllPeople.returns({
            'then': function (callback) {
                return callback([{'name': 'Firstname1 Lastname1'}]);
            }
        });

        try {
            challengeModule.createChallenge();
            assert.fail();
        } catch (errorMessage) {
            assert.strictEqual(errorMessage, 'database has only one element', 'error message');
        }

    });
});

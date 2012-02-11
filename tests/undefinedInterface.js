// if you do not want to use interface implementation (e.g. in production environment)
// remove interface.js (and interface tests) then these tests should pass


describe('Interface is undefined', function() {

    beforeEach(function(){
        var iface = new $.Interface('NewInterface', ['test1', 'test2']);
    
        $.Class('TestUndefinedInterface', {
            implement: iface,
            test1: function() {
                return "test1";
            },

            test2: function() {
                return "test2";
            }
        });
    });

    afterEach(function() {
        delete window.TestUndefinedInterface;
    });

    it('Should not have any interface attributes.', function() {

        var test = new TestUndefinedInterface();

        expect(test.implement).toBeUndefined();
        expect(test.___interfaces).toBeUndefined();

    });

    it('Should not have interface definitions when inherit.', function() {

         $.Class('TestUndefinedInterface2', {
            extend: TestUndefinedInterface,

            newFunc: function(){
                return "hallo";
            }
        });

        var test = new TestUndefinedInterface2();

        expect(test.implement).toBeUndefined();
        expect(test.___interfaces).toBeUndefined();

        delete window.TestUndefinedInterface2;

    });

});


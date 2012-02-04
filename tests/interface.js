

describe('Interface tests', function() {

    var interface = null;
    
    beforeEach(function() {
        interface = new $.Interface('TestInterface', ['test1', 'test2']);

        $.Class('ImplementCorrectly', {
            implement: interface,
            test1: function() {
            },
            test2: function() {
            }
        });


        $.Class('ImplementWrong', {
            implement: interface,
            test1: function() {
            }
        });

        $.Class('WrongInterface', {
            implement: {}
        });
    });

    afterEach(function() {
        delete window.ImplementCorrectly;
        delete window.WrongInterface;
        delete window.ImplementWrong;
    });

    it('Should throw an error for implement an object which is not instance of $.Interface', function() {

        expect(function() {new WrongInterface()}).toThrow(new Error('Object should be instance of $.Interface'));
    });

    xit('Should throw an error for not implementing interface', function() {

        expect(function() {new ImplementWrong() }).toThrow();
        

    });

    xit('Should not contain prop implement', function() {
        
        var test = new ImplementCorrectly();

        expect(test.implement).toBeUndefined();
    });
});



describe('Interface tests', function() {

    xdescribe('Instantiation tests', function() {
    
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
            expect(function() {new WrongInterface()}).toThrow();
        });

        it('Should throw an error for not implementing interface', function() {
            expect(function() {new ImplementWrong() }).toThrow();
        });

        it('Should not contain prop implement', function() {
            var test = new ImplementCorrectly();

            expect(test.implement).toBeUndefined();
        });

    });

    describe('Inheritance Tests', function() {

        beforeEach(function() {

            var iface1 = new $.Interface('testInterface', ['hello']);

             $.Class('Test1', {
                implement: iface1,
                hello: function() {
                    console.log("hello");
                }
            });

            var iface2 = new $.Interface('testInterface2', ['hello2']);

            $.Class('Test2', {
                implement: iface2,
                extend: Test1,
                hello2: function() {
                    console.log("hello2");
                }
            });
        });

        afterEach(function() {
            delete window.Test1; 
            delete window.Test2; 
        });
    
        xit('Should behave the same with inherited classes.', function() {
            var test = new Test2();

            expect(test['___interfaces']).toBeDefined();
            expect(test['___interfaces'].length).toEqual(2);
        });

        it('Should have the same count of interfaces on parent class.', function() {
            var test2 = new Test2();
            console.log(test2);

            var test1 = new Test1();

            console.log(test1);

        });
    });
});

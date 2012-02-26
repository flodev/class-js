

describe('Interface tests', function() {

    describe('Instantiation tests', function() {
    
        beforeEach(function() {
            $.Interface.createInstance('TestInterface', ['test1', 'test2']);

            $.Class('ImplementCorrectly', {
                implement: TestInterface,
                test1: function() {
                },
                test2: function() {
                }
            });


            $.Class('ImplementWrong', {
                implement: TestInterface,
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
            delete window.TestInterface;
        });

        it('Should throw an error for implement an object which is not instance of $.Interface', function() {
            expect(function() {new WrongInterface()}).toThrow(new Error("Interface.ensureImplementation expects argument interfaces to be an array of instances of Interface."));
;
        });

        it('Should throw an error for not implementing interface', function() {
            var name = 'TestInterface', method = 'test2';
            expect(function() {new ImplementWrong() }).toThrow(new Error('Interface.ensureImplementation: object '
                        + 'does not implement the ' + name
                        + ' interface. Method "' + method + '()" was not found.'));
;
        });

        it('Should not contain prop implement', function() {
            var test = new ImplementCorrectly();

            expect(test.implement).toBeUndefined();
        });

        it('Should be truthy when called $.interface.ensure with Implement Correctly', function() {

            var test = new ImplementCorrectly();

            expect($.Interface.ensure(test, TestInterface)).toBeUndefined();
        });

        it('Should throw an error when $.interface.ensure is called with ImplementWrong', function() {


            expect(function() {
                $.Interface.ensure(ImplementWrong, TestInterface);
            }).toThrow(new Error('Interface.ensureImplementation: object does not implement the TestInterface interface. Method "test1()" was not found.'));

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
    
        it('Should behave the same with inherited classes.', function() {
            var test = new Test2();

            expect(test['___interfaces']).toBeDefined();
            expect(test['___interfaces'].length).toEqual(2);
        });

        it('Should have the same count of interfaces on parent class.', function() {
            var test2 = new Test2();

            var test1 = new Test1();

            expect(test1['___interfaces'].length).toBe(1);
            expect(test2['___interfaces'].length).toBe(2);
        });


    });
});


describe('Instantiation tests', function() {

    describe('Test prototype related.', function() {

         beforeEach(function() {
            $.Class('TestObj', {
                init: function() {
                    console.log("constructor");
                },

                testFunc: function() {
                    console.log("new func");
                }
            });
         });

        afterEach(function() {
            delete window.TestObj;
        });

        
         it('Should create a function TestObj', function() {

            expect(TestObj).toBeDefined();
            expect(typeof(TestObj) == 'function').toBeTruthy();
        });

        it('Should call the prototype constructor on instantiation', function() {
            
            spyOn(TestObj.prototype, "init");
            var test = new TestObj();
            expect(test.init).toHaveBeenCalled();
        });

        it('Should have defined properties', function() {
            
            var test = new TestObj();
            expect(test.init).toBeDefined();
            expect(typeof(test.init) == 'function').toBeTruthy();

            expect(test.testFunc).toBeDefined();
            expect(typeof(test.testFunc) == 'function').toBeTruthy();

        });

        it('Should create classes with namespace.', function() {

            $.Class('Namespace.namespace.NamespaceTest', {
                nsFunc: function() {
                    return true;
                }
            });

            var test = new Namespace.namespace.NamespaceTest();
            expect(test).toBeDefined();

            spyOn(test, 'nsFunc');

            test.nsFunc();
            expect(test.nsFunc).toHaveBeenCalled();

        });
       
    });

    describe('Test static methods', function() {
        beforeEach(function() {
            $.Class('TestStatics', {
                $staticFunc: function() {
                    return "value";
                }
            });
        });

        afterEach(function() {
            delete window.TestObj;
        });

        it('Should have static method staticFunc', function() {

            expect(TestStatics.staticFunc).toBeDefined();
            expect(TestStatics.staticFunc() == "value").toBeTruthy();
        });

    });

    describe('Test private methods', function() {
        beforeEach(function() {
            $.Class('TestPrivates', {
                testFunc: function() {
                    return 'value ' + this.secrets.privateFunc();
                },

                _privateFunc: function() {
                    return 'private value';
                }
            });
        });

        afterEach(function() {
            delete window.TestPrivates;
        });

        it('Should not contain private methods.', function() {
            var test = new TestPrivates();
            expect(test._privateFunc).toBeUndefined();
            expect(test.privateFunc).toBeUndefined();
        });

        it('testFunc Should return the value of public func + value of private func.', function() {
            var test = new TestPrivates();

            expect(test.testFunc() == 'value private value').toBeTruthy();
            expect(test.privates).toBeUndefined();
        });
    });
});

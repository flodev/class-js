
function createTestObj(name) 
{
    $.Class(name, {
        init: function() {
            console.log("constructor");
        },

        testFunc: function() {
            console.log("new func");
        }
    });
}


describe('Instantiation tests', function() {

    beforeEach(function() {
        delete window.TestObj;
        createTestObj('TestObj');
    });

    describe('Test prototype related.', function() {
         it('Should create a function TestObj', function() {

            expect(TestObj).toBeDefined();
            expect(typeof(TestObj) == 'function').toBeTruthy();
        });

        it('Should call the prototype constructor on instantiation', function() {
            
            sinon.spy(TestObj.prototype, "init");
            var test = new TestObj();
            expect(test.init.calledOnce).toBeTruthy();
        });

        it('Should have defined properties', function() {
            
            var test = new TestObj();
            expect(test.init).toBeDefined();
            expect(typeof(test.init) == 'function').toBeTruthy();

            expect(test.testFunc).toBeDefined();
            expect(typeof(test.testFunc) == 'function').toBeTruthy();

        });
       
    });

    describe('Test static methods', function() {
    
    });

});

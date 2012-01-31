
describe('Inheritance tests', function() {

    describe('Test inheritance.', function() {

         beforeEach(function() {
            $.Class('TestObj1', {
                init: function() {
                    console.log("constructor");
                },

                toBeOverridden: function() {
                    return 'parent';
                },

                parentFunc: function() {
                    return 'parentFunc';
                }
            });
            
            $.Class('TestObj2', {

                extend: TestObj1,

                init: function() {
                    console.log("constructor");
                },

                toBeOverridden: function() {

                    return 'descendant ' + this._super();
                }
            });
         });

        afterEach(function() {
            delete window.TestObj;
            delete window.TestObj1;
        });

        
         it('Should container method of parent class', function() {

            var test = new TestObj2();

            expect(test.parentFunc).toBeDefined();
        });
        
        it('overridden method should return "descendant parent"', function() {

            var test = new TestObj2();

            console.log(test);

            expect(test.toBeOverridden() == 'descendant parent').toBeTruthy();
        });
    });
});

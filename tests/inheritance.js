
describe('Inheritance tests', function() {

     beforeEach(function() {
        $.Class('TestObj1', {
            $staticTest: function() {
                return 'static1';
            },


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
        delete window.TestObj1;
        delete window.TestObj2;
        delete window.TestObj3;
    });

    
    xit('Should container method of parent class', function() {

        var test = new TestObj2();

        expect(test.parentFunc).toBeDefined();
    });
    
    xit('overridden method should return "descendant parent"', function() {

        var test = new TestObj2();

        expect(test.toBeOverridden() == 'descendant parent').toBeTruthy();
    });

    xit('should also work with 3 inhertiances', function() {

        $.Class('TestObj3', {
            extend: TestObj2,
            init: function() {
                this._super();
                console.log("hallo ich bin obj3");
            },

            test3: function() {
                console.log("test3");
            }
        });

        var test = new TestObj3();

        expect(test.toBeOverridden).toBeDefined();
        expect(test.test3).toBeDefined();
        expect(test.init).toBeDefined();
        expect(test.parentFunc).toBeDefined();
    });


    it('Should inherit static properties', function() {
        var test = new TestObj2();

        console.log(TestObj2.staticTest());


    });


});

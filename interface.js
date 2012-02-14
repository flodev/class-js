/**
 * $.Interface
 * inspired by the examples of the book 
 * "Pro Javascript Design Patterns" by Ross Harmse and Dustin Diaz
 */

(function($) {
    
    $.Class('$.Interface', 
    {
        /**
         * @constructor
         * @param {String} name
         * @param {Array} methods
         */
        init: function(name, methods)
        {
            this.methods = [];
            this.name = name;

            if(arguments.length != 2) {
                throw new Error("Interface constructor called with " + arguments.length +
                "arguments, but expected exactly 2.");
            }

            for(var i = 0, len = methods.length; i < len; i++) {
                if(typeof methods[i] !== 'string') {
                    throw new Error("Interface constructor expects method names to be "
                    + "passed in as a string.");
                }
                this.methods.push(methods[i]);
            }
        },

        /**
         * @param {Object} object
         * @param {Array} interfaces
         */
        $ensureImplementation: function(object, interfaces)
        {
            if(arguments.length < 2) {
                throw new Error("Function Interface.ensureImplementation called with " +
                arguments.length + "arguments, but expected at least 2.");
            }

            if (!interfaces.length) {
                throw new Error("Invalid interfaces Array.");
            }

            for(var i = 0, len = interfaces.length; i < len; i++) {
                var interface = interfaces[i];
                if(interface.constructor !== $.Interface) {
                    throw new Error("Interface.ensureImplementation expects argument interfaces "
                    + "to be an array of instances of Interface.");
                }
                
                for(var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
                    
                    var method = interface.methods[j];
                    
                    if(!object[method] || typeof object[method] !== 'function') {
                        throw new Error('Interface.ensureImplementation: object '
                        + 'does not implement the ' + interface.name
                        + ' interface. Method "' + method + '()" was not found.');
                    }
                }
            }
        },

        /**
         * mixed params
         */
        $ensure: function(object)
        {
            if (arguments.length < 2) {
                throw new Error('Expect at least 2 params.');
            }

            var interfaces = [];

            for (var i in arguments) {
                interfaces.push(arguments[i]);
            }

            interfaces.shift();

            $.Interface.ensureImplementation(object, interfaces);
        }
    });
})(jQuery);


//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.

(function( $ ) {

    var PropertyHelper = 
    {
        _init: function()
        {
            this.privates = {};
            this.publics = {};
            this.statics = {};
            this.parentClass = null;
            this.parentPrototype = {};
        },

        determineProperties: function(properties)
        {
            this._init();
            this._determineInheritance(properties);

            var name;

            for (name in properties) {
                if (name[0] == '$') {
                    this.statics[name.substr(1,name.length)] = properties[name];
                    continue;
                }
                if (name[0] == '_') {
                    this.privates[name.substr(1,name.length)] = properties[name];
                    continue;
                }
                
                this.publics[name] = properties[name];
            }
        },

        _determineInheritance: function(properties)
        {
            if (properties.extend === undefined) {
                return;
            }

            if (!$.isFunction(properties.extend)) {
                return;
            }

            this.parentClass = properties.extend;
            this.parentPrototype = this.parentClass[STR_PROTOTYPE];
            delete properties.extend;
        }
    };

	// =============== HELPERS =================

    // if we are initializing a new class
	var initializing = false,
		concatArgs = function(arr, args){
			return arr.concat($.makeArray(args));
		},
		isSuperCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
        isPrivateCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
        }) ? /\bthis\.privates\.\b/ : /.*/,
		STR_PROTOTYPE = 'prototype';

        var test = function() {
            this.privates()
        }

        console.log(isPrivateCalledInFunctionRegEx.test(test));



    Logger.log('fntest: ');
    Logger.log(isSuperCalledInFunctionRegEx);

    /**
     * overwrites an object with methods
     *
     * @param newProps objecct (new properties)
     * @param oldProps object (where the old properties might be)
     * @param addTo object (what we are adding to)
     */
    function inheritProps( newProps, oldProps, addTo ) {
        Logger.log('inherit props');
        Logger.log("old props");
        Logger.log(oldProps);
        Logger.log("new props");
        Logger.log(newProps);
        addTo = addTo || newProps;
        Logger.log("add to");
        Logger.log(addTo);
        for ( var name in newProps ) {
            // Check if we're overwriting an existing function
            Logger.log(isSuperCalledInFunctionRegEx);
            Logger.log('test property: ' + name);
            Logger.log(isSuperCalledInFunctionRegEx.test(newProps[name]));


            Logger.log('isFunction(newProps[name])');
            Logger.log($.isFunction(newProps[name]));
            Logger.log('isFunction(oldProps[name])');
            Logger.log($.isFunction(oldProps[name]));
            Logger.log('fnTest.test(newProps[name])');
            Logger.log(isSuperCalledInFunctionRegEx.test(newProps[name]));
            
            if ($.isFunction(newProps[name]) 
                && $.isFunction(oldProps[name]) 
                && isSuperCalledInFunctionRegEx.test(newProps[name])) 
            {

                Logger.log('overwritten prop detected!!!: ' + name);
                Logger.log('overwrite existing function / property: ' + name);

                addTo[name] = getOverriddenMethodWithSuper(newProps[name], oldProps[name]);
            }
            else {
                Logger.log('is not super: '+ name);
                addTo[name] = newProps[name];
            }
        }
    }

    /**
     * @param name String
     * @param fn function()
     */
    function getOverriddenMethodWithSuper( newMethod, oldMethod ) 
    {
        return function() {
            var tmp = this._super,
                ret;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = oldMethod;

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            ret = newMethod.apply(this, arguments);
            this._super = tmp;
            return ret;
        };
    }

    /**
     * copied from $.String helper to remove dependency
     *
     * @param {String} name the name of the object to look for
     * @param {Array} [roots] an array of root objects to look for the 
     *   name.  If roots is not provided, the window is used.
     * @param {Boolean} [add] true to add missing objects to 
     *  the path. false to remove found properties. undefined to 
     *  not modify the root object
     * @return {Object} The object.
     */
    function getObject( name, roots, add )
    {
        // the parts of the name we are looking up
        // ['App','Models','Recipe']
        var parts = name ? name.split(regs.dot) : [],
            length =  parts.length,
            current,
            ret, 
            i,
            r = 0,
            type;
        
        // make sure roots is an array
        roots = $.isArray(roots) ? roots : [roots || window];
        
        if(length == 0){
            return roots[0];
        }
        // for each root, mark it as current
        while( current = roots[r++] ) {
            // walk current to the 2nd to last object
            // or until there is not a container
            for (i =0; i < length - 1 && isContainer(current); i++ ) {
                current = getNext(current, parts[i], add);
            }
            // if we can get a property from the 2nd to last object
            if( isContainer(current) ) {
                
                // get (and possibly set) the property
                ret = getNext(current, parts[i], add); 
                
                // if there is a value, we exit
                if( ret !== undefined ) {
                    // if add is false, delete the property
                    if ( add === false ) {
                        delete current[parts[i]];
                    }
                    return ret;
                    
                }
            }
        }
    }

    
    /**
     * register class in dom namespace
     * @param fullName string
     */
    function registerClassInWindowNamespace(Class, fullName) 
    {
        var parts = fullName.split(/\./),
            shortName = parts.pop(),
            current = getObject(parts.join('.'), window, true),
            namespace = current;

            Logger.log('fullName: ' + fullName);
           
        current[shortName] = Class;

        Logger.log('current: ');
            Logger.log(current);
        Logger.log('curre[shortName]: ');
            Logger.log(current[shortName]);
            Logger.log('shortName ' 
             + shortName);
    }

    function proxy(funcs)
    {
        //args that should be curried
        var args = $.makeArray(arguments),
            self;

        // get the functions to callback
        funcs = args.shift();

        // if there is only one function, make funcs into an array
        if (!$.isArray(funcs) ) {
            funcs = [funcs];
        }
        
        // keep a reference to us in self
        self = this;
        
        //!steal-remove-start
        for( var i =0; i< funcs.length;i++ ) {
            if(typeof funcs[i] == "string" && !$.isFunction(this[funcs[i]])){
                throw ("class.js "+( this.fullName || this.Class.fullName)+" does not have a "+funcs[i]+"method!");
            }
        }
        //!steal-remove-end
        return function class_cb() {
            Logger.log('class callback returned');
            // add the arguments after the curried args
            var cur = concatArgs(args, arguments),
                isString, 
                length = funcs.length,
                f = 0,
                func;
            
            // go through each function to call back
            for (; f < length; f++ ) {
                func = funcs[f];
                if (!func ) {
                    continue;
                }
                
                // set called with the name of the function on self (this is how this.view works)
                isString = typeof func == "string";
                if ( isString && self._set_called ) {
                    self.called = func;
                }
                
                // call the function
                cur = (isString ? self[func] : func).apply(self, cur || []);
                
                // pass the result to the next function (if there is a next function)
                if ( f < length - 1 ) {
                    cur = !$.isArray(cur) || cur._use_call ? [cur] : cur;
                }
            }
            return cur;
        }
    }


    /**
     * @function newInstance
     * Creates a new instance of the class.  This method is useful for creating new instances
     * with arbitrary parameters.
     * @return {class} instance of the class
     */ 
    function newInstance(instance, arguments) 
    {
        Logger.log('newInstance');
        // call init if there is an init, if setup returned args, use those as the arguments
        if ( instance.init ) {
            instance.init.apply(instance, arguments);
        }
        return instance;
    }

    /**
     * @param {String} [fullName]  the classes name (used for classes w/ introspection)
     * @param {Object} [klass]  the new classes static/class functions
     * @param {Object} [proto]  the new classes prototype functions
     * 
     * @return {jQuery.Class} returns the new class
     */
    function createClass(fullName, properties) 
    {
        Logger.log('extend was called');
        
        PropertyHelper.determineProperties(properties);

        var statics = PropertyHelper.statics,
            privates = PropertyHelper.privates,
            publics = PropertyHelper.publics,
            parentClass = PropertyHelper.parentClass,
            parentPrototype = PropertyHelper.parentPrototype,
            name;


        Logger.log('statics');
        Logger.log(statics);
        
        Logger.log('publics');
        Logger.log(publics);
        
        Logger.log('privates');
        Logger.log(privates);

        proto = {};

        var 
            // _super_class = this,
            // _super = this[STR_PROTOTYPE],
            shortName, namespace, prototype;


        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        // prototype = new this();
        initializing = false;

         // The dummy class constructor
        function Class() {
            return newInstance(this, arguments);
        }

        $.extend(Class.prototype, parentPrototype, publics);

        // Copy the properties over onto the new prototype
        inheritProps(publics, parentPrototype, Class[STR_PROTOTYPE]);

        // Copy old stuff onto class
        // for ( name in this ) {
        //     if ( this.hasOwnProperty(name) ) {
        //         Class[name] = this[name];
        //     }
        // }

        // copy new static props on class
        Logger.log('inherit static properties');
        inheritProps(statics, parentClass || function() {}, Class);

        registerClassInWindowNamespace(Class, fullName);

        Logger.log('now extend for some things that cant be overwritten :S');

        //make sure our prototype looks nice
        // Class[STR_PROTOTYPE].Class = Class[STR_PROTOTYPE].constructor = Class;

        // call the class setup
        Logger.log('call the class setup');
        // var args = Class.setup.apply(Class, concatArgs([_super_class],arguments));
        
        // call the class init static constructor
        Logger.log('call init class static constructor');
        // if ( Class.init ) {
        //     Class.init.apply(Class, args || concatArgs([_super_class],arguments));
        // }

        // for (name in Class.prototype) {
        //     if (publics.hasOwnProperty(name)) {
        //         Class.prototype[name] = (function() {
        //             var originalProto = Class.prototype;
        //             var original = Class.prototype[name];
        //             return function() {
        //                 originalProto.privates = privates;
        //                 original.apply(this, arguments);
        //                 delete originalProto.privates;
        //             }
        //         })();
        //     }
        // }

        /* @Prototype*/
        return Class;
    }
    
    clss = $.Class = function(fullName, properties) {
        createClass(fullName, properties);
	};

})(jQuery);

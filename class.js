//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.

(function( $ ) {

    var PropertyHelper = {
        privates: {},
        publics: {},
        statics: {},

        setProperties: function(properties)
        {
            this.privates = {};
            this.publics = {};
            this.statics = {};
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
        }
    }

	// =============== HELPERS =================

    // if we are initializing a new class
	var initializing = false,
		makeArray = $.makeArray,
		isFunction = $.isFunction,
		isArray = $.isArray,
		extend = $.extend,
		concatArgs = function(arr, args){
			return arr.concat(makeArray(args));
		},
		
		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
		STR_PROTOTYPE = 'prototype';

    Logger.log('fntest: ');
    Logger.log(fnTest);

    /**
     * overwrites an object with methods
     *
     * @param newProps objecct (new properties)
     * @param oldProps object (where the old properties might be)
     * @param addTo object (what we are adding to)
     */
    function inheritProps( newProps, oldProps, addTo ) {
        console.log('inherit props');
        console.log("old props");
        console.log(oldProps);
        console.log("new props");
        console.log(newProps);
        addTo = addTo || newProps;
        console.log("add to");
        console.log(addTo);
        for ( var name in newProps ) {
            // Check if we're overwriting an existing function
            console.log(fnTest);
            console.log('test property: ' + name);
            console.log(fnTest.test(newProps[name]));


            console.log('isFunction(newProps[name])');
            console.log(isFunction(newProps[name]));
            console.log('isFunction(oldProps[name])');
            console.log(isFunction(oldProps[name]));
            console.log('fnTest.test(newProps[name])');
            console.log(fnTest.test(newProps[name]));
            
            if (isFunction(newProps[name]) && isFunction(oldProps[name]) && fnTest.test(newProps[name])) {

                console.log('overwritten prop detected!!!: ' + name);
                console.log('overwrite existing function / property: ' + name);

                addTo[name] = getOverriddenMethodWithSuper(newProps[name], oldProps[name]);
            }
            else {
                console.log('is not super: '+ name);
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
    };

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
        if ( !fullName ) {
            return;
        }

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
        var args = makeArray(arguments),
            self;

        // get the functions to callback
        funcs = args.shift();

        // if there is only one function, make funcs into an array
        if (!isArray(funcs) ) {
            funcs = [funcs];
        }
        
        // keep a reference to us in self
        self = this;
        
        //!steal-remove-start
        for( var i =0; i< funcs.length;i++ ) {
            if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
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
                    cur = !isArray(cur) || cur._use_call ? [cur] : cur;
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
        // get a raw instance objet (init is not called)
        // var inst = this.rawInstance(),
        //     args;
            
        // call setup if there is a setup
        // if ( inst.setup ) {
        //     args = inst.setup.apply(inst, arguments);
        // }
        // call init if there is an init, if setup returned args, use those as the arguments
        if ( instance.init ) {
            instance.init.apply(instance, arguments);
        }
        return instance;
    }

    /**
     * Setup gets called on the inherting class with the base class followed by the
     * inheriting class's raw properties.
     * 
     * Setup will deeply extend a static defaults property on the base class with 
     * properties on the base class.  For example:
     * 
     * @param {Object} baseClass the base class that is being inherited from
     * @param {String} fullName the name of the new class
     * @param {Object} staticProps the static properties of the new class
     * @param {Object} protoProps the prototype properties of the new class
     */
    function setup(baseClass,fullName) 
    {
        Logger.log('setup');
        // set defaults as the merger of the parent defaults and this object's defaults
        this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
        return arguments;
    }

    function rawInstance() 
    {
        // prevent running init
        initializing = true;
        var inst = new this();
        initializing = false;
        // allow running init
        return inst;
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
        var parentClass = null,
            parentPrototype = {};

        if (properties.extend !== undefined) {
            Logger.log("extend ref");
            Logger.log(properties.extend);
            if ($.isFunction(properties.extend)) {
                parentClass = properties.extend;
                parentPrototype = parentClass[STR_PROTOTYPE];
            }
            delete properties.extend;
        }
        
        PropertyHelper.setProperties(properties);

        var statics = PropertyHelper.statics,
            privates = PropertyHelper.privates,
            publics = PropertyHelper.publics,
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
            // All construction is actually done in the init method
            if ( initializing ) return;

            // we are being called w/o new, we are extending
            // if ( this.constructor !== Class && arguments.length ) {
            //     return arguments.callee.extend.apply(arguments.callee, arguments);
            // } else { //we are being called w/ new
                return newInstance(this, arguments);
            // }
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
        // inheritProps(statics, parentClass, Class);

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


	/* @Static*/
	// extend(clss, 
    // {
	// });


	clss.callback = clss[STR_PROTOTYPE].callback = clss[STR_PROTOTYPE].
	/**
	 * @function proxy
	 * Returns a method that sets 'this' to the current instance.  This does the same thing as 
	 * and is described better in [jQuery.Class.static.proxy].
	 * The only difference is this proxy works
	 * on a instance instead of a class.
	 * @param {String|Array} fname If a string, it represents the function to be called.  
	 * If it is an array, it will call each function in order and pass the return value of the prior function to the
	 * next function.
	 * @return {Function} the callback function
	 */
	proxy = clss.proxy;


})(jQuery);

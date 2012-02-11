//jQuery.Class 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.

(function( $ ) {

    $.Class = function(className, properties) 
    {
        var props = new Properties(properties);
        props.separate();

        var generator = new ClassGenerator(className);
        generator.setProperties(props);
        generator.create();

        if ($.Interface === undefined) {
            $.Interface = dummyInterface;
        }
	};

    function interfaceExists()
    {
        if ($.Interface === undefined || $.Interface === dummyInterface) {
            return false;
        }
        return true;
    };

    // define regex outside of ClassGenerator to define them once only
    var isSuperCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
        isPrivateCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
        }) ? /\bthis\.secrets\.\b/ : /.*/;

    function ClassGenerator(className)
    {
        if (className == '' || !className) {
            throw new Error('Invalid class name.');
        }
        this.props = null;
        this.name = className;
    };

    ClassGenerator.prototype =
    {
        setProperties: function(properties) 
        {
            this.props = properties;
        },
        /**
         * overwrites an object with methods
         *
         * @param newProps object (new properties)
         * @param oldProps object (where the old properties might be)
         * @param addTo object (what we are adding to)
         */
        _inheritProps: function(newProps, oldProps, addTo) 
        {
            addTo = addTo || newProps;
            for (var name in newProps) {
                // Check if we're overwriting an existing function
                if ($.isFunction(newProps[name]) 
                    && $.isFunction(oldProps[name]) 
                    && isSuperCalledInFunctionRegEx.test(newProps[name])) 
                {
                    addTo[name] = this._getOverriddenMethodWithSuper(newProps[name], oldProps[name]);
                }
                else {
                    addTo[name] = newProps[name];
                }
            }
        },
        /**
         * @param newMethod function()
         * @param oldMethod function()
         */
        _getOverriddenMethodWithSuper: function(newMethod, oldMethod)
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
                delete this._super;
                return ret;
            }
        },

        /**
         * register class in dom namespace
         */
        _registerClassInWindowNamespace: function (Class)
        {
            var parts = this.name.split(/\./),
                shortName = parts.pop(),
                current = this._getObject(parts.join('.'), window, true),
                namespace = current;

            current[shortName] = Class;
        },
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
        _getObject: function(name, roots, add)
        {
            // the parts of the name we are looking up
            // ['App','Models','Recipe']
            var regs = {
                    undHash: /_|-/,
                    colons: /::/,
                    words: /([A-Z]+)([A-Z][a-z])/g,
                    lowUp: /([a-z\d])([A-Z])/g,
                    dash: /([a-z\d])([A-Z])/g,
                    replacer: /\{([^\}]+)\}/g,
                    dot: /\./
                },
                isContainer = function(current){
                    var type = typeof current;
                    return current && ( type == 'function' || type == 'object' );
                },
                getNext = function(current, nextPart, add){
                    return current[nextPart] !== undefined ? current[nextPart] : ( add && (current[nextPart] = {}) );
                },
                parts = name ? name.split(regs.dot) : [],
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
        },
        /**
         * @function newInstance
         * Creates a new instance of the class.  This method is useful for creating new instances
         * with arbitrary parameters.
         * @return {class} instance of the class
         */ 
        newInstance: function(instance, arguments)
        {
            if (interfaceExists()) {
                this.ensureInterfaces(instance);
            }

            // call init if there is an init, if setup returned args, use those as the arguments
            if ( instance.init ) {
                instance.init.apply(instance, arguments);
            }

            return instance;
        },
        ensureInterfaces: function(object)
        {
            if (!object['___interfaces']) {
                return;
            }

            $.Interface.ensureImplementation(object, object['___interfaces']);
        },

        _inheritInterfaces: function()
        {
            if (this.props.parentPrototype['___interfaces'] && this.props.publics['___interfaces']) {
                this.props.publics['___interfaces'] = 
                    this.props.parentPrototype['___interfaces'].concat(this.props.publics['___interfaces']);
            }
        },

        _inheritStatics: function()
        {
            if (!this.props.parentClass) {
                return;
            }

            for (name in this.props.parentClass) {
                this.props.statics[name] = this.props.parentClass[name];
            }
        },

        _inheritPrototype: function(func)
        {
            if (!this.props.parentClass) {
                return;
            }

            function parent() {};

            parent.prototype = this.props.parentPrototype;
            func.prototype = new parent();


        },

        _attachPrivates: function(func)
        {
            var me = this;
            for (name in func.prototype) {
                if (this.props.publics.hasOwnProperty(name) 
                    && isPrivateCalledInFunctionRegEx.test(func.prototype[name])
                    && $.isFunction(func.prototype[name]))
                {
                    func.prototype[name] = (function() {
                        var originalProto = func.prototype;
                        var original = func.prototype[name];
                        return function() {
                            originalProto.secrets = me.props.secrets;
                            var value = original.apply(this, arguments);
                            delete originalProto.secrets;
                            return value;
                        }
                    })();
                }
            }
        },

        create: function()
        {
            var generator = this;

             // The dummy class constructor
            function Class() {
                return generator.newInstance(this, arguments);
            }
            
            this._inheritPrototype(Class); 
            this._inheritStatics();
            this._inheritInterfaces();
            $.extend(Class.prototype, this.props.publics);
            // Copy the properties over onto the new prototype
            this._inheritProps(this.props.publics, this.props.parentPrototype, Class['prototype']);
            // copy new static props on class
            this._inheritProps(this.props.statics, this.props.parentClass || function() {}, Class);
            this._registerClassInWindowNamespace(Class);
            this._attachPrivates(Class);

            /* @Prototype*/
            return Class;
        }
    };

    function Properties(properties)
    {
        if (!properties) {
            throw new Error('Properties are required');
        }

        this.properties = properties;
        this.secrets = {};
        this.publics = {};
        this.statics = {};
        this.parentClass = null;
        this.parentPrototype = {};
        this.implement = [];
    };

    Properties.prototype = 
    {
        isPrivatePropertyRegEx: /^_[a-z]/,

        separate: function()
        {
            this._separateInheritance();
            this._separateInterfaces();

            var name;

            for (name in this.properties) {
                if (name[0] == '$') {
                    this.statics[name.substr(1,name.length)] = this.properties[name];
                    continue;
                }
                if (this.isPrivatePropertyRegEx.test(name)) {
                    this.secrets[name.substr(1,name.length)] = this.properties[name];
                    continue;
                }
                
                this.publics[name] = this.properties[name];
            }
        },

        _separateInheritance: function()
        {
            if (this.properties.extend === undefined) {
                return;
            }

            if (!$.isFunction(this.properties.extend)) {
                return;
            }

            this.parentClass = this.properties.extend;
            this.parentPrototype = this.parentClass['prototype'];
            delete this.properties.extend;
        },

        _separateInterfaces: function()
        {
            if (this.properties.implement === undefined) {
                return;
            }

            if (interfaceExists()) {
                this.implement = $.isArray(this.properties.implement) ? this.properties.implement : [this.properties.implement];
                this.publics['___interfaces'] = this.implement;
            }

            delete this.properties.implement;
        }
    };

    function dummyInterface() {};

    dummyInterface.ensure = function() {};
    dummyInterface.ensureImplementation = function() {};

})(jQuery);

// jQuery.Class 
// Mostly inspired by $.Class component of javascriptMVC (http://javascriptmvc.com/docs.html#!jQuery.Class)

(function( $ ) {

    /**
     * @param {String} className
     * @param {Object} properties
     */
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

    /**
     * static
     *
     * @param {String} namespace the object to look for
     * @return {Object} The object.
     */
    $.Class.getObject = function(namespace) 
    {
        if (namespace == '' || namespace == undefined) {
            return window;
        }

        var namespaceParts = namespace.split('.');

        var root = window;

        for (var i in namespaceParts) {
            if (typeof root[namespaceParts[i]] == 'undefined') {
                root[namespaceParts[i]] = {};
            }

            root = root[namespaceParts[i]];
        }

        return root;
    };
    
    // define regex outside of ClassGenerator to define them once only
    var privatePropertyRegEx = /\b(this._)+\w+\b/g;
        isSuperCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,
        isPrivateCalledInFunctionRegEx = /xyz/.test(function() {
			xyz;
        }) ? privatePropertyRegEx : /.*/,

        /**
         * @return {Boolean}
         */
        interfaceExists = function()
        {
            if ($.Interface === undefined || $.Interface === dummyInterface) {
                return false;
            }
            return true;
        };

    /**
     * @constructor
     * @param {String} className
     */
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
        /**
         * @param {Object} properties
         */
        setProperties: function(properties) 
        {
            this.props = properties;
        },

        /**
         * overwrites an object with methods
         *
         * @param {Object} newProps
         * @param {Object} oldProps (where the old properties might be)
         * @param {Object} addTo (what we are adding to)
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
         * @param {Function} newMethod
         * @param {Function} oldMethod
         * @return {Function}
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
         * register class
         * @param {Function} class
         */
        _registerClassInWindowNamespace: function (Class)
        {
            var parts = this.name.split(/\./),
                shortName = parts.pop(),
                current = $.Class.getObject(parts.join('.')),
                namespace = current;

            current[shortName] = Class;
        },

        /**
         * @param {Object} instance
         * @param {Array} arguments
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

        /**
         * @param {Object} object
         */
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

        /**
         * @param {Function} func
         */
        _inheritPrototype: function(func)
        {
            if (!this.props.parentClass) {
                return;
            }

            function parent() {};

            parent.prototype = this.props.parentPrototype;
            func.prototype = new parent();


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

            /* @Prototype*/
            return Class;
        }
    };

    /**
     * Helper class for separating properties
     * @constructor
     * @param {Object} properties
     */
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
        isPrivatePropertyRegEx: /^_\w/,

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
                    this.secrets[name] = this.properties[name];
                    continue;
                }
                
                this.publics[name] = this.properties[name];
            }

            this._attachPrivateMethods();
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
        },

        _getMethodWithPrivateMethodsAttached: function(method, privatePropName, privateProp)
        {
            return function() {
                this[privatePropName] = privateProp;
                var value = method.apply(this, arguments);
                delete this[privatePropName];
                return value;
            };

        },

        _attachPrivateMethods: function()
        {
            var name;
            for (name in this.publics) {
                if (!$.isFunction(this.publics[name])) {
                    continue;
                }
                var privateFunctionsToAttach = this.publics[name].toString().match(privatePropertyRegEx);

                for (var i in privateFunctionsToAttach) {
                    var privatePropName = this._getPrivateMethodName(privateFunctionsToAttach[i]);
                    if (this.secrets[privatePropName] === undefined) {
                        continue;
                    }

                    this.publics[name] = this._getMethodWithPrivateMethodsAttached(
                        this.publics[name], privatePropName, this.secrets[privatePropName]
                    );
                }
            }
        },

        _getPrivateMethodName: function(name)
        {
            return name.replace(/(this.)/, '').replace(/\(/, '');
        },
    };

    function dummyInterface() {};

    dummyInterface.ensure = function() {};
    dummyInterface.ensureImplementation = function() {};

})(jQuery);

define(["knockout", "jquery"],function(ko, $){
	
	var VIEW_DATA_NAME = "nl.view";
	
	var ClassProtectedConflictError = function(message){
		this.message = message || "Class protected members overrided!";
		return this;
	};
	ClassProtectedConflictError.prototype = new Error();
	ClassProtectedConflictError.prototype.constructor= ClassProtectedConflictError;
	ClassProtectedConflictError.prototype.name = "ClassProtectedConflictError";
	
	/**
	 * Convenience method for formatting Time
	 * 
	 * @param {Date}
	 *            oDate the date that should be formatted
	 * @param {boolean}
	 *            [bMillis=false] whether milliseconds should be included in the
	 *            formatted output.
	 * @returns {String} time information of the given oDate as formatted
	 *          string, including milliseconds in case of bMillis was
	 *          <code>true</code>
	 * @private
	 */
	function formatTime(oDate, bMillis) {
		var sHours = oDate.getHours() < 10 ? "0" + oDate.getHours() : ""
				+ oDate.getHours(), sMinutes = oDate.getMinutes() < 10 ? "0"
				+ oDate.getMinutes() : "" + oDate.getMinutes(), sSeconds = oDate
				.getSeconds() < 10 ? "0" + oDate.getSeconds() : ""
				+ oDate.getSeconds(), sMillis = oDate.getMilliseconds() < 10 ? "00"
				+ oDate.getMilliseconds()
				: oDate.getMilliseconds() < 100 ? "0" + oDate.getMilliseconds()
						: "" + oDate.getMilliseconds();
		if (bMillis !== false) {
			return sHours + ":" + sMinutes + ":" + sSeconds + " " + sMillis;
		} else {
			return sHours + ":" + sMinutes + ":" + sSeconds;
		}
	}

	/*
	 * 0: none
	 * 1: fatal
	 * 2: error
	 * 3: info
	 * 4: debug
	 */
	var aUnlogedMessages = [];
	
	function logMessage(iLevel, sMessage){

		if (window.console && console.info) {
			
			if(iLevel === 1){
				console.error(sMessage);
			}else if(iLevel === 2){
				console.error(sMessage);
			}else if(iLevel === 3){
				console.warn(sMessage);
			}else if(iLevel === 4){
				console.info(sMessage);
			}else if(iLevel === 5){
				console.log(sMessage);
			}
			
		}
		
		
	}
	
	
	var core = {
		/*
		 * load view from sPath into element,
		 * in sPath, it must contains name.html and name.js and return a class (for Knockout model)
		 */
		loadView: function(element, sPath){
			
			require(["require", sPath, "text!" + sPath + ".html"], function(require, model, html){				
				var $el = $(element);
				var oOldModel = $el.data(VIEW_DATA_NAME);
				
				if( oOldModel ){
					//clean up & destroy the old view 
					
					oOldModel.destroyView();
					oOldModel.destroy();
					
					ko.cleanNode($el[0]);
					
					$el.removeData(VIEW_DATA_NAME);
				}
				
				//load new model
				$el.html(html);
				var oNewModel = new model($el);
				ko.applyBindings(oNewModel, $el[0]);
				$el.data(VIEW_DATA_NAME, oNewModel);
			});
		},
		log: {
			
		},
		/**
		 * create the class (constructor) , supply basic inherit options
		 * @param {object} prop The option of the new class
		 * @param {string} [prop.Name] The namespace and name of this class (start from window), leave empty for unnamed class
		 * @param {constructor} [prop.Base] The Base class of the new class
		 * @param {object} [prop.Public] the public methods/variables
		 * @param {object} [prop.Protected] the protected methods/variables, exception will be thrown if the member is overrided
		 * @param {object} [prop.Static] the static methods/variables for this class
		 */
		klass:  function (prop) {
			//check if incorrect options in the arguments
			for (var parameter in prop) {
				if (!(parameter in {Name:1, Base:1, Public:1, Protected:1, Static:1})) {
					throw new TypeError("Unsupport option ["+ parameter +"] in option of class declaretion");
				}
			};
			var _proto_ = {};
			if (prop.Base) {
				if(typeof(prop.Base) === 'string'){
					throw new Error("Base is string type");
				}
				var empty = function(){};
				empty.prototype = prop.Base.prototype;
				_proto_ = new empty();
			};
	
			if (prop.Public) {
	
	
				// copy all the method to the prototype
				$.extend(true, _proto_, prop.Public);
				// modify the destroy to call the destroy of based class
				if (prop.Public.destroy) {
					var customedDestory = prop.Public.destroy;
					var baseDestroy = prop.Base && prop.Base.prototype && prop.Base.prototype.destroy;
					_proto_.destroy = function(){
						customedDestory.call(this);
						baseDestroy && baseDestroy.call(this);
					};
				}
			}
			if (prop.Protected) {
				// check if any of the members is conflicted with the public members and the base class
				if (prop.Public) {
					for (var member in prop.Protected) {
						if (member in prop.Public) {
							throw new ClassProtectedConflictError("Class protected member [" + member +"] had been defined in public section");
						}
					}
				}
				for (var member in prop.Protected) {
					if (member in _proto_) {
						throw new ClassProtectedConflictError("Class protected member [" + member +"] had been defined in base class");
					}
				}
				$.extend(true, _proto_, prop.Protected);
			}
	
			var _magicObj = {};
			var newConstructor = function(){
				if (arguments[0] !== _magicObj) {
					return new newConstructor(_magicObj, arguments);
				} else {
					// call the Initialize function
					this.init && this.init.apply(this, arguments[1]);
					return this;
				}
			};
			
			_proto_.members = function(mMembers){
	
				for(var sName in mMembers){
					if(this[sName] !== undefined){
						sap.util.log.fatal("Member '" + sName + "' already exists in class '" + this.constructor.__className + "'. (may in parent class)");
					}else{
						this[sName] = mMembers[sName];
					}
				}
			};
			
			
			newConstructor.prototype = _proto_;
			newConstructor.prototype.constructor = newConstructor;
			// copy all the static methods/variables from current class and the base class
			// newConstructor.__staticMembers = $.extend(true, {}, prop.Base && prop.Base.__staticMembers);
			// $.extend(true, newConstructor.__staticMembers , prop.Static );
			// $.extend(true, newConstructor, newConstructor.__staticMembers );
			$.extend(true, newConstructor, prop.Static );
	
			if (prop.Name) {
				core.createNS(prop.Name, newConstructor);
				newConstructor.__className = prop.Name;
				if ( prop.Base ) {
					newConstructor.__baseClass = prop.Base;
					if (prop.Base.__className) {
						newConstructor.__baseClassName = prop.Base.__className;
					};
				}
			};
			
	
			return newConstructor;
		},
		createNS: function(NamespaceStr, obj) {
			var subNamespaces = NamespaceStr.split('.');
			var base = window, target = subNamespaces.slice(-1)[0];
			for (var i=0, ilen=subNamespaces.length; i<ilen; ++i) {
				if ( i !== 0 ) {
					base = base[ subNamespaces[i-1] ];
				};
				if (!base[subNamespaces[i]]) {
					base[subNamespaces[i]] = {};
				};
			};
			if (arguments.length > 1) {
				base[target] = obj;
			};
			return base[target];
		},
		log: {
			fatal : function(sMessage) {
				logMessage(1, '[' + formatTime(new Date()) + ']:'+ sMessage);
				throw new Error(sMessage);
			},
			error: function(sMessage) {
				logMessage(2, '[' + formatTime(new Date()) + ']:'+ sMessage);
				return this;
			},
			warn: function(sMessage) {
				logMessage(3, '[' + formatTime(new Date()) + ']:'+ sMessage);
				return this;
			},
			info : function(sMessage) {
				logMessage(4, '[' + formatTime(new Date()) + ']:'+ sMessage);
				return this;
			},
			debug : function(sMessage) {
				logMessage(5, '[' + formatTime(new Date()) + ']:'+ sMessage);
				return this;
			}
		}
	};
	
	
	core.log.info("NextLu UI Framework loading");
	
	return core;
});

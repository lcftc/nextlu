define(["jquery","nl/core"], function($,core) {
	"use strict";
	return core.klass({
		Name: "BaseView",
		Public: {
			init: function($el){
				this.members({
					__$el: $el
				});
			},
			destroy: function(){
				this.__$el = null;
			},
			$: function(){
				return this.__$el;
			},
			afterRender: function(elements, context){
				context.initView();
			},
			//override this class
			initView: function(){
				
			},
			destroyView: function(){
				
			}
		}
	});
});
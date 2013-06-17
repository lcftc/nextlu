define(["knockout", "jquery", "bootstrap", 
	"nl/BaseView", "nl/core",
	"less!app/Welcome"], function(ko, $, bs, BaseView, core) { "use strict";
	
	
	return core.klass({
		Name: "Welcome",
		Base: BaseView,
		Public: {
			init: function(){
				BaseView.prototype.init.apply(this, arguments);
				
				this.members({
					
				});
			},
			destroy: function(){
				
			},
			initView: function(){
				this.$().find("#btnRegister").click(function() {
					$("#myModal").modal("toggle");
				});
			}
		}
	});
});
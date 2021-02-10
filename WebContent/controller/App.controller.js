sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/m/MessageToast" ], function(
		Controller, MessageToast) {
	"use strict";

	return Controller.extend("de.arvato.GRModul05.controller.App", {
		onInit: function() {
			
			var oShell = sap.ui.getCore().byId("shell");
			if(oShell){
				// Bestimmt keine optimale Loesung!
				oShell.setHeaderHiding(false);
			}
		}
	});
});
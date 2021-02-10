sap.ui.define([
	"sap/ui/core/UIComponent", "sap/ui/Device", "de/arvato/GRModul05/model/models"
], function(UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("de.arvato.GRModul05.Component", {

	metadata : {
	    manifest : "json"
	},

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method
	 * once.
	 * 
	 * @public
	 * @override
	 */
	init : function() {
	    // call the base component's init function
	    UIComponent.prototype.init.apply(this, arguments);

	    // enable routing
	    this.getRouter().initialize();

	    // set the device model
	    this.setModel(models.createDeviceModel(), "device");
	    
//	    sap.ui.getCore().byId("shell").setHeaderHiding(false);
	    
//	    var oShellHeader = sap.ui.getCore().byId("shell-hdr");
//	    oShellHeader.addEventDelegate({
//	        onAfterRendering: function () {
//	        	var oRenderer = sap.ushell.Container.getRenderer("fiori2");
//	        	oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
//	        }
//	    })
	},
	
	_readClient: function(sLocID, sLgnum, fnSuccess){
		
		var oModel = this.getModel("app");
		var oERPModel = this.getModel("erp");		
		oERPModel.read("/SapClientSet", {
			filters: [
				new sap.ui.model.Filter({ path: "LocID", operator: sap.ui.model.FilterOperator.EQ, value1: sLocID }),
				new sap.ui.model.Filter({ path: "Lgnum", operator: sap.ui.model.FilterOperator.EQ, value1: sLgnum })
			],
			success : function(oData, oResponse) {		
				fnSuccess(oData.results);
			}.bind(this),
			error : function(oError) {}
		});
	},
	
	_readLocation: function(sLgnum, fnSuccess){
		
		var oModel = this.getModel("app");
		var oERPModel = this.getModel("erp");		
		oERPModel.read("/LocationSet", {
			filters: [new sap.ui.model.Filter({ path: "Lgnum", operator: sap.ui.model.FilterOperator.EQ, value1: sLgnum })],
			success : function(oData, oResponse) {
				fnSuccess(oData.results);				
			}.bind(this),
			error : function(oError) {}
		});
	},
	
	_readEmployee : function(sIdent, fnSuccess) {

	    var oModel = this.getModel("app");
	    var oERPModel = this.getModel("erp");
	    var oBundle = this.getModel("i18n").getResourceBundle();

	    oModel.setProperty("/Employee/ID", sIdent);	    

	    // var sReadUrl = "/CheckSet('" + sInput + "')";
	    var sReadUrl = "/UserSet";

	    var oCmrRefFilter = new sap.ui.model.Filter({
			path : "Ident",
			operator : sap.ui.model.FilterOperator.EQ,
			value1 : sIdent
	    });

	    oERPModel.read(sReadUrl, {
		filters : [
		    oCmrRefFilter
		],
		success : function(oData, oResponse) {
		    var sName, sUser, sLgnum;

		    if (oData.results.length = 1) {
			var oResult = oData.results[0];
			if (oResult) {
			    sName = oResult.Address.Lastname + ", " + oResult.Address.Firstname;
			    sUser = oResult.Username;
			    sLgnum = oResult.Lgnum;
			}
			else {
			    sap.m.MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
				at : "center center"
			    });
			}
		    }
		    else {
			sap.m.MessageToast.show(oBundle.getText("General.EmployeeNotFound"), {
			    at : "center center"
			});
		    }

		    // Falls Ident nicht erkannt wurde, Wert auf undefined setzen!
		    oModel.setProperty("/Employee/Name", sName);
		    oModel.setProperty("/Employee/User", sUser);
		    oModel.setProperty("/Employee/Lgnum", sLgnum);
		    if (sName) {			
		    	fnSuccess();
		    }
		},
		error : function(oError) {
		    sap.m.MessageToast.show(Helper.getErrorValue(oError), {
			at : "center center"
		    });
		}
	    });
	},
    });
});

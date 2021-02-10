sap.ui.define([
	'sap/m/MessageToast', 'sap/m/Button', 'sap/m/Dialog', 'sap/m/Label', 'sap/m/Text', 'sap/m/TextArea',
	"sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller", "sap/m/MessageBox",
	"de/arvato/GRModul05/libs/Helper"
], function(MessageToast, Button, Dialog, Label, Text, TextArea, JSONModel, Controller, MessageBox, Helper) {
    "use strict";

    return Controller.extend("de.arvato.GRModul05.controller.Main", {

	/**
	 * @memberOf Main.onInit
	 * @author step019
	 */
	onInit : function() {

	    this._oAppModel = this.getOwnerComponent().getModel("app");
	    this._oERPModel = this.getOwnerComponent().getModel("erp");
	    this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	    
	    var aNotifications = [];
	    aNotifications = this._oAppModel.getProperty("/Notifications");
	    if (aNotifications[0]){
	    	aNotifications[0].Descr = this._oBundle.getText("RoughRG.Avised");
	    }
	    if (aNotifications[1]){
	    	aNotifications[1].Descr = this._oBundle.getText("RoughRG.NotAvised");
	    }
	    if (aNotifications[2]){
	    	aNotifications[2].Descr = this._oBundle.getText("RoughRG.WrongAvised");
	    }
	    
	    // sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
	    var oMessageManager, oModel, oView;

	    oView = this.getView();

	    // set message model
	    oMessageManager = sap.ui.getCore().getMessageManager();
	    oView.setModel(oMessageManager.getMessageModel(), "message");

	    // or just do it for the whole view
	    oMessageManager.registerObject(oView, true);

	    //
	    var oDate = new Date();
	    this._oAppModel.setProperty("/currentDate", oDate);

	    var that = this;
	    this.getView().onAfterRendering = function() {
		that._oAppModel.setProperty("/ControlEnabled", false);

		// sap.ndc.BarcodeScanner.scan(function(sResult) {
		// that.getOwnerComponent()._readEmployee(sResult.text, function() {
		// that._oAppModel.setProperty("/ControlEnabled", true);
		// });
		// });
		
		var oScanButton = this.getView().byId("idScanButton");
		if (oScanButton) {
		    oScanButton._onPress();
		}

	    }.bind(this);

	    // this._oERPModel.attachRequestCompleted(function(oEvent) {
	    // var oScanButton = this.getView().byId("idScanButton");
	    // if (oScanButton) {
	    // oScanButton._onPress();
	    // }
	    // }.bind(this));
	},

	onEmployeeInputSuccess : function(oEvent) {
	    
	    var sEmployeeIdent = oEvent.getParameter("value");
	    this.getOwnerComponent()._readEmployee(sEmployeeIdent, function() {
	    	this._oAppModel.setProperty("/ControlEnabled", true);
	    	
	    	var sLgnum = this._oAppModel.getProperty("/Employee/Lgnum");
	    	this.getOwnerComponent()._readLocation(sLgnum, function(aLoadedLocations){
	    		
	    		var aLocations = [];
				if (aLoadedLocations.length > 0){
					aLoadedLocations.forEach(function(oLocation) {
						var sDescr = oLocation.LocID === "HW" ? "HW1" : oLocation.LocID;						
						aLocations.push( { Name: oLocation.LocID, Descr: sDescr } );
					});
					this._oAppModel.setProperty("/Locations", aLocations);
					
					var oLocationComboBox = this.getView().byId("idLocation");
					if(aLocations.length == 1){						
						var oItem = oLocationComboBox.getItems()[0];
						oLocationComboBox.setSelectedItem(oItem);
						oLocationComboBox.fireSelectionChange({							
							selectedItem: oItem
						});
					} else {
						var oClientComboBox = this.getView().byId("idSapClientComboBox");
						oLocationComboBox.setSelectedItem();
				    	oClientComboBox.setSelectedItem();		
					}
				}
	    	}.bind(this));
		
	    	var oScanButton = this.getView().byId("idPrintButton");
	    	if (oScanButton) {
	    		oScanButton._onPress();
	    	}		
	    }.bind(this));
	},
	
	onPrinterInputSuccess: function(oEvent) {
	    var sPrinter = oEvent.getParameter("value");
	    this._oAppModel.setProperty("/Printer", sPrinter.toUpperCase());
	},

	onDocTypeReceived : function(oEvent) {
	    var oDocTypeCombo = this.getView().byId("idDocTypeComboBox");
	    oDocTypeCombo.setSelectedKey("EX");
	},

	onLocationComboBoxSelectionChange : function() {
		var sLocation = "";
	    var oLocationComboBox = this.getView().byId("idLocation");
	    if (oLocationComboBox.getSelectedItem()) {
	    	sLocation = oLocationComboBox.getSelectedItem().getProperty("key");
	    	this._oAppModel.setProperty("/Location", sLocation);
	    }
	    
	    var sLgnum = this._oAppModel.getProperty("/Employee/Lgnum");
	    this.getOwnerComponent()._readClient(sLocation, sLgnum, function(aClients){
	    	this._oAppModel.setProperty("/SapClients", aClients);
	    	
	    	var oClientComboBox = this.getView().byId("idSapClientComboBox");
	    	if(aClients.length == 1){	    		
				var oItem = oClientComboBox.getItems()[0];
				oClientComboBox.setSelectedItem(oItem);				
	    	} else {
	    		oClientComboBox.setSelectedItem();		
	    	}
	    	
	    }.bind(this));
	},

	// onEmployeeBarcodeScanSuccess : function(oEvent) {
	//
	// var that = this;
	// var sText = oEvent.getParameter("text");
	// this.getOwnerComponent()._readEmployee(sText, function() {
	// that._oAppModel.setProperty("/ControlEnabled", true);
	// });
	// },

	// onEmployeeInputSubmit : function(oEvent) {
	//
	// var that = this;
	// var sText = oEvent.getParameter("value");
	// this.getOwnerComponent()._readEmployee(sText, function() {
	// that._oAppModel.setProperty("/ControlEnabled", true);
	// });
	// },

	onGoToSemanticObject : function(oEvent) {

	    var that = this;
	    if (sap.ushell) {

		// var sAction = oEvent.getSource().data("action") ? oEvent.getSource().data("action") : undefined;

		this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
		this.oCrossAppNav.toExternal({
		    target : {
			semanticObject : oEvent.getSource().data("SemanticObject"),
			action : oEvent.getSource().data("action")
		    },
		    params : {
			"EmployeeID" : that._oAppModel.getProperty("/Employee/ID")
		    }
		});
	    }

	},

	onExtNumberSubmit : function(oEvent) {

	    var aPOList = this._oAppModel.getProperty("/POList");
	    var sPONumber = oEvent.getParameter("value");

	    var aExistPONumber = aPOList.filter(function(value, index, arr) {
		return value.PONumber === sPONumber;
	    });

	    if (sPONumber === "") {
		MessageToast.show(this._oBundle.getText("RoughRG.PONumberEmpty"));
	    }
	    else if (aExistPONumber.length > 0) {
		MessageToast.show(this._oBundle.getText("RoughRG.PONumberExist", [
		    sPONumber
		]));
	    }
	    else {

		aPOList.unshift({
		    "PONumber" : this._oAppModel.getProperty("/ExtNumber")
		});
		this._oAppModel.refresh();

	    }

	    oEvent.getSource().setValue("");
	},

	onExtNumberDelete : function(oEvent) {	    
	    
	    var oItem = oEvent.getParameter("listItem");    
	    
	    var oList = this._oAppModel.getProperty("/POList");
	    if (oList && Array.isArray(oList)){
		var iIndex = oList.findIndex(obj => obj.PONumber === oItem.getProperty("title"));
		oList.splice(iIndex, 1);
		this._oAppModel.refresh();
	    }
	},
	
	printRoughGR: function(oData) {
		    
	    this._oERPModel.callFunction("/PrintRoughGR", {
		method: "GET",   
		urlParameters: {
	            Zgweno: oData.RoughGR,
	            Printer: oData.Printer
		},
	        success: function(oData, response) {
	            MessageToast.show(
	        	    this._oBundle.getText("Message.RoughGRPrintSuccessfull", [oData.Zgweno]));	            
	        }.bind(this),
	        error: function(oError) {
	            
	        }.bind(this)
           }); 
	},
	
	onPrintButton: function(oEvent) {
	    
	    var oScanButton = new de.arvato.GRModul05.libs.ScanButton({
		inputType: "Number",
		dialogTitle: this._oBundle.getText("RoughGR.Number"),
		dialogAbortText:  this._oBundle.getText("General.AbortButton"),
		dialogIcon: "sap-icon://collapse",
		inputSuccess: function(oEvent) {		   
		   this.printRoughGR({
		       RoughGR: oEvent.getParameter("value"),
		       Printer: this._oAppModel.getProperty("/Printer")
		   });		    
		}.bind(this)
	    });
	    oScanButton._onPress();	    
	},

	/**
	 * 
	 */
	pressSaveButton : function(oEvent) {	    
	    
	    var aItems = [
		this.getView().byId("idLocation"),
		this.getView().byId("idNotification"), this.getView().byId("idSapClientComboBox"),
		    
	    ];

	    if (!Helper.isInputValid(null, aItems)) {
		sap.m.MessageToast.show(this._oBundle.getText("General.InputNotComplete"), {
		    at : "center center"
		});
		return;
	    }	    

	    if (this._oAppModel) {

		if (this._oAppModel.getProperty("/Employee/Name")) {
			this._oAppModel.setProperty("/SaveButtonEnabled", false);
		    this._createRoughGR();
		}
		else {
		    MessageToast.show(this._oBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
			at : "center center"
		    });
		}
	    }

	},

	pressAbortButton : function(oEvent) {
	    this._clearFormularData(true);
	},

	onPressObjectAttributeBenutzer : function(oEvent) {
	    this._showUserInputDialog();
	},

	onSelectingNotification : function(oEvent) {
	    var oSelectedItem = oEvent.getParameter("selectedItem");
	    var isSelected = oEvent.getParameter("selected");
	    
	    if( oSelectedItem && oSelectedItem.getKey() == "WA"){
	    	
	    	var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			Helper.getReasonListDialog({
				bundle: oBundle,
				selectedKey: this.getView().getModel("app").getProperty("/WrongAvis/Reason/key"),
				initValue: this.getView().getModel("app").getProperty("/WrongAvis/Reason/Other"),
				field: "04", // Feld: "Aviesierungstratus", Siehe Definition Gründe: ZPHA_GR_REASONS
				title: oBundle.getText("ReasonDialog.Title"),
				model: this.getView().getModel("erp"),
				fnConfirm: function(oData) {
					this.getView().getModel("app").setProperty("/WrongAvis/Reason/key", oData.reason);
					this.getView().getModel("app").setProperty("/WrongAvis/Reason/other", oData.text);
				}.bind(this)
			}).open();
	    }	    
	},

	_clearFormularData : function(bFull) {

	    var oNotificationComboBox = this.getView().byId("idNotification");
	    if (oNotificationComboBox) {
		oNotificationComboBox.setSelectedItem(null);
		oNotificationComboBox.setValueState(sap.ui.core.ValueState.None);
	    }

	    var oSapClientComboBox = this.getView().byId("idSapClientComboBox");
	    if (oSapClientComboBox) {
		oSapClientComboBox.setSelectedItem(null);
		oSapClientComboBox.setValueState(sap.ui.core.ValueState.None);
	    }

	    // this._oAppModel.setProperty("/ExtNumber", "");
	    this._oAppModel.setProperty("/POList", []);
	    this._oAppModel.setProperty("/CreateDummyCheck", false);

	    if (bFull) {
			var oLocationComboBox = this.getView().byId("idLocation");
			if (oLocationComboBox) {
			    oLocationComboBox.setSelectedItem(null);
			    oLocationComboBox.setValueState(sap.ui.core.ValueState.None);
			}
	
			this._oAppModel.setProperty("/Employee/Name", "");		
	
			var that = this;
			sap.ndc.BarcodeScanner.scan(function(sResult) {
			    that._readEmployee(sResult.text);
			});
	    }

	},

	_createRoughGR : function(oEvent) {

	    var bError = false;
	    var sLocation, sNotification, sSapClient;

	    var oLocationComboBox = this.getView().byId("idLocation");
	    if (oLocationComboBox.getSelectedItem()) {
		// oLocationComboBox.setValueState(sap.ui.core.ValueState.Success);
		sLocation = oLocationComboBox.getSelectedItem().getProperty("key");
		this._oAppModel.setProperty("/Location", sLocation);
	    }
	    else {
		oLocationComboBox.setValueState(sap.ui.core.ValueState.Error);
		bError = true;
		// return;
	    }

	    var oSapClientComboBox = this.getView().byId("idSapClientComboBox");
	    if (oSapClientComboBox.getSelectedItem()) {
		// oSapClientComboBox.setValueState(sap.ui.core.ValueState.Success);
		sSapClient = oSapClientComboBox.getSelectedItem().getProperty("key");
	    }
	    else {
		oSapClientComboBox.setValueState(sap.ui.core.ValueState.Error);
		bError = true;
		// return;
	    }

	    var oNotificationComboBox = this.getView().byId("idNotification");
	    if (oNotificationComboBox.getSelectedItem()) {
		// oNotificationComboBox.setValueState(sap.ui.core.ValueState.Success);
		sNotification = oNotificationComboBox.getSelectedItem().getProperty("key");
	    }
	    else {
		oNotificationComboBox.setValueState(sap.ui.core.ValueState.Error);
		bError = true;
		// return;
	    }
	    
	    if (bError){
		return;
	    }

	    var sReadUrl = "/RoughGRSet";
	    var oRoughGR = {};

	    oRoughGR.Zbetrst = sLocation;
	    oRoughGR.AdvStatus = sNotification;
	    oRoughGR.AdvReason = this._oAppModel.getProperty("/WrongAvis/Reason/key");
	    oRoughGR.AdvReasonText = this._oAppModel.getProperty("/WrongAvis/Reason/other");
	    oRoughGR.Mandt = sSapClient;
	    oRoughGR.Name = this._oAppModel.getProperty("/Employee/Name");
	    oRoughGR.Userid = this._oAppModel.getProperty("/Employee/User");

	    var aPOList = this._oAppModel.getProperty("/POList");
	    if (aPOList.length > 0) {
		
		var aRoughGRDoc = [];
		var iIndex = 0;
		for( iIndex in aPOList){		
		    var oRoughGRDoc = {};
		    var oPO = aPOList[iIndex];
		    oRoughGRDoc.Doctype = "EX";
		    oRoughGRDoc.ZgweDocno = oPO.PONumber;
		    aRoughGRDoc.push(oRoughGRDoc);
		}

		oRoughGR.RoughGRDocSet = aRoughGRDoc;
	    }

	    var that = this;
	    this._oERPModel.create(sReadUrl, oRoughGR, {
		success : function(oData, oResponse) {

		    var sMsg = this._oBundle.getText("Message.RoughGRCreateSuccessfull", [
			oData.Zgweno
		    ]);
	
		    if(this._oAppModel.getProperty("/CreateDummyCheck")){
		    	this._createCheck({
		    		Zgweno: oData.Zgweno,
		    		NameIntern: oData.Name,
		    		Client: oData.Mandt,
		    		State: "20",
		    		onSuccess: function(oData){ 		    			
		    			MessageToast.show(this._oBundle.getText("Message.DummyCheckCreateSuccessfull", [oData.CmrRef]),{
		    				at: "center top", 
		    			}); 
		    		}.bind(this)
		    	});
		    }
		    
		    this.printRoughGR({
			RoughGR: oData.Zgweno,
			Printer: this._oAppModel.getProperty("/Printer")
		    });	
		  		    
		    var oDialog = new Dialog({			
			title: 'Confirm',
			type: 'Message',
			content: new Text({ text: sMsg }), 
			beginButton: new Button({
			    text: this._oBundle.getText("Message.Ok"),
			    press: function () {
			    	this._oAppModel.setProperty("/SaveButtonEnabled", true);
			    	oDialog.close();
			    	this._clearFormularData();
			    }.bind(this)
			}),
			endButton: new Button({
			    text: this._oBundle.getText("Message.Reprint"),
			    press: function () {
				 this.printRoughGR({
				       RoughGR: oData.Zgweno,
				       Printer: this._oAppModel.getProperty("/Printer")
				   });	
				 // oDialog.close();
			    }.bind(this)
			}),
			afterClose: function() {
			    oDialog.destroy();
			}
		    });

		    oDialog.open();
		}.bind(this),		
		error : function(oError) {
		    MessageToast.show(Helper.getErrorValue(oError));
		}
	    });

	},
	
	_createCheck : function(oContext) {
	    	      
	    var oCheck = { 
	    		Zgweno: oContext.Zgweno,
	    		NameIntern: oContext.NameIntern,
	    		Client: oContext.Client,
	    		State: oContext.State
	    	};
	    this._oERPModel.create("/CheckSet", oCheck, {
	    	success : function(oData, oResponse) {		   
	    		oContext.onSuccess(oData);
	    	},
	    	error : function(oError) {
	    		sap.m.MessageToast.show(Helper.getErrorValue(oError));
	    	}
	    });    

	},

	/**
	 * 
	 */
	_showUserInputDialog : function() {

	    var that = this;

	    var oTextArea = new TextArea('userDialogTextarea', {
		width : '100%',
		placeholder : 'Benuter eingeben'
	    });

	    var sInput = this._oAppModel.getProperty("/User");
	    if (sInput && !sInput.includes("?")) {
		oTextArea.setValue(this._oAppModel.getProperty("/RACF"));
	    }

	    var oBeginButton = new Button({
		text : 'Bestätigen',
		press : function(oEvent) {

		    sInput = sap.ui.getCore().byId('userDialogTextarea').getValue();
		    sInput = sInput.split("\n")[0];

		    var sReadUrl = "/UserSet('" + sInput + "')";

		    that._oERPModel.read(sReadUrl, {
			success : function(oData, oResponse) {
			    oLocalModel.setProperty("/User", oData.Address.Lastname + ", " + oData.Address.Firstname);
			    oLocalModel.setProperty("/RACF", sInput);
			    oLocalModel.setProperty("/Signature/NameIntern", that._oAppModel.getProperty("/User"));
			    // MessageToast.show(Helper.getErrorValue(oError));
			    oDialog.close();

			},
			error : function(oError) {
			    MessageToast.show(Helper.getErrorValue(oError), {
				at : "center center"
			    });
			}
		    });

		}
	    });

	    var oEndButton = new Button({
		text : 'Cancel',
		press : function() {
		    oDialog.close();
		}
	    });

	    var oDialog = new Dialog({
		title : 'User-Eingabe',
		type : 'Message',
		content : [
		    oTextArea
		],
		beginButton : oBeginButton,
		endButton : oEndButton,
		afterClose : function() {
		    oDialog.destroy();
		}
	    });

	    this.getView().addDependent(oDialog);

	    oDialog.open();
	},

	onMessagePopoverPress : function(oEvent) {
	    this._getMessagePopover().openBy(oEvent.getSource());
	},

	_getMessagePopover : function() {
	    // create popover lazily (singleton)
	    if (!this._oMessagePopover) {
		this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),
			"de.arvato.GRModul05.fragment.MessagePopover", this);
		this.getView().addDependent(this._oMessagePopover);
	    }
	    return this._oMessagePopover;
	},

	setDefaultDate : function(o) {
	    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		pattern : "yyyy-MM-dd"
	    });
	    var date = new Date();
	    return dateFormat.format(date);
	},

	onClientSelectionChange : function(oEvent) {
	    var oItem = oEvent.getParameter("selectedItem");
	    this._oAppModel.setProperty("/RoughGoodsReceipt/Client", oItem.getKey());
	}

    });
});

function DealsAssistant(divisionId, divisionName) {
    this.divisionId = divisionId;
    this.divisionName = divisionName;
    
    /* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DealsAssistant.prototype.setup = function() {
    // ========
    // = Srim =
    // ========
    this.mySpinner = this.controller.get("mySpinner");
    this.controller.setupWidget("mySpinner", {'spinnerSize':Mojo.Widget.spinnerLarge},this.spinnerModel={'spinning':true});
    this.scrim = Mojo.View.createScrim(this.controller.document, {scrimClass:'palm-scrim'});
    this.scrim.hide();
    this.controller.get("myScrim").appendChild(this.scrim).appendChild(this.controller.get(this.mySpinner));
    
    
    
    // Main menu, attributes and model found in stage-assistant.js
    this.controller.setupWidget(Mojo.Menu.appMenu, this.controller.stageController.assistant.grpnMenuAttributes, this.controller.stageController.assistant.grpnMenuModel);

    
    this.controller.setupWidget(Mojo.Menu.viewMenu, {}, this.viewMenuModel = {
        visible: true,
        items: [
            {
                items: [
                    { icon: 'cityListIcon', command: 'cityList', label: '', width: 60 },
                    { label: "", width: this.controller.stageController.assistant.getDimensions().width-120 },
                    // TODO: Need an icon for the city listing option
                    { icon: 'forward', command: 'cmd-favs', label: "", width: 60}
                ]
            }
        ]
    });
    
    this.dealListModel = {
        items: []
    };   
    this.controller.setupWidget("dealList", this.attributes = {
        itemTemplate: 'deals/templates/dealListRowTemplate',
        swipeToDelete: false,
        renderLimit: 40,
        reorderable: false
    }, 
    this.dealListModel);
    
    this.dealListTapHandler = this.selectDeal.bindAsEventListener(this);
    this.controller.listen("dealList", Mojo.Event.listTap, this.dealListTapHandler);
    
    this.scrim.show();
    this.refreshList();
};

DealsAssistant.prototype.orientationChanged = function(orientation) {
    // On orientation change we have to resize some of the elements on the screen
    
    // Update the width of the main label on the top menu to fit the full width
    this.viewMenuModel.items[0].items[0].width = this.controller.stageController.assistant.getDimensions().width-120;
    this.controller.modelChanged(this.viewMenuModel);
    
};

DealsAssistant.prototype.handleCommand = function(event) {
    if(event.type === Mojo.Event.command) {
        switch(event.command) {
            case 'cityList':
                Mojo.Controller.stageController.popScenesTo();
                Mojo.Controller.stageController.swapScene("cities");
                break;
            default:
                break;
        }
    }
};

DealsAssistant.prototype.selectDeal = function(event) {
    Mojo.Controller.stageController.popScenesTo();
    Mojo.Controller.stageController.swapScene("dealDetails", event.item.id);
};

DealsAssistant.prototype.refreshList = function() {
    // Refresh the list 
    var that = this;
  
    var request = new Ajax.Request("http://api.groupon.com/v2/deals.json", {
        method: "get",
        parameters: {
            client_id: Mojo.appInfo.client_id,
            division_id: this.divisionId
        },
        onComplete: function(response) {
            that.scrim.hide();
        
            // Update the title
            that.viewMenuModel.items[0].items[0].label = "Deals for " + that.divisionName;
            that.controller.modelChanged(that.viewMenuModel);
          
            // Update the list
            that.dealListModel.items = response.responseJSON.deals;
            that.controller.modelChanged(that.dealListModel);  
        },
        onFailure: function() {
	        // Display a API connection error dialog
	        that.controller.stageController.assistant.showAPIErrorDialog();
        }
    });
 };

DealsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

DealsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DealsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

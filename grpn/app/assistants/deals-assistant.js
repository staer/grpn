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

DealsAssistant.prototype.selectDeal = function(event) {
    Mojo.Controller.stageController.pushScene("dealDetails", event.item.id);
};

DealsAssistant.prototype.refreshList = function() {
  // Refresh the list 
  var that = this;
  
  var request = new Ajax.Request("http://api.groupon.com/v2/deals.json", {
      method: "get",
      parameters: {
          client_id: "afee02ef734231d1ddfe2a9594956eeb2e702b9f",
          division_id: this.divisionId
      },
      onComplete: function(response) {
          that.scrim.hide();
          that.controller.get("cityName").innerHTML = "Deals for " + that.divisionName;
          that.dealListModel.items = response.responseJSON.deals;
          that.controller.modelChanged(that.dealListModel);
          
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

function DealsAssistant(divisionId) {
    this.divisionId = divisionId;
    
    Mojo.Log.info("Processing divison:", divisionId);
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DealsAssistant.prototype.setup = function() {
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
    
    
    this.refreshList();
};

DealsAssistant.prototype.selectDeal = function(event) {
    Mojo.Log.info("Deal ID: ", event.item.id);
};

DealsAssistant.prototype.refreshList = function() {
  // Refresh the list 
  var that = this;
  
  Mojo.Log.info("running request...", this.divisionId);
  var request = new Ajax.Request("http://api.groupon.com/v2/deals.json", {
      method: "get",
      parameters: {
          client_id: "afee02ef734231d1ddfe2a9594956eeb2e702b9f",
          division_id: this.divisionId
      },
      onComplete: function(response) {
          that.dealListModel.items = response.responseJSON.deals;
          that.controller.modelChanged(that.dealListModel);
          //Mojo.Log.info("complete!");
          Mojo.Log.info(JSON.stringify(response.responseJSON));
          //Mojo.Log.info("Deals #: ", response.responseJSON.deals.length);
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

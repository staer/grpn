function CitiesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

CitiesAssistant.prototype.setup = function() {
    
    // Main menu, attributes and model found in stage-assistant.js
    this.controller.setupWidget(Mojo.Menu.appMenu, grpnMenuAttributes, grpnMenuModel);
    
    this.cityListModel = {
        items: []
    };   
    this.controller.setupWidget("cityList", this.attributes = {
        itemTemplate: 'cities/templates/cityListRowTemplate',
        swipeToDelete: false,
        renderLimit: 40,
        reorderable: false,
        dividerFunction: function(model) {
            return model.name.toString()[0];
        },
        filterFunction: this.searchCities.bind(this)
    }, this.cityListModel);
    
    
    // Bind the showDeals() method to the tap event of a list item
    this.cityListTapHandler = this.selectCity.bindAsEventListener(this);
    this.controller.listen("cityList", Mojo.Event.listTap, this.cityListTapHandler);
    
    
    // Setup the scrim
    this.mySpinner = this.controller.get("mySpinner");
    this.controller.setupWidget("mySpinner", {'spinnerSize':Mojo.Widget.spinnerLarge},this.spinnerModel={'spinning':true});
    this.scrim = Mojo.View.createScrim(this.controller.document, {scrimClass:'palm-scrim'});
    this.scrim.hide();
    this.controller.get("myScrim").appendChild(this.scrim).appendChild(this.controller.get(this.mySpinner));
    
    this.scrim.show();
    // Refresh the list of cities available with Groupon
	this.refreshList();
};

CitiesAssistant.prototype.searchCities = function(filterString, listWidget, offset, count) {
    var subset = [];
    var lowerFilter, i;
    
    if(filterString) {
        // Hide the spacer div since we are pushing down the list with the search
        // box
        this.controller.get("headerSpacer").hide();
        lowerFilter = filterString.toLowerCase();
        for(i = 0; i < this.cityListModel.items.length; i++) {
            if(this.cityListModel.items[i].name.toLowerCase().include(lowerFilter)) {
                subset[subset.length] = this.cityListModel.items[i];
            }
        }
    } else {
        // Make sure to show the spacer div so that we don't overlap the list
        // with the header
        this.controller.get("headerSpacer").show();
        subset = this.cityListModel.items;
    }
    
    listWidget.mojo.setLength(subset.length);   
    listWidget.mojo.setCount(subset.length);    // Sets the count in the search bubble
    listWidget.mojo.noticeUpdatedItems(0, subset);    
};

// Transition to the show deals scene for the selected City
CitiesAssistant.prototype.selectCity = function(event) {
    
    var db = new Mojo.Depot({name: 'com.staeronline.grpn'}, function(){
        db.add('defaultCity', {
          id: event.item.id,
          name: event.item.name
        }, function() {
            // On Success
        }, function() {
            // On failure
        });
    });
    Mojo.Controller.stageController.popScenesTo();
    Mojo.Controller.stageController.swapScene("deals", event.item.id, event.item.name);
};

CitiesAssistant.prototype.refreshList = function() {
    var that = this;
    
    var request = new Ajax.Request("http://api.groupon.com/v2/divisions.json", {
        method: "get",
        parameters: {
            client_id: Mojo.appInfo.client_id
        },
        onComplete: function(response) {
            that.scrim.hide();
            that.cityListModel.items = response.responseJSON.divisions;
            that.controller.modelChanged(that.cityListModel);
            
	    } 
	});
};


CitiesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   
};

CitiesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CitiesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

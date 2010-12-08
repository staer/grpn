function DealsAssistant(divisionId, divisionName) {
    this.divisionId = divisionId;
    this.divisionName = divisionName;
    
    /* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DealsAssistant.prototype.setup = function() {
    var that = this;
    
    // Save this deal list as the most recent city visited
    var db = new Mojo.Depot({name: Mojo.appInfo.depot_name}, function(){
        db.add('defaultCity', {
          id: that.divisionId,
          name: that.divisionName
        }, function() {
            // On Success we don't have any special logic
        }, function() {
            // On failure we don't particularly care, the user will just be
            // brought back to the city selection screen on startup instead
            // of going to the most recently viewed city.
        });
    });
    
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
                    { icon: 'cityListIcon', command: 'cmd-cityList', label: '', width: 60 },
                    { label: "", width: this.controller.stageController.assistant.getDimensions().width-120 },
                    // TODO: Need an icon for the city listing option
                    { icon: 'favoriteIcon', command: 'cmd-favorites', label: "", width: 60}
                ]
            }
        ]
    });
    
    /* Check to see if this city is on the favorites list */
    var fav = {
        name: this.divisionName,
        id: this.divisionId
    };
    var isFav = this.controller.stageController.assistant.isFavorite(fav) !== -1;
    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel = {
        visible: true,
        items: [
            {icon: 'refresh', label: '', command: 'cmd-refresh'},
            {icon: (isFav ? 'starOnIcon' : 'starOffIcon'), label: '', command: 'cmd-toggleFavorite'}
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
    this.viewMenuModel.items[0].items[1].width = this.controller.stageController.assistant.getDimensions().width-120;
    this.controller.modelChanged(this.viewMenuModel);
    
};

DealsAssistant.prototype.handleCommand = function(event) {
    var favIcon = this.controller.select('.favoriteIcon')[0];
    
    
    if(event.type === Mojo.Event.command) {
        switch(event.command) {
            case 'cmd-cityList':
                //Mojo.Controller.stageController.popScenesTo();
                Mojo.Controller.stageController.pushScene("cities");
                break;
            case 'cmd-favorites':
                this.controller.stageController.assistant.showFavoritesList();
                break;
            case 'cmd-refresh':
                this.scrim.show();
                this.refreshList();
                break;
            case 'cmd-toggleFavorite':
                var fav = {
                    name: this.divisionName,
                    id: this.divisionId
                };
                if(this.controller.stageController.assistant.isFavorite(fav)!==-1) {
                    this.controller.stageController.assistant.removeFavorite(fav);
                    this.cmdMenuModel.items[1].icon = 'starOffIcon';
                    this.controller.showAlertDialog({
                        onChoose: function(){},
                        title: 'Favorite Removed',
                        message: "<div style='text-align:center'>'" + fav.name + "' removed from favorites.<br/><br/>Tap again to toggle favorite status.</div>",
                        allowHTMLMessage: true,
                        choices: [
                            {label: "Ok", value:""}
                        ]
                    });
                    
                } else {
                    this.controller.stageController.assistant.addFavorite(fav);
                    this.cmdMenuModel.items[1].icon = 'starOnIcon';
                    this.controller.showAlertDialog({
                        onChoose: function(){},
                        title: 'Favorite Added',
                        message: "<div style='text-align:center'>'" + fav.name + "' added to favorites.<br/><br/>Tap again to toggle favorite status.</div>",
                        allowHTMLMessage: true,
                        choices: [
                            {label: "Ok", value:""}
                        ]
                    });
                }
                this.controller.stageController.assistant.saveFavorites();
                this.controller.modelChanged(this.cmdMenuModel);
                break;
            default:
                break;
        }
    }
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
            client_id: Mojo.appInfo.client_id,
            division_id: this.divisionId
        },
        onComplete: function(response) {
            that.scrim.hide();
        
            // Update the title
            that.viewMenuModel.items[0].items[1].label = that.divisionName;
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

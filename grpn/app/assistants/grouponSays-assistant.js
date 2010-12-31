function GrouponSaysAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

GrouponSaysAssistant.prototype.setup = function() {
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

    this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel = {
        visible: true,
        items: [
            {icon: 'refresh', label: '', command: 'cmd-refresh'}
        ]
    });
    
    this.scrim.show();
    this.refresh();
};

GrouponSaysAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

GrouponSaysAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

GrouponSaysAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

GrouponSaysAssistant.prototype.handleCommand = function(event) {
    if(event.type==Mojo.Event.command) {
        switch(event.command) {
            case 'cmd-refresh':
                this.scrim.show();
                this.refresh();
                break;
            default: break;
        }
    }
};

GrouponSaysAssistant.prototype.refresh = function() {
    var that = this;
  
    var request = new Ajax.Request("http://api.groupon.com/v2/groupon_says.json", {
        method: "get",
        parameters: {
            client_id: Mojo.appInfo.client_id,
            limit: 1,
            random: "true"
        },
        onComplete: function(response) {
            that.scrim.hide();
            that.controller.get("grouponSaysTitle").innerHTML = response.responseJSON.grouponSayings[0].title;
            that.controller.get("grouponSays").innerHTML = response.responseJSON.grouponSayings[0].websiteContentHtml; 
        },
        onFailure: function() {
	        // Display a API connection error dialog
	        that.controller.stageController.assistant.showAPIErrorDialog();
        }
    });
};

function DiscussionAssistant(deal) {
    this.deal = deal;
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

DiscussionAssistant.prototype.setup = function() {
    // Main menu, attributes and model found in stage-assistant.js
    this.controller.setupWidget(Mojo.Menu.appMenu, this.controller.stageController.assistant.grpnMenuAttributes, this.controller.stageController.assistant.grpnMenuModel);
    
    // ========
    // = Srim =
    // ========
    this.mySpinner = this.controller.get("mySpinner");
    this.controller.setupWidget("mySpinner", {'spinnerSize':Mojo.Widget.spinnerLarge},this.spinnerModel={'spinning':true});
    this.scrim = Mojo.View.createScrim(this.controller.document, {scrimClass:'palm-scrim'});
    this.scrim.hide();
    this.controller.get("myScrim").appendChild(this.scrim).appendChild(this.controller.get(this.mySpinner));
    
    this.controller.get("dealTitle").innerHTML = this.deal.title;
    
    this.discussionListModel = {
        disabled: true,     // disable the list so that tapping doesn't do anything
        items: []
    };   
    this.controller.setupWidget("discussionList", this.attributes = {
        itemTemplate: 'discussion/templates/discussionListRowTemplate',
        emptyTemplate: 'discussion/templates/discussionListEmptyTemplate',
        swipeToDelete: false,
        renderLimit: 40,
        reorderable: false
    }, 
    this.discussionListModel);
    
    this.refreshDiscussions();
};

DiscussionAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

DiscussionAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DiscussionAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

DiscussionAssistant.prototype.populateDiscussion = function(posts) {
    
    // process the posting time on each post
    var MINUTE = 1000*60;
    var HOUR = MINUTE*60;
    var DAY = 24 * HOUR;
    var today = new Date();
    for(var i=0; i < posts.length; i++) {
        var commentDate = Date.strptime(posts[i].createdAt, "%Y-%m-%dT%H:%M:%SZ", true);

        var diff = today-commentDate;

        var days = Math.floor(diff / DAY);
        var hours = Math.floor((diff - (days * DAY)) / HOUR);
        var minutes = Math.floor((diff - (days * DAY) - (hours * HOUR)) / MINUTE);
        var txt = "";

        if(days > 0) {
            txt = "<br/>" + days + " days, ";
        }
         txt += hours + " hours and " + minutes + " minutes ago";
         posts[i].timeSincePosting = txt;
    }
    this.discussionListModel.items = posts;
    this.controller.modelChanged(this.discussionListModel);
    this.controller.get("discussionList").mojo.setLength(posts.length);
};

DiscussionAssistant.prototype.refreshDiscussions = function() {
    this.scrim.show();
    var that = this;
    var dealURL = "http://api.groupon.com/v2/deals/" + this.deal.id + "/posts.json";
    
    
    var request = new Ajax.Request(dealURL, {
       method: "get",
       parameters: {
           client_id: Mojo.appInfo.client_id
       },
       onComplete: function(response) {
           that.scrim.hide();
           that.populateDiscussion(response.responseJSON.posts);
       },
       onFailure: function() {
	        // Display a API connection error dialog
	        that.controller.stageController.assistant.showAPIErrorDialog();
	    }
    });
};

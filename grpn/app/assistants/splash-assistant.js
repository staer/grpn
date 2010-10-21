function SplashAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

SplashAssistant.prototype.setup = function() {
    // Set the wrapper table to the full device height so we can vertically center
    // the splash image
	this.controller.get("wrapper").setStyle({height: this.controller.stageController.assistant.getDimensions().height + "px"});

    // Set up a short timer to hide the splash and either go to:
    //    a.) The city selection (if no default is set)
    //    b.) The deals list (if a default is set)
    
    // TODO: Handle errors with DB opening and key retrival
    setTimeout(function() {
        var db = new Mojo.Depot({name: Mojo.appInfo.depot_name}, function(){
            db.get('defaultCity', function(city){
                if(city===null) {
                    Mojo.Controller.stageController.swapScene({
                        transition: Mojo.Transition.crossFade,
                        name: "cities"
                    });
                    
                } else {
                    Mojo.Controller.stageController.swapScene({
                        transition: Mojo.Transition.crossFade,
                        name: "deals"
                    }, city.id, city.name);
                    
                }
            }); 
        });
    }, 2000);

};

SplashAssistant.prototype.orientationChanged = function(orientation) {
    this.controller.get("wrapper").setStyle({ height: this.controller.stageController.assistant.getDimensions().height + "px" });
};

SplashAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

SplashAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SplashAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

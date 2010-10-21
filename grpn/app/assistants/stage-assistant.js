function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    var that = this;
    
    if (this.controller.setWindowOrientation) {
        this.controller.setWindowOrientation("free");
    }
    
    this.grpnMenuAttributes = { omitDefaultItems: true };
    this.grpnMenuModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem,
            {label: "About", command: 'do-aboutGrpn'},
            //Mojo.Menu.prefsItem,
            Mojo.Menu.helpItem
        ]
    };
    
    // Load the favoritesList from the Depot object into memory, will save
    // it again on app close.
    var db = new Mojo.Depot({name: Mojo.appInfo.depot_name}, function() {
        db.get('favoritesList', function(list) {
            if(list===null) {
                list = [];
            }
            that.favoritesList = list;
            that.controller.pushScene("splash");
        }, function() {
            that.controller.pushScene("splash");
        });
    });
};

StageAssistant.prototype.handleCommand = function(event) {
    var aboutMessage = Mojo.View.render({
       object: {},
       template: 'templates/about' 
    });
    
    var currentScene = this.controller.activeScene();
    
    switch(event.type) {
        case Mojo.Event.commandEnable:
            switch(event.command) {
                case Mojo.Menu.helpCmd:
                    event.stopPropagation();
                    break;
                default:
                    break;
            }
            break;
        case Mojo.Event.command:
            switch(event.command) {
                case 'do-aboutGrpn':
                    currentScene.showAlertDialog({
                        onChoose: function(value) {},
                        title: Mojo.appInfo.title + " - v" + Mojo.appInfo.version,
                        message: aboutMessage,
                        choices:[
                            {label: "OK", value:""}
                        ],
                        allowHTMLMessage: true
                    });
                    break;  
                case Mojo.Menu.helpCmd:
                    this.controller.pushAppSupportInfoScene();
                    break;
                 default: break;
            }
            break;
        default:
            break;
    }
};

StageAssistant.prototype.showAPIErrorDialog = function() {
    var currentScene = this.controller.activeScene();
    currentScene.showAlertDialog({
        onChoose: function(value) {},
        title: "Error",
        message: "There was an error communicating with the Groupon&trade; API. Please check your connection,  wait a a short time since Groupon&trade; may be having problems and then try again. If the problem persists please contact the developer.",
        choices: [
            {label: "OK", value:""}
        ],
        allowHTMLMessage: true
    });
};

// Get the stage dimenations based on the current device orientation
StageAssistant.prototype.getDimensions = function() {
    var width = Mojo.Environment.DeviceInfo.screenWidth;
    var height = Mojo.Environment.DeviceInfo.screenHeight;
    
    switch(this.controller.getWindowOrientation()) {
        case 'left':
        case 'right':
            height = Mojo.Environment.DeviceInfo.screenWidth;
            width = Mojo.Environment.DeviceInfo.screenHeight;
            break;
        default:
            break;
    }
    
    return {
        width: width,
        height: height
    };
};

// ===========================
// = Favorites Handling Code =
// ===========================
// NOTE: This can probably be moved to it's own module instead of residing in
// the stage controller

// Pop up a favorites list near the favorites list button
StageAssistant.prototype.showFavoritesList = function() {
    var sceneController = this.controller.activeScene();
    var favIcon = sceneController.select('.favoriteIcon')[0];
    var that = this;
    
    var items = [];
    for(var i=0; i< this.favoritesList.length; i++) {
        items[i] = { label: this.favoritesList[i].name, command: this.favoritesList[i].id };
    }
    
    // Sort the menu alphabetically
    items.sort(function(a,b) {
        if(a.label.toLowerCase() < b.label.toLowerCase()) {
            return -1;
        } else if (b.label.toLowerCase() < a.label.toLowerCase()) {
            return 1;
        }
        return 0;    
    });
    
    // Open the popup menu with the favs!
    sceneController.popupSubmenu({
        onChoose: function(value) {
            // Value is the command, i.e. the favorite ID
            var fav = that.getFavoriteById(value);
            if(fav!==null) {
                Mojo.Controller.stageController.popScenesTo();
                Mojo.Controller.stageController.swapScene({
                    transition: Mojo.Transition.crossFade,
                    name: "deals"
                }, fav.id, fav.name);
                
            }
        },
        placeNear: favIcon,
        items: items
    });
    
    return;
};

// Save all the favorites back to a Depot store
StageAssistant.prototype.saveFavorites = function() {
    var that = this;
    var done = false;
    var db = new Mojo.Depot({name: Mojo.appInfo.depot_name}, function() {
        db.add('favoritesList', that.favoritesList, function(){/* Success */}, function(){ /* Error */});
    }, function() { /* Error */});
};

// Check to see if a 'fav' is in the favoritesList
// Returns the index (> 0) if it is found, -1 if it is not
StageAssistant.prototype.isFavorite = function(fav) {
    var i;
    for(i = 0; i < this.favoritesList.length; i++) {
        if(this.favoritesList[i].name===fav.name && this.favoritesList[i].id===fav.id) {
            return i;
        }
    }
    return -1;
};

// If the 'fav' is in the list, it will be spliced away
StageAssistant.prototype.removeFavorite = function(fav) {
    var i = this.isFavorite(fav);
    if(i!==-1) {
        this.favoritesList.splice(i, 1);
    }
};

// If the 'fav' is not in the list, it will be appended
StageAssistant.prototype.addFavorite = function(fav) {
    if(this.isFavorite(fav)===-1) {
        this.favoritesList[this.favoritesList.length] = fav;        
    }
};

// Gets a favorite out of the list by it's ID, or null
StageAssistant.prototype.getFavoriteById = function(id) {
    for(var i=0; i<this.favoritesList.length; i++) {
        if(this.favoritesList[i].id===id) {
            return this.favoritesList[i];
        }
    }
    return null;
};

function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    if (this.controller.setWindowOrientation) {
        this.controller.setWindowOrientation("free");
    }
    
    this.grpnMenuAttributes = { omitDefaultItems: true };
    this.grpnMenuModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem,
            {label: "About", command: 'do-aboutGrpn'},
            Mojo.Menu.prefsItem,
            Mojo.Menu.helpItem
        ]
    };
      
    this.controller.pushScene("splash");
};


StageAssistant.prototype.handleCommand = function(event) {
    var message = Mojo.View.render({
       object: {},
       template: 'templates/about' 
    });
    
    var currentScene = this.controller.activeScene();
    if(event.type === Mojo.Event.command) {
        switch(event.command) {
            case 'do-aboutGrpn':
                currentScene.showAlertDialog({
                    onChoose: function(value) {},
                    title: Mojo.appInfo.title + " - v" + Mojo.appInfo.version,
                    message: message,
                    choices:[
                        {label: "OK", value:""}
                    ],
                    allowHTMLMessage: true
                });
                break;
            default:
                break;
        }
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

function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
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

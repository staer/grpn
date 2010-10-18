// Declare a global GRPN namespace to hold a few globals that will be useful to have
var GRPN = {};
GRPN.client_id = "afee02ef734231d1ddfe2a9594956eeb2e702b9f";
GRPN.version = "1.0.0";

function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    
    grpnMenuAttributes = { omitDefaultItems: true };
    grpnMenuModel = {
        visible: true,
        items: [
            {label: "About grpn...", command: 'do-aboutGrpn'}
            //Mojo.Menu.editItem,
            //Mojo.Menu.prefsItem,
            //Mojo.Menu.helpItem
        ]
    };
      
    this.controller.pushScene("splash");
};


StageAssistant.prototype.handleCommand = function(event) {
    var message = "This application is open source and available on github at <a href='http://www.github.com/staer/grpn'>www.github.com/staer/grpn</a>. ";
    message += "<br/>Please feel free to post questions, comments, bugs, or feature requests on the issue tracker.";
    message += "<br/><br/>";
    message += "This application is powered by Groupon&trade;, visit their website at <a href='http://touch.groupon.com'>www.groupon.com</a> ";
    message += "for the full Groupon&trade; experience.";
    
    var currentScene = this.controller.activeScene();
    if(event.type === Mojo.Event.command) {
        switch(event.command) {
            case 'do-aboutGrpn':
                currentScene.showAlertDialog({
                    onChoose: function(value) {},
                    title: "grpn - " + GRPN.version.toString(),
                    message: message,
                    choices:[
                        {label: "OK", value:""}
                    ],
                    allowHTMLMessage: true
                });
                break;
        }
    }
};

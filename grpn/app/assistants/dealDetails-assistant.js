function DealDetailsAssistant(dealId) {
    this.dealId = dealId;
}

DealDetailsAssistant.prototype.setup = function() {
    
    // ========
    // = Srim =
    // ========
    this.mySpinner = this.controller.get("mySpinner");
    this.controller.setupWidget("mySpinner", {'spinnerSize':Mojo.Widget.spinnerLarge},this.spinnerModel={'spinning':true});
    this.scrim = Mojo.View.createScrim(this.controller.document, {scrimClass:'palm-scrim'});
    this.scrim.hide();
    this.controller.get("myScrim").appendChild(this.scrim).appendChild(this.controller.get(this.mySpinner));
    
    
    // =========================
    // = Setup all the widgets =
    // =========================
    this.controller.setupWidget("locationsScroller",
    {
        mode: 'horizontal-snap'
    }, this.locationsScrollerModel = {
        snapElements: {
            x: this.controller.select('.scrollerItem')
        }
    });
    
    this.controller.setupWidget(Mojo.Menu.viewMenu, {}, this.viewMenuModel = {
        visible: true,
        items: [
            {
                items: [
                    { icon: "dealListIcon", command: "dealList", label: ""},
                    { label: "", width: 200 },
                    // TODO: Need an icon for the city listing option
                    { icon: 'forward', command: 'cityList', label: ""}
                ]
            }
        ]
    });
    
    this.controller.setupWidget("viewMapButton", {
    },{
       label: "View Map",
       buttonClass: "affirmative"
    });
    
    this.controller.setupWidget("buyButton", {},{
       label: "Buy!",
       buttonClass: "affirmative" 
    });
    
    this.controller.setupWidget("descriptionDrawer", {
        unstyled: true
    }, this.descriptionDrawerModel = {
        open: false
    });
    
    this.controller.setupWidget("detailsDrawer", {
        unstyled: true
    }, this.detailsDrawerModel = {
       open: false 
    });
    
    this.controller.setupWidget("highlightsDrawer", {
        unstyled: true
    }, this.highlightsDrawerModel = {
       open: true 
    });
    
    this.controller.setupWidget("locationsDrawer", {
        unstyled: true
    }, this.locationsDrawerModel = {
       open: false 
    });
    
    
    
    // ================================
    // = Bind all the event listeners =
    // ================================
    this.buyButtonHandler = this.buy.bindAsEventListener(this);
    this.controller.listen("buyButton", Mojo.Event.tap, this.buyButtonHandler);
    
    this.viewMapHandler = this.viewMap.bindAsEventListener(this);
    this.controller.listen("viewMapButton", Mojo.Event.tap, this.viewMapHandler);
    
    this.descriptionArrowHandler = this.drawerToggleFactory(this.descriptionDrawerModel, "descriptionArrow").bindAsEventListener(this);
    this.controller.listen("descriptionArrow", Mojo.Event.tap, this.descriptionArrowHandler);
    
    this.detailsArrowHandler = this.drawerToggleFactory(this.detailsDrawerModel, "detailsArrow").bindAsEventListener(this);
    this.controller.listen("detailsArrow", Mojo.Event.tap, this.detailsArrowHandler);
    
    this.highlightsArrowHandler = this.drawerToggleFactory(this.highlightsDrawerModel, "highlightsArrow").bindAsEventListener(this);
    this.controller.listen("highlightsArrow", Mojo.Event.tap, this.highlightsArrowHandler);
    
    this.locationsArrowHandler = this.drawerToggleFactory(this.locationsDrawerModel, "locationsArrow").bindAsEventListener(this);
    this.controller.listen("locationsArrow", Mojo.Event.tap, this.locationsArrowHandler);
       
       
    this.scrim.show();
    this.refreshDeal();

};

DealDetailsAssistant.prototype.handleCommand = function(event) {
    if(event.type === Mojo.Event.command) {
        switch(event.command) {
            case 'dealList':
                Mojo.Controller.stageController.pushScene("deals", this.deal.division.id, this.deal.division.name);
                break;
            case 'cityList':
                Mojo.Controller.stageController.pushScene("cities");
                break;
            default:
                break;
        }
    }
};


// =======================================================================================
// = A generator functions which creates toggle functions for a clickable divider/drawer =
// =======================================================================================
DealDetailsAssistant.prototype.drawerToggleFactory = function(drawerModel, arrowId) {
    var that = this;
    return function(event) {
        drawerModel.open = !drawerModel.open;
        that.controller.modelChanged(drawerModel);
        
        var arrow = that.controller.get(arrowId);
        if(arrow.hasClassName('palm-arrow-closed')) {
            arrow.addClassName('palm-arrow-expanded');
            arrow.removeClassName('palm-arrow-closed');
        } else {
            arrow.addClassName('palm-arrow-closed');
            arrow.removeClassName('palm-arrow-expanded');
        }
    };
};

DealDetailsAssistant.prototype.buy = function(event) {
    var url = "https://www.groupon.com/deals/" + this.deal.id + "/confirmation";
    
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method: "launch",
        parameters: {
            id: "com.palm.app.browser",
            params: {
                target: url
            }
        }
    });
};

// ===================================================================
// = Launches the map application to view all locations for the deal =
// ===================================================================
DealDetailsAssistant.prototype.viewMap = function(event) {
    var scrollState = this.controller.get("locationsScroller").mojo.getState();
    var scrollSize = this.controller.get("locationsScroller").mojo.scrollerSize();
    
    // Use a "fudged" scroll width to allow for some error
    // Also the scroll state properties don't match what is expected
    // scroll size is 320, yet when on the 2nd snap item the state is -315 instead 
    // of -320. Very odd. By fuding it we can easily calculate the snap index
    // Note: Palm really needs to add a "getSnapIndex()" method to go along with
    // "setSnapIndex()"
    var scrollWidthFudged = Math.floor(scrollSize.width * 0.95);
    var snapIndex = Math.floor(Math.abs((scrollState.left/scrollWidthFudged)));
    
    // Helper function to get a property or return an empty string
    var getProperty = function(obj, prop) {
        return obj[prop] ? obj[prop] : '';
    };
    
    // Build an address query string for google maps
    var address = this.deal.redemptionLocations[snapIndex];
    var addressString = getProperty(address, 'streetAddress1');
    addressString += getProperty(address, 'streetAddress2') + ' ';
    addressString += getProperty(address, 'city') + ' ';
    addressString += getProperty(address, 'state') + ' ';
    addressString += getProperty(address, 'postalCode');
    
    this.controller.serviceRequest("palm://com.palm.applicationManager", {
        method:"launch",
        parameters: {
            id: "com.palm.app.maps",
            params: {
                query: addressString
            }
        }
    });
};

// ==================================================
// = Hit the Groupon API to update the deal details =
// ==================================================
DealDetailsAssistant.prototype.refreshDeal = function() {
    var that = this;
    var dealURL = "http://api.groupon.com/v2/deals/" + this.dealId + ".json";
    
    
    var request = new Ajax.Request(dealURL, {
       method: "get",
       parameters: {
           client_id: "afee02ef734231d1ddfe2a9594956eeb2e702b9f"
       },
       onComplete: function(response) {
           that.scrim.hide();
           that.deal = response.responseJSON.deal;
           that.populatePage(response.responseJSON.deal);
       } 
    });
};

// ===============================================
// = Render the details page given a deal object =
// ===============================================
DealDetailsAssistant.prototype.populatePage = function(deal) {
    var html = "";
    this.viewMenuModel.items[0].items[1].label = deal.division.name;
    this.controller.modelChanged(this.viewMenuModel);
    
    this.controller.get("dealTitle").innerHTML = deal.title;
    this.controller.get("dealImage").src = deal.largeImageUrl;
    this.controller.get("descriptionDrawerContent").innerHTML = deal.pitchHtml;
    this.controller.get("highlightsDrawerContent").innerHTML = deal.highlightsHtml;
    this.controller.get("priceAmount").innerHTML = deal.options[0].price.formattedAmount;
    this.controller.get("discountPercent").innerHTML = deal.options[0].discountPercent + "%";
    this.controller.get("valueAmount").innerHTML = deal.options[0].value.formattedAmount;
    this.controller.get("savingsAmount").innerHTML = deal.options[0].discount.formattedAmount;
    
    // For now we just use the first set of options, it is possible that
    // there are more than one, but not sure when (or what to do with them)
    if(deal.options.length >= 1) {
        if(deal.options[0].details.length > 1) {
            html = "<ul>";
            var i = 0;
            for(i=0;i<deal.options[0].details.length;i++) {
                html += "<li>" + deal.options[0].details[i].description + "</li>";
            }
            html += "</ul>";
        } else {
            html = deal.options[0].details[0].description;
        }

        this.controller.get("detailsDrawerContent").innerHTML = html;
    } else {
        this.controller.get("detailsDrawerContent").innerHTML = "None Available";
    } 
        
    // TODO: Use templates instead of manually building HTML
    // See: Mojo.View.render for template rendering    
        
    html = "";
    for(i = 0; i < deal.redemptionLocations.length;i++) 
    {   
        html += "<div class='scrollerItem'>";
        if(deal.merchant.websiteUrl) {
            html += "<a href='" + deal.merchant.websiteUrl + "'>";
        }
        html += deal.merchant.name? deal.merchant.name + "<br/>" : "";
        if(deal.merchant.websiteUrl) {
            html += "</a>";
        }
        html += deal.redemptionLocations[i].name ? deal.redemptionLocations[i].name + "<br/>" : "";
        html += deal.redemptionLocations[i].streetAddress1 ? deal.redemptionLocations[i].streetAddress1 + "<br/>" : "";
        html += deal.redemptionLocations[i].streetAddress2 ? deal.redemptionLocations[i].streetAddress2 + "<br/>" : "";
        html += deal.redemptionLocations[i].city ? deal.redemptionLocations[i].city + ", " : "";
        html += deal.redemptionLocations[i].state ? deal.redemptionLocations[i].state + ", " : "";
        html += deal.redemptionLocations[i].postalCode ? deal.redemptionLocations[i].postalCode + "<br/>" : "";
        
        // Add in the pager information if there are multiple locations with arrows
        // to cue the user that it scrolls left/right
        html += "<div style='text-align: center;'>";
        if(i>0) {
            html += "&larr; ";
        }
        html += (i+1).toString() + " of " + deal.redemptionLocations.length;
        if(i<deal.redemptionLocations.length-1) {
            html += "  &rarr;";
        }
        html += "</div>";
        html += "</div>";
    }
    this.controller.get("scrollerContainer").setStyle({width: 310*deal.redemptionLocations.length+"px"});
    this.controller.get("scrollerContainer").innerHTML = html;
    
    // Hide the "view map" button and add 
    if(deal.redemptionLocations.length===0) {
        this.controller.get("scrollerContainer").innerHTML = "<div class='scrollerItem'>Location Information Unavailable<br/></div>";
        this.controller.get("scrollerContainer").setStyle({width: 310*deal.redemptionLocations.length+"px"});
        this.controller.get("viewMapButton").hide();
    }
    
    
    this.locationsScrollerModel.snapElements.x = this.controller.select('.scrollerItem');
    this.controller.modelChanged(this.locationsScrollerModel);
    


};


DealDetailsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

DealDetailsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

DealDetailsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

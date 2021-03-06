function PopupLayerController() {
    var self = MapLayerController();

    self.z_index=7;

    var f = 2.3;

    self.openPopup = function(lat, lng, popupType, onCloseCallback) {
        var popup = null;
        switch (popupType){
            case MapPopupType.POPUP_SIMPLE:
                popup = ExternalSvgViewController("resource/view/map-popup-simple.svg");
                //popup.view.width = 16;
                //popup.view.height = 4;
                popup.view.width = 32*f;
                popup.view.height = 8*f;
                break;
            case MapPopupType.POPUP_WARNING:
                popup = ExternalSvgViewController("resource/view/map-popup-warning.svg");
                //popup.view.width = 16;
                //popup.view.height = 4;
                popup.view.width = 32*f;
                popup.view.height = 8*f;
                break;
            case MapPopupType.POPUP_CRIME:
                popup = ExternalSvgViewController("resource/view/map-popup-crime2.svg");
                //popup.view.width = 16;
                //popup.view.height = 4;
                popup.view.width = 32*f;
                popup.view.height = 8*f;
                break;
            case MapPopupType.POPUP_CRIME_DANGER:
                popup = ExternalSvgViewController("resource/view/map-popup-crime-danger.svg");
                //popup.view.width = 16;
                //popup.view.height = 4;
                popup.view.width = 32*f;
                popup.view.height = 8*f;
                break;
            case MapPopupType.POPUP_CRIME_WARNING:
                popup = ExternalSvgViewController("resource/view/map-popup-crime-warning.svg");
                //popup.view.width = 16;
                //popup.view.height = 4;
                popup.view.width = 32*f;
                popup.view.height = 8*f;
                break;
            case MapPopupType.POPUP_BUS:
                popup = ExternalSvgViewController("resource/view/map-popup-bus.svg");
                //popup.view.width = 16;
                //popup.view.height = 8;
                popup.view.width = 32*f;
                popup.view.height = 16*f;
                break;
            case MapPopupType.POPUP_TWITTER:
                popup = ExternalSvgViewController("resource/view/map-popup-twitter.svg");
                //popup.view.width = 16;
                //popup.view.height = 8;
                popup.view.width = 40*f;
                popup.view.height = 60*f;
                break;
            case MapPopupType.POPUP_INSPECTION:
                popup = ExternalSvgViewController("resource/view/map-popup-warning-inspection.svg");
                //popup.view.width = 16;
                //popup.view.height = 8;
                popup.view.width = 40*f;
                popup.view.height = 70*f;
                break;

            default :

        }

        popup.view.classed("popup-view-controller", true);

        popup.view.close.onClick(function(){
            popup.dispose();
            if(onCloseCallback){
                onCloseCallback();
            }
        });

        var position = self.project(lat, lng);
        popup.view.x = position.x;
        popup.view.y = position.y;
        self.view.append(popup);

        self.fixControllerSize(popup);

        return popup;

    } ;

    var init = function() {


    }();

    return self;
};


var MapPopupType = {
    POPUP_SIMPLE: "POPUP_SIMPLE",
    POPUP_BUS: "POPUP_BUS",
    POPUP_CRIME: "POPUP_CRIME",
    POPUP_WARNING: "POPUP_WARNING",
    POPUP_TWITTER: "POPUP_TWITTER",
    POPUP_CRIME_DANGER: "POPUP_CRIME_DANGER",
    POPUP_CRIME_WARNING: "POPUP_CRIME_WARNING",
    POPUP_INSPECTION: "POPUP_INSPECTION"
};

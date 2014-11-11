function PopupLayerController() {
    var self = MapLayerController();

    self.openPopup = function(lat, lng, popupType) {
        var popup = null;
        switch (popupType){
            case MapPopupType.POPUP_SIMPLE:
                popup = ExternalSvgViewController("resource/view/map-popup-simple.svg");
                popup.view.width = 16;
                popup.view.height = 4;
                break;
            default :

        }

        popup.view.classed("popup-view-controller", true);

        popup.view.close.onClick(function(){
            popup.dispose();
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
    POPUP_SIMPLE: "POPUP_SIMPLE"
};
/**
 * Class in charge to preload all the svg
 * used for the external svg view controller
 */
var ExternalSvgModel = function() {
    var self = {};
    self.svgsData = {};

    var externalSvgPaths = ["resource/view/notification-popup.svg",
                            "resource/view/map-popup-simple.svg",
                            "resource/sublayer/icon/divvy-station.svg",
                            "resource/sublayer/icon/bus.svg",
                            "resource/sublayer/icon/bus-no-number.svg",
                            "resource/view/button.svg",
                            "resource/view/button-with-icon.svg",
                            "resource/view/checkbox.svg",
                            "resource/view/layer-title.svg",
                            "resource/sublayer/icon/pothole.svg",
                            "resource/sublayer/icon/abandoned-vehicle.svg",
                            "resource/sublayer/icon/light.svg",
                            "resource/mapTools/icon/area.svg",
                            "resource/mapTools/icon/nearby.svg",
                            "resource/sublayer/icon/assault.svg",
                            "resource/sublayer/icon/property.svg"
                            ];


    self.loadResources = function(callback){
        var queueList = queue();

        externalSvgPaths.forEach(function(path){
            queueList.defer(
                function(callback) {
                    d3.xml(path, 'image/svg+xml', function (error, data) {
                        if(error)console.warn(error);
                        self.svgsData[path] = data;
                        callback(null,null);
                    });
                }
            );
        });

        queueList.await(callback);

    };

    var init = function() {

    }();

    return self;
};

//Global instance
var externalSvgModel = ExternalSvgModel();
/**
 *  Class DataDivvyModel
 *
 *  This class fetch the data of the potholes of Chicago city
 */

var DataDivvyModel = function(name) {
    var self = DataModel();

    self._divvyURL = "http://www.divvybikes.com/stations/json/";
    self._notification = Notifications.data.DIVVY_BIKES_CHANGED;
    self.interval = 30000;

    self.stationSelected=null;

    self.entireCityData;    // Contains the data for the entire city


    ////////////////////////// PUBLIC METHODS //////////////////////////

    self.fetchData = function() {
        d3.json(self._proxyURL + self._divvyURL, function(error, json) {
            if(error) {
                console.log("Error downloading the file "+self._divvyURL);
                return;
            }
            self.entireCityData = json.stationBeanList;
            self.callback(geoFilter(json.stationBeanList));
        });
    };

    self.__defineGetter__("city", function() {
        return {
            bikesAvailable: bikesAvailable(self.entireCityData),
            placesAvailable:  placesAvailable(self.entireCityData)
        };
    });

    self.__defineGetter__("selection", function() {
        return {
            bikesAvailable: bikesAvailable(self.data),
            placesAvailable:  placesAvailable(self.data)
        };
    });





    ////////////////////////////////// PRIVATE METHODS //////////////////////////////////
    /**
     * This function is automatically called for filtering data.
     * @param data to be filtered
     */
    var geoFilter = function(data) {
        var newData = data.filter(function(d) {
            //console.log([d.latitude, d.longitude]);
            //console.log(selectionModel.pointInside([d.latitude, d.longitude]));
            return selectionModel.pointInside([d.latitude, d.longitude]);
        });

        return newData;
    };

    // Number of bikes
    var bikesAvailable = function(data) {
        var sum = 0;
        data.forEach(function(station) {
            sum += station.availableBikes;
        });
        return sum;
    };

    var placesAvailable = function(data) {
        var sum = 0;
        data.forEach(function(station) {
            sum += station.availableDocks;
        });
        return sum;
    };

    self.stationClicked = function(divvyStation) {
        if(self.stationSelected!==null && self.stationSelected.id === divvyStation.id){
            self.stationSelected=null;
        }else
            self.stationSelected = divvyStation;
        self.dispatch(Notifications.data.DIVVY_BIKES_SELECTION_CHANGED);
    };

    var init = function() {

        // Listen for the selection update notification and call fetch when it changes
        notificationCenter.subscribe(Notifications.selection.SELECTION_CHANGED, self.dataChanged);

    }();

    return self;
};

var dataDivvyModel = DataDivvyModel();
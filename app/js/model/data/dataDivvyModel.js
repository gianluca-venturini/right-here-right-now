/**
 *  Class DataDivvyModel
 *
 *  This class fetch the data of the potholes of Chicago city
 */

var DataDivvyModel = function(name) {
    var self = DataModel();

    self._divvyURL = "http://www.divvybikes.com/stations/json/";
    self._notification = Notification.data.DIVVY_BIKES_CHANGED;
    self.interval = 30000;

    /** PUBLIC FUNCTIONS**/

    self.fetchData = function() {
        d3.json(self._proxyURL + self._divvyURL, function(error, json) {
            if(error) {
                console.log("Error downloading the file "+self._divvyURL);
                return;
            }
            self.callback(json);
        });
    };

    return self;
}
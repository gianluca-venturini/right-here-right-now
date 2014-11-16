/**
 *  Class DataRestaurantModel
 *
 *  This class aggregate the data of the restaurants
 */

var DataRestaurantModel = function() {
    var self = DataModel();

    self._notification = Notifications.data.FOOD_CHANGED;

    ////////////////////////// PRIVATE ATTRIBUTES //////////////////////////


    ////////////////////////// PUBLIC METHODS //////////////////////////

    self.fetchData = function() {
        console.log("Fetch data of DataRestaurantModel");
        dataYelpRestaurantModel.subscribe(Notifications.data.YELP_RESTAURANT_CHANGED, onDataChanged);
        dataFoodInspection.subscribe(Notifications.data.FOOD_INSPECTION_CHANGED, onDataChanged);
    };

    ////////////////////////////////// PRIVATE METHODS //////////////////////////////////

    var onDataChanged = function() {
        var restaurants    = dataYelpRestaurantModel.data;
        var foodInspection = dataFoodInspection.data;
        console.log(restaurants, foodInspection);

        restaurants.forEach(function(restaurant) {
            var f = foodInspection.filter(function(fi) {
                return dinstance([restaurant.location.latitude, restaurant.location.longitude],
                                 [fi.latitude, fi.longitude]) > 0;
            });
            if(f.length > 0)
                restaurant["food_inspection"] = f[0];
        });

        self.callback(restaurants);
    };

    var dinstance = function(p0, p1) {
        return Math.sqrt((p0[0]-p1[0])*(p0[0]-p1[0]) +
                         (p0[1]-p1[1])*(p0[1]-p1[1]));
    }


    var init = function() {
        // Initialization functions
    }();

    return self;
};

var dataRestaurantModel = DataRestaurantModel();
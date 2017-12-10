var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const fieldsNotChangeable = ['_id', 'userId','eventId','trackingSources','timeStamp' ,'__v', 'created_at', 'updated_at'];

var locationSchema = Schema({
    userId: {
        type: String,
        required: true
    },
    eventId : {
        type: String,
        required: true
    },
    timeStamp : {
        type: Date,
        required: false
    },
    trackingSources: {
        type: String,
        required: false
    },
    coordinates: {
        type:[{
            lat:{type: Number},
            lng:{type: Number}
        }],
        required: false
    },
    created_at: {
        type: Date,
        select: false
    },
    updated_at: {
        type: Date,
        select: true
    }
});

// index of the collection
locationSchema.index({userId:1, eventId: 1, timestamp: 1}, {name: "location_idx", unique: true});

// on every save, add the date
locationSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();
    // change the updated_at field to current date
    this.updated_at = currentDate;
    // if created_at doesn't exist, add to that field
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});

locationSchema.statics.create = function(userId, eventId, locationJson, callback){
    var location = new Location(locationJson);
    location.userId = userId;
    location.eventId = eventId;

    location.save(function(err, location){
        if(err) {
            console.log("Error Here!");
            return callback(err)
        } else {
            console.log("All good with adding location!");
			console.log(location)
            return callback(null, location)
        }
    })
};


locationSchema.statics.update = function (userId, eventId, locationJson, callback) {
    this.findOne({eventId: eventId, userId: userId}, function (err, location) {
        if (err) {
            return callback(err)
        } else {
            for (let key in locationJson) {
                if(fieldsNotChangeable.indexOf(key) === -1){
                    location[key].push(locationJson[key])
                }
            }
            location.save(function (err) {
                if (err) {
                    return callback(err)
                } else {
                    return callback(null, location)
                }
            })
        }
    })
};


var Location = mongoose.model('Location', locationSchema);
module.exports = Location;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Route = require('./route');
var Ranking = require('./ranking');

// list of fields that an user can not change
const fieldsNotChangeable = ['_id', 'organizerId', '__v', 'created_at', 'updated_at'];

var eventSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name of the event is required.'],
        minlength: 1,
        unique: true
    },
    //Changed this to string because organizerID returns numbers and alphas
    organizerId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['running', 'cycling', 'hiking', 'triathlon', 'other'],
        required: [true, 'Type of the event is required.']
    },
    status: {
        type: String,
        enum: ['planned', 'ongoing', 'passed'],
        default: 'planned'
    },
    description: {
        type: String
    },
    country: {
        type: String,
        required: [true, 'Country is required.']
    },
    city: {
        type: String,
        required: [true, 'City is required.']
    },
    startingDate: {
        type: String,
        required: [true, 'A date is required.']
    },
    startingTime: {
        type: String
    },
    actualStartingTime: {
        type: Date
    },
    maxDuration: {
        type: Number
    },
    length: {
        type: Number
    },
    maxParticipants: {
        type: Number,
        default: 100
    },
    enrollmentOpeningAt: {
        type: Date
    },
    enrollmentClosingAt: {
        type: Date
    },
    logo: {
        data: Buffer,
        contentType: String
    },
    created_at: {
        type: Date,
        select: false
    },
    updated_at: {
        type: Date,
        select: false
    }
});

// on every save, add the date
eventSchema.pre('save', function(next) {
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
/*
eventSchema.pre('save',function(next){
	var event = this;
	var err = new Error();

	if (!event.enrollmentOpeningAt || !event.enrollmentClosingAt){
		err.message = 'Enrollment opening date and/or enrollment closing date is not defined';
		next(err);
	}
	else{
		var strDate = event.startingDate.split('/') // e.g. 30/12/2017
		if (!event.startingTime)
		{
			//Month in Date object is defined from 0-11
			var startingDate = new Date(parseInt(strDate[2]),parseInt(strDate[1]) - 1,parseInt(strDate[0]))
		}
		else{
			var strTime = event.startingTime.split(':') // e.g. 12:00
			var startingDate = new Date(parseInt(strDate[2]),parseInt(strDate[1]) - 1,parseInt(strDate[0]),parseInt(strTime[0]),parseInt(strTime[1]),0)
		}

		//Enrollment check
		if (event.enrollmentOpeningAt > event.enrollmentClosingAt){
			err.message = 'Enrollment opening date is defined after enrollment closing date'
			next(err)
		}

		else if (event.enrollmentOpeningAt > startingDate){
			err.message = 'Enrollment opening date cannot be defined after event starting date'
			next(err)
		}
		else if (event.enrollmentClosingAt > startingDate){
			err.message = 'Enrollment closing date cannot be defined after event starting date'
			next(err)
		}
		else {
			next(null)
		}
	}
})*/
/**
 * Error handler. It is executed on every save if errors occur.
 * Inspired here. http://thecodebarbarian.com/mongoose-error-handling
 */
eventSchema.post('save', function (err, doc, next) {
    console.log('[EventModel][error]', err.message);
    if(err.name === 'MongoError' && err.code === 11000){
        next({message: 'En event with this name already exists.'})
    }else{
        next({message: err.msg})
    }
});

/**
 * It finds an event by name passed
 * Then, calls callback with either an error or the found event
 */
eventSchema.statics.findByName = function (name, callback ){
    this.findOne({name: name}, function (err, event) {
        if(err){
            return callback(err)
        }else{
            return callback(null, event)
        }
    })
};

/** It finds an event by id passed
 * Then, calls callback with either an error or the found event
 */
eventSchema.statics.findByEventId = function (eventId, callback ){
    this.findOne({_id: eventId}, function (err, event) {
        if(err){
            return callback(err)
        }else{
            return callback(null, event)
        }
    })
};

/**
 * It finds events by passed list of eventsId
 */
eventSchema.statics.findEventsFromList = function (eventsIdList, callback ){
    this.find(
            {_id: {$in: eventsIdList}}, function (err, event) {
        if(err){
            return callback(err)
        }else{
            return callback(null, event)
        }
    })
};


/** It creates an event.
 *  It then calls a callback passing either an error list or the created event.
 */
eventSchema.statics.create = function (organizerId, eventJson, callback) {
    var event = new Event(eventJson);
    event.organizerId = organizerId;
    event.status = 'planned';

    event.save(function (err, event) {
        if (err) {
            return callback(err)
        } else {
            // create an empty route
            Route.create(event._id, [], function (err) {
                if(err){
                    console.log('[EventModel][create] error while creating an empty route.')
                }
            });
            Ranking.create(event._id, function (err) {
                if(err){
                    console.log('[EventModel][create] error while creating an ranking route.')
                }
            });
            return callback(null, event)
        }
    })
};

/**
 * It updates the event.
 * It returns an error if some not changeable fields are requested.
 * @param eventId
 * @param eventJson
 * @param callback
 * @returns {*}
 */
eventSchema.statics.update = function (eventId, eventJson, callback) {
    this.findOne({_id: eventId}, function (err, event) {
        if (err) {
            return callback(err)
        } else {
            if(event.status !== 'planned'){
                return callback({message: 'You cannot edit an event that is ongoing or already passed.'});
            }

            // override the previous value
            console.log('Event ', eventJson);
            for (let key in eventJson) {
                if(fieldsNotChangeable.indexOf(key) === -1){
                    // if a key in the json passed is null, remove the previous value
                    if([null, 'null'].indexOf(eventJson[key]) > -1 ){
                        if(typeof event[key] !== 'undefined'){
                            event[key] = undefined;
                        }
                    }else{
                        event[key] = eventJson[key]
                    }
                }
            }

            event.save(function (err,updatedEvent) {
                if (err) {
                    return callback(err)
                } else {
                    return callback(null, updatedEvent)
                }
            })
        }
    })
};

/**
 * It deletes an event.
 * @param eventId
 * @param callback
 */
eventSchema.statics.delete = function (eventId, callback){
    this.findOne({_id: eventId}, function (err, event){
        if(err) {
            return callback(err)
        }else{
            event.remove({_id: eventId}, function(err){
                if(err){
                    callback(err)
                }
                else{
                    return callback(null, event)
                }
            })
        }
    })
};

/**
 * It starts the tracking of the event changing the status of it.
 * It returns an error if the status is different than planned.
 * @param callback
 * @returns {*}
 */
eventSchema.methods.startTracking = function (callback) {
    var event = this;
    if(event.status === 'planned'){
        // if the status is planned is possible to start the tracking

        // check if the route is set
        // events with no route can not be started
        Route.findByEventId(event._id, function (err, route) {
            if(err){
                console.log('[EventModel][startTracking][findroute]', err);
                return callback(err)
            }else{
                if(route.coordinates.length === 0){
                    return callback({message: 'The event does not have a route. The tracking cannot be started.'})
                }else{
                    // change the status and save
                    event.status = 'ongoing';
                    event.actualStartingTime = new Date;
                    event.save(function (err) {
                        if(err){
                            console.log('[EventModel][startTracking] error while saving', err);
                            return callback({message: 'Error while updating the status of the event.'});
                        }else{
                            return callback(null)
                        }
                    })
                }
            }
        });
    }else{
        // if the status is different than planned is not possible to start the tracking
        return callback({message:  'The event is already ongoing or passed.'})
    }
};

/**
 * It stops the tracking of the event changing the status of it.
 * It returns an error if the status is different than ongoing.
 * @param callback
 * @returns {*}
 */
eventSchema.methods.stopTracking = function (callback) {
    if(this.status === 'ongoing'){
        // if the status is planned is possible to start the tracking
        // change the status and save
        this.status = 'passed';
        this.save(function (err) {
            if(err){
                console.log('[EventModel][stopTracking] error while saving', err);
                return callback({message: 'Error while updating the status of the event.'});
            }else{
                return callback(null)
            }
        })
    }else{
        // if the status is different than planned is not possible to start the tracking
        return callback({message:  'The event is already passed or still only planned.'})
    }
};

/**
 * It checks if the event is ongoing.
 * @param eventId
 * @param callback
 */
eventSchema.statics.isOnGoing = function (eventId, callback) {
    // retrieve the event
    this.findOne({_id: eventId}, function (err, event) {
        if(err){
            return callback({message: "Error while checking event status."})
        }

        // check the status
        if(event && event.status === 'ongoing'){
            return callback(null, true)
        }else{
            return callback(null, false)
        }
    })
};

/**
 * It returns the status of the event.
 * @param eventId
 * @param callback
 */
eventSchema.statics.getStatus = function (eventId, callback) {
    // retrieve the event
    this.findOne({_id: eventId}, function (err, event) {
        if(err){
            return callback({message: "Error while retrieving event status."})
        }

        // check the status
        if(event){
            return callback(null, event.status)
        }else{
            return callback({message: "The event does not exist."})
        }
    })
};

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;

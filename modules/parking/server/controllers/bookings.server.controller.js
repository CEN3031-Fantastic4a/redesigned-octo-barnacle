'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  Spot = mongoose.model('Spot'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Booking
 */
exports.create = function (req, res) {
  var bookingObj = new Booking(req.body);

  Spot.findOne({ _id: bookingObj.spot }, function (err, spot) {
    if (err) {
      return res.json(err);
    }
    var stream = Booking.find({ parking_spot_id: bookingObj.spot }).stream();

    stream.on('data', function (doc) {
      /* Add functionality to sort through booking times
       if (!(bookingObj.exit_date_time < doc.entry_date_time) && !(doc.exit_date_time < bookingObj.entry_date_time)) {
        res.status(400).send(err);
      } */
    }).on('error', function (err) {
      res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }).on('close', function () {
      bookingObj.save(function (err) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        } else {
          res.json(bookingObj);
        }
      });
    });
  });
};

/**
 * Show the current booking
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var booking = req.booking ? req.booking.toJSON() : {};

  // Add a custom field to the Booking, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Host Spot model.
  booking.isCurrentUserOwner = !!(req.user && booking.user && booking.user._id.toString() === req.user._id.toString());

  res.json(booking);
};

/**
 * Update a booking
 */
exports.update = function (req, res) {
  var booking = req.booking;
  // booking.updated_date = Date.now;
  booking.total_time = req.body.total_time;

  booking.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booking);
    }
  });
};

/**
 * Delete a booking
 */
exports.delete = function (req, res) {
  var booking = req.booking;

  /* Remove the booking */
  booking.remove(function (err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(booking);
    }
  });
};

/**
 * List of all the Bookings done by a User
 */
exports.list = function (req, res) {
  Booking.find({ user: req.user.id }, function (err, bookings) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(bookings);
    }
  });
};

/**
 * Booking middleware
 */
exports.bookingByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Booking is invalid'
    });
  }

  Booking.findById(id).populate('user', 'displayName').exec(function (err, booking) {
    if (err) return next(err);
    else if (!booking) {
      return res.status(404).send({
        message: 'No booking with that identifier has been found'
      });
    }
    req.booking = booking;
    next();
  });
};
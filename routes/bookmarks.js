var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

const verifyGoogleToken = require('../auth'); // Importa el middleware de autenticación


//Models
var Bookmark = require('../models/Bookmark.js');

var db = mongoose.connection;

/* GET bookmarks listing from an user by user email. */
router.get('/:email', function (req, res) { 
    Bookmark.find({'email':req.params.email}).sort('-addeddate').populate('movie').exec(function (err, bookmarks) {
        if (err) res.status(500).send(err);
        else res.status(200).json(bookmarks);
      });
  });

// Ejemplo: Ruta protegida para añadir un bookmark
// El middleware se ejecuta antes que la función del controlador
router.post('/', verifyGoogleToken, async (req, res) => {
    try {
        // Aquí ya tienes acceso a req.user gracias al middleware
        Bookmark.find({ 'email': req.body.email, 'movie': req.body.movie }, function (err, bookmarks) {
            if (err) res.status(500).send(err);
            else {
                if (bookmarks.length > 0) {
                    res.status(409).send("Bookmark already exists");
                } else {
                    Bookmark.create(req.body, function (err, bookmarkinfo) {
                        if (err) res.status(500).send(err);
                        else res.sendStatus(200);
                    });
                }
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  /* DELETE an existing post */
router.delete('/:id', function (req, res) {
    Bookmark.findByIdAndDelete(req.params.id, function (err, bookmarkinfo) {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
    });
  });

  module.exports = router;
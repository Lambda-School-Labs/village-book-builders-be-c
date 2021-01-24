const express = require('express');
const Libraries = require('./libraryModel');
const router = express.Router();
const restrictTo = require('../auth/restrictTo');
const authenicate = require('../auth/authenticate-middleware');

router.get('/', authenicate, restrictTo('teacher'), function (req, res) {
  Libraries.findAll()
    .then((libraries) => {
      res.status(200).json(libraries);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id', authenicate, function (req, res) {
  const id = String(req.params.id);
  Libraries.findById(id)
    .then((library) => {
      if (library) {
        res.status(200).json(library);
      } else {
        res.status(404).json({ error: 'libraryNotFound' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/', authenicate, async (req, res) => {
  const library = req.body;
  if (library) {
    const id = library.id || 0;
    try {
      await Libraries.findById(id).then(async (pf) => {
        if (pf == undefined) {
          //library not found so lets insert it
          await Libraries.create(library).then((library) =>
            res
              .status(200)
              .json({ message: 'library created', library: library[0] })
          );
        } else {
          res.status(400).json({ message: 'library already exists' });
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: e.message });
    }
  } else {
    res.status(404).json({ message: 'library missing' });
  }
});

router.put('/:id', authenicate, (req, res) => {
  const library = req.body;
  if (library) {
    const id = library.id || 0;
    Libraries.findById(id)
      .then(
        Libraries.update(id, library)
          .then((updated) => {
            res
              .status(200)
              .json({ message: 'library updated', library: updated[0] });
          })
          .catch((err) => {
            res.status(500).json({
              message: `Could not update library '${id}'`,
              error: err.message,
            });
          })
      )
      .catch((err) => {
        res.status(404).json({
          message: `Could not find library '${id}'`,
          error: err.message,
        });
      });
  }
});

router.delete('/:id', authenicate, (req, res) => {
  const id = req.params.id;
  try {
    Libraries.findById(id).then((library) => {
      Libraries.remove(library.id).then(() => {
        res
          .status(200)
          .json({ message: `library '${id}' was deleted.`, library: library });
      });
    });
  } catch (err) {
    res.status(500).json({
      message: `Could not delete library with ID: ${id}`,
      error: err.message,
    });
  }
});

module.exports = router;

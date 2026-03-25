const express = require('express');
const { authorize, protect } = require('../middleware/auth');
const { addLectureNote } = require('../controllers/facultyLectureNoteController');

const router = express.Router();

router.post("/lecture-note",protect,addLectureNote)


module.exports = router;
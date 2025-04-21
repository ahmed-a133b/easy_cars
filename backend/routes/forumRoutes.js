const express = require('express');
const router = express.Router();
const forumCtrl = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/', forumCtrl.getPosts);
router.post('/', protect, forumCtrl.createPost);

module.exports = router;

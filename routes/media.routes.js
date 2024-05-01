const express = require('express');
const router = express.Router();
const { upload, listImages, getImagesDetail, updateImages, deleteImages } = require('../controllers/media.controllers')
const { image } = require('../libs/multer');

router.post('/images/upload', image.single('image'), upload);
router.get('/images', listImages);
router.get('/images/:id', getImagesDetail);
router.put('/images/:id', image.single('image'), updateImages);
router.delete('/images/:id', deleteImages);

module.exports = router;

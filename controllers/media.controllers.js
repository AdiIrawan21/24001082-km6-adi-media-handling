const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imagekit = require('../libs/imagekit');
const path = require('path');

module.exports = {
    // function untuk upload gambar beserta informasi
    upload: async (req, res, next) => {
        try {
            const { title, description } = req.body;
            const file = req.file;

            if (!title || !description || !file) {
                return res.status(400).json({
                    status: false,
                    message: `'title', 'description', and an image file are required`,
                    data: null,
                });
            }

            const stringFile = file.buffer.toString('base64');
            const uploadFile = await imagekit.upload({
                fileName: `${Date.now()}${path.extname(file.originalname)}`,
                file: stringFile
            });

            const uploadImage = await prisma.image.create({
                data: {
                    title,
                    description,
                    imageUrl: uploadFile.url
                },
            });

            return res.status(201).json({
                status: true,
                message: 'Image uploaded successfully',
                data: uploadImage
            });

        } catch (err) {
            next(err);
        }
    },

    // function untuk menampilkan list gambar
    listImages: async (req, res, next) => {
        try {
            const images = await prisma.image.findMany({
                select: {
                    id: true,
                    // title: true,
                    // description: true,
                    imageUrl: true
                },
                orderBy: {
                    id: 'desc'
                }
            });

            if (!images.length) {
                return res.status(404).json({
                    status: false,
                    message: 'No images found',
                    data: []
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Images retrieved successfully',
                data: images
            });
        } catch (err) {
            next(err);
        }
    },

    // function untuk menampilkan detail gambar beserta informasi
    getImagesDetail: async (req, res, next) => {
        try {
            const { id } = req.params;
            const image = await prisma.image.findUnique({
                where: {
                    id: parseInt(id)
                }
            });

            if (!image) {
                return res.status(404).json({
                    status: false,
                    message: 'Image not found',
                    data: null
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Image details retrieved successfully',
                data: image
            });
        } catch (err) {
            next(err);
        }
    },

    // function untuk update gambar beserta informasi
    updateImages: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            const file = req.file;
            // console.log(req.file)

            const image = await prisma.image.findUnique({
                where: {
                    id: parseInt(id)
                }
            });

            if (!image) {
                return res.status(404).json({
                    status: false,
                    message: 'Image not found',
                    data: null
                });
            }

            if (!file) {
                return res.status(400).json({
                    status: false,
                    message: 'No file uploaded',
                    data: null
                });
            }

            // handle imagekit

            const stringFile = file.buffer.toString('base64');

            const uploadFile = await imagekit.upload({
                fileName: Date.now() + path.extname(file.originalname),
                file: stringFile
            });

            if (!title || !description) {
                return res.status(400).json({
                    status: false,
                    message: 'At least one of title or description must be provided',
                    data: null
                });
            }

            let updatedData = await prisma.image.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    description,
                    imageUrl: uploadFile.url
                }
            })

            return res.status(200).json({
                status: true,
                message: 'Image updated successfully',
                data: updatedData
            });

        } catch (err) {
            next(err);
        }
    },

    // function untuk delete images
    deleteImages: async (req, res, next) => {
        try {
            const { id } = req.params;

            // Dapatkan informasi URL gambar yang akan dihapus
            const imageInfo = await prisma.image.findUnique({
                where: { id: parseInt(id) },
            });

            if (!imageInfo) {
                return res.status(404).json({
                    status: false,
                    message: 'Data images not found',
                    data: null
                });
            }

            // Hapus gambar dari ImageKit.io
            const deleteImage = await imagekit.deleteFile(imageInfo.url);

            if (deleteImage) {
                await prisma.image.delete({
                    where: {
                        id: parseInt(id),
                    },
                })
                return res.status(200).json({
                    status: true,
                    message: 'Image deleted successfully',
                    data: deletedImage
                });
            }
        } catch (err) {
            next(err);
        }
    }
}


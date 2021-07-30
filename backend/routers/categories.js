const express = require('express');
const router = express.Router();
const { Categories } = require('../models/categories');

router.get(`/`, async (req, res) => {
    const categoriesList = await Categories.find();

    if(!categoriesList) {
        res.status(500).json({success: false});
    }

    res.status(201).json(categoriesList);
});

router.post(`/`, (req, res) => {
    const category = new Categories({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon
    });

    category.save().then(item => {
        res.status(201).json(item);
    }).catch((err) => {
        res.status(500).json({success: false})
    });
});

module.exports = router;

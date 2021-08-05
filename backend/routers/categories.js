const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');

router.get(`/`, async (req, res) => {
    const categoriesList = await Category.find();

    if(!categoriesList) {
        res.status(500).json({success: false});
    }

    res.status(201).json(categoriesList);
});


router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({success: false, message: 'The category with the given ID was not found!'})
    }
    res.status(200).send(category);
});

router.put('/:id', async (req, res) => {
    const category = await  Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, {
        new: true
        }
        );
    if(!category) {
        return res.status(400).send('The category can not be updated!')
    }

    res.status(200).json(category);
})
// router.post(`/`, (req, res) => {
//     const category = new Category({
//         name: req.body.name,
//         color: req.body.color,
//         icon: req.body.icon
//     });
//
//     category.save().then(item => {
//         res.status(201).json(item);
//     }).catch((err) => {
//         res.status(500).json({success: false})
//     });
// });

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await  category.save();
    if(!category) {
        return res.status(404).send('The category can not be created');
    }

    res.send(category);
});

// api/v1
router.delete('/:id', (req,res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category) {
            return res.status(200).json({success: true, message: 'the category'});
        } else {
            return res.status(404).json({success: false, })
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err});
    });
})

module.exports = router;

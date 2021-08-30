const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
});

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({success: false})
    }
    res.send(user);
});

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            isAdmin: req.body.isAdmin,
            passwordHash: newPassword,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
            phone: req.body.phone
        },

    ).select('-passwordHash');

    if (!user) {
        return res.status(500).json({success: false, message: "User does not exist!"});
    }

    res.send(user);
});

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        phone: req.body.phone
    });

    user = await user.save();

    if (!user) {
        return res.status(400).send('The user can not be created!');
    }

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not founded!');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'});
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('Password is incorrect!');
    }

    return res.status(200).json(user);
});

router.get('/get/count', async (req, res) => {
    const userCount = await User.find().countDocuments((count) => count);
    if (!userCount) {
        return res.status(404).send('No user found');
    }

    res.status(200).json({userCount: userCount});
});

router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({
                    success: true,
                    message: "User has been deleted successfully"
                }
            );
        } else {
            return res.status(404).json({success: false, message: "User does not exist!"});
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    });
});


module.exports = router;

const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
});

router.get(`/:id`, async (req, res) =>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({success: false})
    }
    res.send(user);
});

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if(req.body.password) {
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
            apartment: req.body.apartmant,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        {new: true}
    ).select('-passwordHash');

    if(!user) {
        return res.status(500).json({success: false, message: "User does not exist!"});
    }

    res.send(user);
})

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartmant: req.body.apartmant,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if(!user) {
        return res.status(400).send('The user can not be created!');
    }

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    console.log()
    if(!user) {
        return res.status(400).send('The user not founded!');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id
        },
            'secret');
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(400).send('Password is wrong!');
    }

    return res.status(200).json(user);
});


module.exports =router;

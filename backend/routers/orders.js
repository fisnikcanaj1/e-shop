const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate('orderItem')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
});

router.post('/', async (req, res) => {
    if (!req.body.orderItems) {
        return res.status(400).json({success: false, message: 'No order founded!'});
    }
    console.log(req.body.orderItems);

    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id
    }));

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product',  'price');
        const totalPrice = orderItem?.product.price * orderItem?.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => {
     return a + b
    },0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order = await order.save();

    if (!order) {
        return res.status(400).send('The order can not be created!');
    }

    res.send(order);
});

router.get('/get/totalPrice', (req, res) => {
    const totalSales = Order.aggregate([
        {$group: { _id: null, totalsales: { $sum: '$totalPrice' }}}
    ]);

    if(!totalSales) {
        return res.status(400).send('The order not founded');
    }

    res.status(200).json({totalsales: totalSales.pop().totalsales})
})

router.put('/:id', async (req, res) => {
    const order = await  Order.findByIdAndUpdate(
        req.params.id, {
          status: req.body.status
        }, {
            new: true
        }
    );
    if(!order) {
        return res.status(400).send('The order can not be updated!')
    }

    res.status(200).json(order);
});

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.find().countDocuments((count) => count);
    if (!orderCount) {
        return res.status(404).send('No user found');
    }

    res.status(200).json({orderCount: orderCount});
});


router.delete('/:id', (req, res) => {
    console.log(req.params.id);
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order) {
            await order.orderItems.map(async orderId => {
                 await OrderItem.findByIdAndRemove(orderId);
            });
            return res.status(200).json({success: true, message: 'Order is deleted successfully'});
        } else {
            return res.status(404).json({success: false, message: 'Order not founded'});
        }
    }).catch(err => {
        return res.status(500).json(err);
    })
});

router.get('/get/userorders/:userid', async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid})
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        })
        .sort({'dateOrdered': -1})
    if(!userOrderList) {
        return res.status(500).json({success: false});
    }
    res.send(userOrderList);

});

module.exports = router;

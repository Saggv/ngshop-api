import { Router } from "express";
const stripe = require('stripe')('sk_test_51Hoje2CohLCE8kRQLxcqg0MmJb5ndvoyj55CWlPYBu98FO2WpoU00PwnmXHHHjLNf3QNYmO4JQv3rz2Was9BfmtK0030uQmrJ4');

import Order from "../models/order";
import Product from "../models/product";
import OrderItem from "../models/order-item";

const router = Router();

router.get('/', async(req, res) =>{
    const orderList = await Order.find().populate('user', 'name')
                            .populate({path: 'orderItems', populate: 
                            { path: 'product', populate: 'category'}})
                            .sort({'dateOrdered': -1});
    if(!orderList){
        return res.status(400).send('Can not find the order')
    }

    res.send(orderList);
})

router.get('/:id', async(req, res) =>{
    const order = await Order.findById(req.params.id)
                    .populate('user', 'name')
                    .populate({path: 'orderItems', populate:
                     {
                         path: 'product', populate: 'category'
                     }
                    });

    if(!order){
        return res.status(400).send({success: false, message: 'Can not find the order'})
    }

    res.send(order);
})

router.post('/', async(req, res) =>{
    const {
        orderItems,
        shipingAddress1,
        shipingAddress2,
        city,
        zip,
        country,
        phone,
        user
    } = req.body;

    const newOrderItemIds = await Promise.all(orderItems.map(async(orderItem: any) =>{
        const newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        const saveOrderItem = await newOrderItem.save();
        return saveOrderItem._id
    }));

    const orderItemIds = await newOrderItemIds;

    const totalPrices: Array<number> = await Promise.all(orderItemIds.map(async(orderItemId) =>{
        const orderItem: any = await OrderItem.findById(orderItemId).populate('product');
        if(!orderItem){
            res.status(500).send({success: false, message: 'Caculate total failed!'});
           return 0;
        }

        let price: number = orderItem.quantity * orderItem.product.price;
        return price;
    }));

    const totalPrice = totalPrices.reduce((a: number, b: number) =>{
        let result: number = a + b;
        return result;
    }, 0)

    const newOrder = new Order({
        orderItems: orderItemIds,
        shipingAddress1,
        shipingAddress2,
        city,
        zip,
        country,
        phone,
        user,
        totalPrice
    });

    const order = await newOrder.save();

    if(!order){
        return res.status(500).send({
            success: false,
            message: 'Order has failed!'
        })
    };

    res.status(200).send(order)
});

router.put('/:id', async(req, res) =>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {
            new: true
        }
    );

    if(!order){
        res.status(500).send({success: false, message: 'Update the order is unsuccessfully'})
        return;
    }

    res.send(order);
})

router.delete('/:id', async(req, res) =>{
    const order = await Order.findById(req.params.id);

    if(!order){
        res.status(400).json({success: false, message: 'The order was not found'})
        return
    }

    order.orderItems.map( async(itemId) =>{
        const orderItem = await OrderItem.findByIdAndRemove(itemId);

        if(!orderItem){
            res.status(400).send('Remove order item failed!')
            return;
        }
    })

    const removeOrder = await Order.findByIdAndRemove(req.params.id);

    if(!removeOrder){
        res.status(400).json({success: false, message: 'Remove order failed'})
        return;
    }

    res.status(400).json({success: true, message: 'Remove order successfully'})
})

router.get('/get/totalSales', async(req, res) =>{
    const total = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: {
                    $sum: '$totalPrice'
                }
            }
        }
    ]);

    if(!total){
        res.status(400).send({success: false})
        return
    }

    res.send({totalSales: total.pop().totalSales});
})

router.get('/get/count',  async(req, res)=>{
    const order = await Order.countDocuments();
    if(!order){
        res.status(400).send({success: false});
        return;
    }
    res.send({order});
})

router.get('/get/userorder/:id',  async(req, res)=>{
    const orderItem = await Order.find({user: req.params.id})
                        .populate({path: 'orderItems', populate:
                        {
                            path: 'product', populate: 'category'
                        }
                        });
    if(!orderItem){
        res.status(400).send({success: false});
        return;
    }
    res.send({orderItem});
})

router.post('/create-checkout-session', async (req, res) => {
    const {orderItems} = req.body;

    if(!orderItems){
        res.status(400).send('No order items');
        return;
    }

    const product = await Promise.all(orderItems.map(async(item: any) =>{
        const result = await Product.findById(item.id);
         if(!result){
            return;
         }

        return{
            price_data: {
                currency: 'usd',
                product_data: {
                name: result?.name,
                },
                unit_amount: result?.price * 100,
            },
            quantity: item.quantity,
        }
    }))

    const session = await stripe.checkout.sessions.create({
      line_items: product,
      mode: 'payment',
      success_url: `http://localhost:4200/payment/success`,
      cancel_url: `http://localhost:4200/payment/failed`,
    });
  
    res.json({id: session.id});
  });

export default router;
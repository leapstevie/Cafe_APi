const orderService = require('../services/orderService');

async function createOrder(req, res) {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

module.exports = { createOrder, getAllOrders, getOrderById };

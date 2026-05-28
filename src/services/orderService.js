const Order = require('../models/Order');

function generateInvoiceNumber() {
    return '#' + String(Math.floor(1000 + Math.random() * 9000));
}

async function createOrder(data) {
    const { total, cashier_name, items } = data;

    if (!items || items.length === 0) {
        throw new Error('Order must have at least one item');
    }
    if (!total || total <= 0) {
        throw new Error('Invalid order total');
    }

    const invoice_number = generateInvoiceNumber();
    const orderId = await Order.create({ invoice_number, total, cashier_name, items });
    return Order.findById(orderId);
}

async function getAllOrders() {
    return Order.findAll();
}

async function getOrderById(id) {
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');
    return order;
}

module.exports = { createOrder, getAllOrders, getOrderById };

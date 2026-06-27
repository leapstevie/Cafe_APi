const Order = require('../models/Order');
const { sendTelegram } = require('./telegram.service');

function generateInvoiceNumber() {
    return '#' + String(Math.floor(1000 + Math.random() * 9000));
}

function formatAmount(value) {
    const amount = Number(value || 0);
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatTelegramDate(value) {
    const date = value ? new Date(value) : new Date();

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    return `${day}/${month}/${year}, ${time}`;
}

function formatTelegramMessage(order) {
    const itemSummary = (order.items || [])
        .map(item => `${item.item_name} x${item.quantity}`)
        .join(', ');

    const subtotal = Number(order.subtotal || order.total || 0);
    const discountAmount = Number(order.discount_amount || 0);
    const lines = [
        '<b>ការបញ្ជាទិញថ្មីបានមកដល់ហើយ!</b>',
        `-លេខវិក្កយបត្រ ៖ <b>${escapeHtml(order.invoice_number)}</b>`,
        `-សរុបមុនបញ្ចុះតម្លៃ ៖ <b>${formatAmount(subtotal)}</b>`,
        `-បញ្ចុះតម្លៃ ៖ <b>${formatAmount(discountAmount)}</b>`,
        `-តម្លៃសរុប ៖ <b>${formatAmount(order.total)}</b>`,
        `-អ្នកគិតលុយ ៖ ${escapeHtml(order.cashier_name || 'Guest')}`,
        `-មុខទំនិញ ៖ ${escapeHtml(itemSummary || 'No items')}`,
        `-កាលបរិច្ឆេទ ៖ ${escapeHtml(formatTelegramDate(order.created_at))}`
    ];

    return lines.join('\n');
}

async function createOrder(data) {
    const { cashier_name, items } = data;
    const subtotal = Number(
        data.subtotal ?? (items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
    );
    const discountType = data.discount_type || null;
    const discountValue = Number(data.discount_value || 0);
    const discountAmount = Number(
        data.discount_amount || (discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue)
    );
    const total = Number(data.total ?? subtotal - discountAmount);

    if (!items || items.length === 0) {
        throw new Error('Order must have at least one item');
    }
    if (!subtotal || subtotal <= 0) {
        throw new Error('Invalid order subtotal');
    }
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        throw new Error('Invalid discount percentage');
    }
    if (discountAmount < 0 || discountAmount > subtotal) {
        throw new Error('Invalid discount amount');
    }
    if (!total || total <= 0) {
        throw new Error('Invalid order total');
    }

    const invoice_number = generateInvoiceNumber();
    const orderId = await Order.create({
        invoice_number,
        subtotal,
        total,
        cashier_name,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        items
    });
    const order = await Order.findById(orderId);

    await sendTelegram(formatTelegramMessage(order));

    return order;
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

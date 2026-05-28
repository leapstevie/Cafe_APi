const db = require('../config/database');

class Order {
    static async create(orderData) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const { invoice_number, total, cashier_name, items } = orderData;
            const [orderResult] = await conn.query(
                'INSERT INTO orders (invoice_number, total, payment_status, cashier_name) VALUES (?, ?, ?, ?)',
                [invoice_number, total, 'SUCCESS', cashier_name]
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                await conn.query(
                    'INSERT INTO order_items (order_id, item_id, item_name, quantity, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.item_id || null, item.item_name, item.quantity, item.subtotal]
                );
            }

            await conn.commit();
            return orderId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async findAll() {
        const [rows] = await db.query(
            'SELECT * FROM orders ORDER BY created_at DESC'
        );
        return rows;
    }

    static async findById(id) {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (!orders[0]) return null;
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        return { ...orders[0], items };
    }
}

module.exports = Order;

const db = require('../config/database');
const User = require('./User');

class Order {
    static schemaCache = null;

    static async getSchema() {
        if (this.schemaCache) {
            return this.schemaCache;
        }

        const [orderColumns] = await db.query('SHOW COLUMNS FROM orders');
        const [orderItemColumns] = await db.query('SHOW COLUMNS FROM order_items');

        this.schemaCache = {
            orderColumns: new Set(orderColumns.map(column => column.Field)),
            orderItemColumns: new Set(orderItemColumns.map(column => column.Field))
        };

        return this.schemaCache;
    }

    static async resolveCashierId(cashierName) {
        if (!cashierName) {
            return null;
        }

        const user = await User.findByUsername(cashierName);
        return user ? user.id : null;
    }

    static normalizeOrder(order) {
        if (!order) {
            return null;
        }

        return {
            ...order,
            payment_status: order.payment_status || order.status || 'SUCCESS',
            cashier_name: order.cashier_name || order.cashier_username || null,
            subtotal: order.subtotal ?? order.total,
            discount_type: order.discount_type || null,
            discount_value: Number(order.discount_value || 0),
            discount_amount: Number(order.discount_amount || 0)
        };
    }

    static async create(orderData) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const {
                invoice_number,
                subtotal,
                total,
                cashier_name,
                discount_type,
                discount_value,
                discount_amount,
                items
            } = orderData;
            const { orderColumns, orderItemColumns } = await this.getSchema();
            const orderInsertColumns = ['invoice_number', 'total'];
            const orderInsertValues = [invoice_number, total];

            if (orderColumns.has('payment_status')) {
                orderInsertColumns.push('payment_status');
                orderInsertValues.push('SUCCESS');
            }
            if (orderColumns.has('cashier_name')) {
                orderInsertColumns.push('cashier_name');
                orderInsertValues.push(cashier_name || null);
            }
            if (orderColumns.has('cashier_id')) {
                orderInsertColumns.push('cashier_id');
                orderInsertValues.push(await this.resolveCashierId(cashier_name));
            }
            if (orderColumns.has('status')) {
                orderInsertColumns.push('status');
                orderInsertValues.push('COMPLETED');
            }
            if (orderColumns.has('subtotal')) {
                orderInsertColumns.push('subtotal');
                orderInsertValues.push(subtotal ?? total);
            }
            if (orderColumns.has('discount_type')) {
                orderInsertColumns.push('discount_type');
                orderInsertValues.push(discount_type || null);
            }
            if (orderColumns.has('discount_value')) {
                orderInsertColumns.push('discount_value');
                orderInsertValues.push(discount_value || 0);
            }
            if (orderColumns.has('discount_amount')) {
                orderInsertColumns.push('discount_amount');
                orderInsertValues.push(discount_amount || 0);
            }
            if (orderColumns.has('amount_paid')) {
                orderInsertColumns.push('amount_paid');
                orderInsertValues.push(total);
            }
            if (orderColumns.has('change_amount')) {
                orderInsertColumns.push('change_amount');
                orderInsertValues.push(0);
            }
            if (orderColumns.has('payment_method')) {
                orderInsertColumns.push('payment_method');
                orderInsertValues.push('CASH');
            }
            if (orderColumns.has('order_type')) {
                orderInsertColumns.push('order_type');
                orderInsertValues.push('dine_in');
            }

            const orderPlaceholders = orderInsertColumns.map(() => '?').join(', ');
            const [orderResult] = await conn.query(
                `INSERT INTO orders (${orderInsertColumns.join(', ')}) VALUES (${orderPlaceholders})`,
                orderInsertValues
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                const itemInsertColumns = ['order_id', 'item_id', 'item_name', 'quantity', 'subtotal'];
                const itemInsertValues = [
                    orderId,
                    item.item_id || null,
                    item.item_name,
                    item.quantity,
                    item.subtotal
                ];

                if (orderItemColumns.has('unit_price')) {
                    const unitPrice = item.quantity > 0 ? item.subtotal / item.quantity : item.subtotal;
                    itemInsertColumns.splice(3, 0, 'unit_price');
                    itemInsertValues.splice(3, 0, unitPrice);
                }

                const itemPlaceholders = itemInsertColumns.map(() => '?').join(', ');
                await conn.query(
                    `INSERT INTO order_items (${itemInsertColumns.join(', ')}) VALUES (${itemPlaceholders})`,
                    itemInsertValues
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
        const { orderColumns } = await this.getSchema();
        const selectFields = ['o.*'];
        let joinClause = '';

        if (!orderColumns.has('payment_status') && orderColumns.has('status')) {
            selectFields.push('o.status AS payment_status');
        }
        if (!orderColumns.has('cashier_name') && orderColumns.has('cashier_id')) {
            selectFields.push('u.username AS cashier_username');
            joinClause = ' LEFT JOIN users u ON u.id = o.cashier_id';
        }

        const [rows] = await db.query(
            `SELECT ${selectFields.join(', ')} FROM orders o${joinClause} ORDER BY o.created_at DESC`
        );
        return rows.map(row => this.normalizeOrder(row));
    }

    static async findById(id) {
        const { orderColumns } = await this.getSchema();
        const selectFields = ['o.*'];
        let joinClause = '';

        if (!orderColumns.has('payment_status') && orderColumns.has('status')) {
            selectFields.push('o.status AS payment_status');
        }
        if (!orderColumns.has('cashier_name') && orderColumns.has('cashier_id')) {
            selectFields.push('u.username AS cashier_username');
            joinClause = ' LEFT JOIN users u ON u.id = o.cashier_id';
        }

        const [orders] = await db.query(
            `SELECT ${selectFields.join(', ')} FROM orders o${joinClause} WHERE o.id = ?`,
            [id]
        );
        if (!orders[0]) return null;
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        return { ...this.normalizeOrder(orders[0]), items };
    }
}

module.exports = Order;

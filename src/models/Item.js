const db = require('../config/database');

class Item {
    // Get all available items with category names
    static async findAll() {
        const [rows] = await db.query(`
            SELECT i.*, c.name as category 
            FROM items i 
            LEFT JOIN categories c ON i.category_id = c.id 
            WHERE i.is_available = TRUE 
            ORDER BY c.name, i.name
        `);
        return rows;
    }

    // Get single item by ID with category name
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT i.*, c.name as category 
            FROM items i 
            LEFT JOIN categories c ON i.category_id = c.id 
            WHERE i.id = ? AND i.is_available = TRUE
        `, [id]);
        return rows[0];
    }

    // Create new item
    static async create(itemData) {
        const { name, category_id, description, price, temperature, image } = itemData;
        const [result] = await db.query(
            'INSERT INTO items (name, category_id, description, price, temperature, image) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category_id, description, price, temperature, image]
        );
        return result.insertId;
    }

    // Update item
    static async update(id, itemData) {
        const { name, category_id, description, price, temperature, image, is_available = 1 } = itemData;
        const [result] = await db.query(
            'UPDATE items SET name = ?, category_id = ?, description = ?, price = ?, temperature = ?, image = ?, is_available = ? WHERE id = ?',
            [name, category_id, description, price, temperature, image, is_available, id]
        );
        return result.affectedRows;
    }

    // Soft delete (set is_available to false)
    static async delete(id) {
        const [result] = await db.query(
            'UPDATE items SET is_available = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = Item;

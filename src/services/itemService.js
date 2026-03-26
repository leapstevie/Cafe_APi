const Item = require('../models/Item');

class ItemService {
    // Get all menu items
    static async getAllItems() {
        return await Item.findAll();
    }

    // Get single item
    static async getItemById(id) {
        const item = await Item.findById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    // Create new item
    static async createItem(itemData) {
        const { name, category_id, price } = itemData;

        // Basic validation
        if (!name || !category_id || !price) {
            throw new Error('Name, category_id, and price are required');
        }

        const itemId = await Item.create(itemData);
        return await Item.findById(itemId);
    }

    // Update item
    static async updateItem(id, itemData) {
        const affectedRows = await Item.update(id, itemData);
        if (affectedRows === 0) {
            throw new Error('Item not found or no changes made');
        }
        return await Item.findById(id);
    }

    // Delete item (soft delete)
    static async deleteItem(id) {
        const affectedRows = await Item.delete(id);
        if (affectedRows === 0) {
            throw new Error('Item not found');
        }
        return { message: 'Item deleted successfully' };
    }
}

module.exports = ItemService;

const ItemService = require('../services/itemService');

class ItemController {
    // GET /api/items
    static async getAllItems(req, res) {
        try {
            const items = await ItemService.getAllItems();
            res.status(200).json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/items/:id
    static async getItemById(req, res) {
        try {
            const item = await ItemService.getItemById(req.params.id);
            res.status(200).json(item);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    // POST /api/items
    static async createItem(req, res) {
        try {
            const item = await ItemService.createItem(req.body);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /api/items/:id
    static async updateItem(req, res) {
        try {
            const item = await ItemService.updateItem(req.params.id, req.body);
            res.status(200).json(item);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // DELETE /api/items/:id
    static async deleteItem(req, res) {
        try {
            const result = await ItemService.deleteItem(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

module.exports = ItemController;

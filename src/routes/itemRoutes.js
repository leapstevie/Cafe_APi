const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');

// GET /api/items - Get all items
router.get('/', ItemController.getAllItems);

// GET /api/items/:id - Get single item
router.get('/:id', ItemController.getItemById);

// POST /api/items - Create new item
router.post('/', ItemController.createItem);

// PUT /api/items/:id - Update item
router.put('/:id', ItemController.updateItem);

// DELETE /api/items/:id - Delete item
router.delete('/:id', ItemController.deleteItem);

module.exports = router;

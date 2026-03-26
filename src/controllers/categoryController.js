const categoryService = require('../services/categoryService');

/**
 * Get all categories
 */
async function getAllCategories(req, res) {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Create new category
 */
async function createCategory(req, res) {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Update category
 */
async function updateCategory(req, res) {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json({ message: 'Category updated successfully', category });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Delete category
 */
async function deleteCategory(req, res) {
    try {
        const result = await categoryService.deleteCategory(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};

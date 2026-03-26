const db = require('../config/database');

/**
 * Get all categories
 */
async function getAllCategories() {
    const [categories] = await db.query(
        'SELECT id, name, description, created_at FROM categories ORDER BY name ASC'
    );
    return categories;
}

/**
 * Create new category
 */
async function createCategory(data) {
    const { name, description } = data;

    // Check if category already exists
    const [existing] = await db.query(
        'SELECT id FROM categories WHERE name = ?',
        [name]
    );

    if (existing.length > 0) {
        throw new Error(`Category "${name}" already exists`);
    }

    const [result] = await db.query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description || null]
    );

    return {
        id: result.insertId,
        name,
        description
    };
}

/**
 * Update category
 */
async function updateCategory(id, data) {
    const { name, description } = data;

    // Check if new name conflicts with existing category
    if (name) {
        const [existing] = await db.query(
            'SELECT id FROM categories WHERE name = ? AND id != ?',
            [name, id]
        );

        if (existing.length > 0) {
            throw new Error(`Category "${name}" already exists`);
        }
    }

    await db.query(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description || null, id]
    );

    return { id, name, description };
}

/**
 * Delete category
 */
async function deleteCategory(id) {
    // Check if any items use this category
    const [items] = await db.query(
        'SELECT COUNT(*) as count FROM items WHERE category_id = ?',
        [id]
    );

    if (items[0].count > 0) {
        throw new Error(`Cannot delete category: ${items[0].count} items are using it`);
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    return { message: 'Category deleted successfully' };
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};

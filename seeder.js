require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

const categories = [
    { name: 'Coffee',   description: 'Coffee drinks' },
    { name: 'Tea',      description: 'Tea drinks' },
    { name: 'Milk',     description: 'Milk-based drinks' },
    { name: 'Smoothie', description: 'Fruit smoothies' },
    { name: 'Dessert',  description: 'Desserts' },
];

const items = [
    { name: 'Espresso',           category: 'Coffee',   description: 'Strong coffee',      price: 2.50, temperature: 'Hot',  image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
    { name: 'Americano',          category: 'Coffee',   description: 'Black coffee',       price: 3.00, temperature: 'Hot',  image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&q=80' },
    { name: 'Latte',              category: 'Coffee',   description: 'Milk coffee',        price: 3.50, temperature: 'Hot',  image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&q=80' },
    { name: 'Iced Latte',         category: 'Coffee',   description: 'Cold milk coffee',   price: 3.80, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80' },
    { name: 'Cappuccino',         category: 'Coffee',   description: 'Foamy coffee',       price: 3.60, temperature: 'Hot',  image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80' },
    { name: 'Green Tea',          category: 'Tea',      description: 'Hot tea',            price: 2.20, temperature: 'Hot',  image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
    { name: 'Iced Lemon Tea',     category: 'Tea',      description: 'Cold tea',           price: 2.80, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&q=80' },
    { name: 'Milk Tea',           category: 'Tea',      description: 'Tea with milk',      price: 3.10, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&q=80' },
    { name: 'Chocolate Milk',     category: 'Milk',     description: 'Chocolate milk',     price: 3.00, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    { name: 'Strawberry Smoothie',category: 'Smoothie', description: 'Fresh smoothie',     price: 4.20, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1553530666-ba11a90a3dce?w=400&q=80' },
    { name: 'Mango Smoothie',     category: 'Smoothie', description: 'Fresh smoothie',     price: 4.20, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80' },
    { name: 'Cheesecake',         category: 'Dessert',  description: 'Cake slice',         price: 3.90, temperature: 'Cold', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80' },
];

const users = [
    { username: 'admin',     email: 'admin@gmail.com',    password: 'admin123' },
    { username: 'Cashier 1', email: 'cashier1@gmail.com', password: 'cashier123' },
    { username: 'Cashier 2', email: 'cashier2@gmail.com', password: 'cashier123' },
];

async function seedCategories() {
    console.log('Seeding categories...');
    let inserted = 0;
    for (const cat of categories) {
        const [existing] = await db.query('SELECT id FROM categories WHERE name = ?', [cat.name]);
        if (existing.length === 0) {
            await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [cat.name, cat.description]);
            inserted++;
        }
    }
    console.log(`  Categories: ${inserted} inserted, ${categories.length - inserted} already existed.`);
}

async function seedItems() {
    console.log('Seeding items...');
    let inserted = 0;
    for (const item of items) {
        const [catRows] = await db.query('SELECT id FROM categories WHERE name = ?', [item.category]);
        if (catRows.length === 0) {
            console.warn(`  Warning: category "${item.category}" not found, skipping "${item.name}"`);
            continue;
        }
        const categoryId = catRows[0].id;
        const [existing] = await db.query('SELECT id FROM items WHERE name = ?', [item.name]);
        if (existing.length === 0) {
            await db.query(
                'INSERT INTO items (name, category_id, description, price, temperature, image) VALUES (?, ?, ?, ?, ?, ?)',
                [item.name, categoryId, item.description, item.price, item.temperature, item.image]
            );
            inserted++;
        }
    }
    console.log(`  Items: ${inserted} inserted, ${items.length - inserted} already existed.`);
}

async function seedUsers() {
    console.log('Seeding users...');
    let inserted = 0;
    for (const user of users) {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [user.email]);
        if (existing.length === 0) {
            const hashed = await bcrypt.hash(user.password, 10);
            await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [user.username, user.email, hashed]
            );
            inserted++;
        }
    }
    console.log(`  Users: ${inserted} inserted, ${users.length - inserted} already existed.`);
}

async function remakeDatabase() {
    console.log('Remaking database schema...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop tables if they exist
    await db.query('DROP TABLE IF EXISTS order_items');
    await db.query('DROP TABLE IF EXISTS orders');
    await db.query('DROP TABLE IF EXISTS items');
    await db.query('DROP TABLE IF EXISTS categories');
    await db.query('DROP TABLE IF EXISTS users');

    // Recreate categories table
    await db.query(`
        CREATE TABLE categories (
            id int NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            description text,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Recreate items table
    await db.query(`
        CREATE TABLE items (
            id int NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            category_id int NOT NULL,
            description text,
            price decimal(10,2) NOT NULL,
            temperature varchar(20) DEFAULT NULL,
            image text,
            is_available tinyint(1) NOT NULL DEFAULT '1',
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY name (name),
            KEY idx_items_category_id (category_id),
            CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Recreate orders table
    await db.query(`
        CREATE TABLE orders (
            id int NOT NULL AUTO_INCREMENT,
            invoice_number varchar(50) NOT NULL,
            total decimal(10,2) NOT NULL,
            payment_status varchar(20) NOT NULL DEFAULT 'SUCCESS',
            cashier_name varchar(100) DEFAULT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_orders_created_at (created_at),
            KEY idx_orders_invoice_number (invoice_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Recreate order_items table
    await db.query(`
        CREATE TABLE order_items (
            id int NOT NULL AUTO_INCREMENT,
            order_id int NOT NULL,
            item_id int DEFAULT NULL,
            item_name varchar(255) NOT NULL,
            quantity int NOT NULL,
            subtotal decimal(10,2) NOT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_order_items_order_id (order_id),
            KEY idx_order_items_item_id (item_id),
            CONSTRAINT fk_order_items_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE SET NULL,
            CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // Recreate users table
    await db.query(`
        CREATE TABLE users (
            id int NOT NULL AUTO_INCREMENT,
            username varchar(100) NOT NULL,
            email varchar(255) NOT NULL,
            password varchar(255) NOT NULL,
            access_token varchar(500) DEFAULT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('  Database schema remade successfully.');
}

async function run() {
    try {
        await remakeDatabase();

        await seedCategories();
        await seedItems();
        await seedUsers();
        console.log('\nSeeding complete!');
        console.log('  admin@gmail.com    / admin123');
        console.log('  cashier1@gmail.com / cashier123');
        console.log('  cashier2@gmail.com / cashier123');
    } catch (err) {
        console.error('Seeder error:', err.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

run();

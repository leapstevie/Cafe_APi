# Cafe Backend API

Express.js MVC backend for the cafe application with MySQL database integration.

## Features

- ✅ MVC architecture (Models, Views, Controllers, Services, Routes)
- ✅ JWT authentication with bcrypt password hashing
- ✅ MySQL database with connection pooling
- ✅ RESTful API design
- ✅ CORS enabled for Angular frontend
- ✅ Transaction-based order creation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone and navigate to project**
   ```bash
   cd /Users/macbookpro/Desktop/cafe_sv16/cafe-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=cafe_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=24h
   NODE_ENV=development
   ```

4. **Create database**
   
   Make sure the `cafe_db` database exists. Use the SQL scripts from the frontend:
   ```bash
   mysql -u root -p < ../cafe/database/scripts/01_create_database.sql
   mysql -u root -p < ../cafe/database/scripts/02_create_tables.sql
   ```

## Running the Server

### Development mode (with auto-restart)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/user/:id` | Get user info | ❌ |

**Register Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Menu Items

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/items` | Get all menu items | ❌ |
| GET | `/api/items/:id` | Get single item | ❌ |
| POST | `/api/items` | Create new item | ❌ |
| PUT | `/api/items/:id` | Update item | ❌ |
| DELETE | `/api/items/:id` | Delete item | ❌ |

**Create Item Request:**
```json
{
  "name": "Espresso",
  "category": "Coffee",
  "description": "Strong coffee",
  "price": 2.50,
  "temperature": "Hot",
  "image": "https://example.com/image.jpg"
}
```

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | ❌ |
| GET | `/api/orders/user/:userId` | Get user orders | ❌ |

**Create Order Request:**
```json
{
  "userId": 1,
  "items": [
    { "itemId": 1, "quantity": 2 },
    { "itemId": 3, "quantity": 1 }
  ]
}
```

## Project Structure

```
cafe-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Item.js              # Item model
│   │   └── Order.js             # Order model
│   ├── services/
│   │   ├── authService.js       # Auth business logic
│   │   ├── itemService.js       # Item business logic
│   │   └── orderService.js      # Order business logic
│   ├── controllers/
│   │   ├── authController.js    # Auth request handlers
│   │   ├── itemController.js    # Item request handlers
│   │   └── orderController.js   # Order request handlers
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── itemRoutes.js        # Item routes
│   │   └── orderRoutes.js       # Order routes
│   └── app.js                    # Express app config
├── server.js                      # Entry point
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Testing with curl

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123456"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### Get All Items
```bash
curl http://localhost:3000/api/items
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"itemId":1,"quantity":2}]}'
```

## Database Schema

The backend uses the following tables from `cafe_db`:

- `users` - User authentication data
- `items` - Menu items
- `orders` - Customer orders
- `order_items` - Order line items

## Development Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours by default
- Orders use MySQL transactions for data integrity
- Item prices are validated server-side for security
- CORS is configured for `http://localhost:4200` (Angular frontend)

## Next Steps

- Add JWT middleware for protected routes
- Implement request validation
- Add error handling middleware
- Add unit tests
- Add API rate limiting
- Add logging system

## License

ISC

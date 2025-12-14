# Campus Food Ordering System

A web app for ordering food on campus. Students can browse the menu, add items to cart, and track orders.

## Links

- **Frontend:** https://nanaakuffo12.github.io/Food-ordering-sysem
- **Backend API:** https://campus-food-ordering.onrender.com/api

## Test Accounts

**Student**
- Email: student@example.com
- Password: Password123

**Admin**
- Email: admin@example.com
- Password: Admin@123

## Features

- Register and login
- Browse menu items
- Add items to cart with quantity control
- Place orders
- Track order status (Pending, Preparing, Ready, Completed)
- View order history
- Update user profile

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: In-memory (development)
- Auth: JWT tokens
- Hosting: Render (backend), GitHub Pages (frontend)

## Project Structure

```
campus-food-ordering/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Setup

### Backend
```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`

### Frontend
Open `index.html` in a web browser or use a local server:
```bash
python -m http.server 8000
```

## API Endpoints

**Auth**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

**Menu**
- `GET /api/menu` - Get all items
- `GET /api/menu/:id` - Get item

**Orders**
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create order
- `DELETE /api/orders/:id` - Cancel order

**Profile**
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

## How to Test

1. Sign up or login with test credentials
2. Go to Menu and add items to cart
3. View cart and proceed to checkout
4. Place order and check Order History
5. Track order status changes


#!/usr/bin/env node
/**
 * Database Seed Script
 * Creates initial admin user and sample menu items
 */

const bcrypt = require('bcryptjs');

// Sample data to seed
const adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('Admin@123', 10),
    roomNumber: '001',
    role: 'admin'
};

const sampleStudent = {
    id: 2,
    name: 'Test Student',
    email: 'student@example.com',
    password: bcrypt.hashSync('Password123', 10),
    roomNumber: '102',
    role: 'student'
};

const menuItems = [
    {
        id: 1,
        name: 'Jollof Rice',
        description: 'Delicious spiced rice with vegetables',
        price: 15.00,
        category: 'Rice'
    },
    {
        id: 2,
        name: 'Fufu',
        description: 'Pounded cassava and plantain',
        price: 12.00,
        category: 'Fufu'
    },
    {
        id: 3,
        name: 'Waakye',
        description: 'Rice and beans with sauce',
        price: 10.00,
        category: 'Rice'
    },
    {
        id: 4,
        name: 'Kebab',
        description: 'Grilled meat skewers',
        price: 18.00,
        category: 'Meat'
    },
    {
        id: 5,
        name: 'Fried Rice',
        description: 'Spicy fried rice with vegetables',
        price: 14.00,
        category: 'Rice'
    },
    {
        id: 6,
        name: 'Grilled Chicken',
        description: 'Juicy grilled chicken with spices',
        price: 20.00,
        category: 'Meat'
    },
    {
        id: 7,
        name: 'Plantain Chips',
        description: 'Crispy fried plantain',
        price: 5.00,
        category: 'Sides'
    },
    {
        id: 8,
        name: 'Pounded Yam',
        description: 'Smooth pounded yam',
        price: 11.00,
        category: 'Yam'
    }
];

console.log('🌱 SEED DATA FOR CAMPUS FOOD ORDERING SYSTEM\n');
console.log('📝 Admin User:');
console.log(`  Email: ${adminUser.email}`);
console.log(`  Password: Admin@123`);
console.log(`  Role: ${adminUser.role}\n`);

console.log('👤 Test Student:');
console.log(`  Email: ${sampleStudent.email}`);
console.log(`  Password: Password123`);
console.log(`  Role: ${sampleStudent.role}\n`);

console.log('🍽️  Menu Items:');
menuItems.forEach(item => {
    console.log(`  ${item.id}. ${item.name} - ₵${item.price.toFixed(2)} (${item.category})`);
});

console.log('\n✅ Use these credentials to test the application:');
console.log('');
console.log('ADMIN LOGIN:');
console.log('  Email: admin@example.com');
console.log('  Password: Admin@123');
console.log('');
console.log('STUDENT LOGIN:');
console.log('  Email: student@example.com');
console.log('  Password: Password123');
console.log('');
console.log('📌 Note: This seed data is stored in memory.');
console.log('   The data will be reset when the server restarts.');

// Simple test script to check authentication
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5001';

async function testAuth() {
    try {
        // Test 1: Check if server is running
        console.log('Testing server connection...');
        const testResponse = await fetch(`${API_BASE_URL}/api/test`);
        const testData = await testResponse.json();
        console.log('Server test:', testData);

        // Test 2: Try to login
        console.log('\nTesting login...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com', // Replace with actual admin email
                password: 'password123' // Replace with actual password
            })
        });

        if (!loginResponse.ok) {
            console.log('Login failed:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);

        // Test 3: Try to fetch groups with token
        console.log('\nTesting groups API with token...');
        const groupsResponse = await fetch(`${API_BASE_URL}/api/chat/groups`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!groupsResponse.ok) {
            console.log('Groups API failed:', await groupsResponse.text());
            return;
        }

        const groupsData = await groupsResponse.json();
        console.log('Groups API successful:', groupsData);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAuth();
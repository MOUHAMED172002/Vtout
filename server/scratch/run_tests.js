import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log("🧪 Starting API Automated Tests...");
    const tests = [
        { name: "Public: Health Check", endpoint: "/", method: "GET" },
        { name: "Public: Products List", endpoint: "/products", method: "GET" },
        { name: "Public: Categories", endpoint: "/categories", method: "GET" },
        { name: "Public: Policies", endpoint: "/policies", method: "GET" },
        { name: "Auth: Session Check", endpoint: "/auth/get-session", method: "GET" },
    ];

    for (const test of tests) {
        try {
            console.log(`[WAIT] Testing ${test.name}...`);
            const start = Date.now();
            const config = {
                method: test.method,
                url: test.endpoint === "/" ? "http://localhost:3000/" : `${BASE_URL}${test.endpoint}`,
                timeout: 5000
            };
            const response = await axios(config);
            const duration = Date.now() - start;
            console.log(`✅ ${test.name}: SUCCESS (Status: ${response.status}, Time: ${duration}ms)`);
            if (test.endpoint === "/products") {
                console.log(`   📦 Found ${response.data.products?.length || response.data.length || 0} products.`);
            }
        } catch (error) {
            console.error(`❌ ${test.name}: FAILED`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Data:`, error.response.data);
            } else {
                console.error(`Error: ${error.message}`);
            }
        }
    }
}

runTests();




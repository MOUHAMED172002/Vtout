
async function test() {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/auth/request-password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'githubabdoul@gmail.com',
                redirectTo: 'http://localhost:3000/reset-password'
            })
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', data);
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

test();

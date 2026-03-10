const reviewController = require('./controllers/reviewController');

async function test() {
    const req = {
        auth: {
            userId: '85630b88-747a-48e6-b55d-2e7007a9d050'
        }
    };
    const res = {
        status: function (s) {
            this.statusCode = s;
            console.log('Status:', s);
            return this;
        },
        json: function (j) {
            console.log('JSON:', JSON.stringify(j, null, 2));
        }
    };

    console.log('Testing getMyReviews with full logic...');
    try {
        await reviewController.getMyReviews(req, res);
    } catch (e) {
        console.error('CRASHED:', e);
    }
}

test();

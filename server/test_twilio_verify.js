import 'dotenv/config';
import twilio from 'twilio';

const testVerify = async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        console.error('Missing credentials in .env');
        process.exit(1);
    }

    const client = twilio(accountSid, authToken);
    
    // Replace this with a dummy number just to trigger the Twilio API validation
    const testNumber = '+22997000000';

    try {
        console.log(`Sending to ${testNumber}...`);
        const verification = await client.verify.v2
            .services(serviceSid)
            .verifications.create({
                to: testNumber,
                channel: 'whatsapp'
            });
        console.log('Success:', verification.status);
    } catch (error) {
        console.error('Twilio Error:', {
            status: error.status,
            code: error.code,
            message: error.message,
            moreInfo: error.moreInfo
        });
    }
};

testVerify();

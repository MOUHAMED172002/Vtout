import { Notification } from './models/index.js';

async function run() {
    try {
        await Notification.sync({ alter: true });
        console.log("Notifications table synced!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();

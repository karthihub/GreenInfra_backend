var FCM = require('fcm-node');
var serverKey = 'AAAA9rosVhI:APA91bG5bqmqU4xFb8FsoucnGjfMNRjQ0HkWg3M0EI64qK6VF8bvtXliHe0ZRoo5h_4CpxQWNnXWzw6DaslZKoK9PoqDGslOXliMy80IMZFUZ23mdWr5n6xTRyH5ixMuwon3VKNQ_KTj'; //put your server key here
var fcm = new FCM(serverKey);
const logger = require("../models/logger.model");

function sendSinglePushnotification(toSend, content){
    var message = { 
        to: toSend, 
        collapse_key: 'green',
        
        notification: {
            title: 'Agam Digital', 
            body: content
        },
        // data: {
        //     my_key: 'my value',
        //     my_another_key: 'my another value'
        // }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            logger.error("FCM Pushnotification Triggered Failed : ", {error: err, content:content, toSend: toSend});
        } else {
            logger.info("FCM Pushnotification Triggered Successfully : ", {response: response, content:content, toSend: toSend});
        }
    });
}

module.exports = { sendSinglePushnotification };
const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
    host: "localhost", // We're using our proxy SMTP server
    port: 2525, // Our proxy is listening on port 2525
    secure: false,

    auth: {
        user: "b2c6a45bcb4b28",
        pass: "dc219dc287c225"
    },
    // Do not use secure connection
    tls: {
        rejectUnauthorized: false
      }
});


const message = {
    from: 'jimmy@gmail.com',
    to: 'recipient@example.coom',
    subject: 'Test',
    text: 'testing (test@example.com)',
};

transport.sendMail(message, function(err, info) {
    if (err) {
        console.log('Error occurred. ' + err.message);
    } else {
        console.log('Email sent successfully');
    }
});

const SMTPServer = require('smtp-server').SMTPServer;
const nodemailer = require('nodemailer');
const fs = require('fs');
const mailparser = require('mailparser').simpleParser;

// Load blocklist from file
let blocklistData = fs.readFileSync('block.txt', 'utf8').split('---');
let blocklist = {
    tlds: blocklistData[0].split('\n').map(item => item.trim()),
    domains: blocklistData[1].split('\n').map(item => item.trim()),
    emails: blocklistData[2].split('\n').map(item => item.trim())
};


const forwardTransport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "b2c6a45bcb4b28",
        pass: "dc219dc287c225"
    }
});

const server = new SMTPServer({
    onAuth(auth, session, callback) {
        if (auth.username !== "b2c6a45bcb4b28" || auth.password !== "dc219dc287c225") {
            return callback(new Error("Invalid username or password"));
        }
        callback(null, { user: auth.username });
    },
    onData(stream, session, callback) {
        let mailData = '';
        stream.on('data', chunk => {
            mailData += chunk;
        });
        stream.on('end', () => {
            // Parse the raw email
            mailparser(mailData, (err, parsedMail) => {
                if (err) {
                    return callback(err);
                }
    
                // Extract sender's domain and email
                const senderEmail = parsedMail.from.value[0].address;
                const senderDomain = senderEmail.split('@')[1];
                const senderTLD = senderDomain.split('.').pop();
    
                // Check if sender's TLD, domain or email is in blocklist
                if (blocklist.tlds.includes(senderTLD) || blocklist.domains.includes(senderDomain) || blocklist.emails.includes(senderEmail)) {
                    return callback(new Error("Blocked Domain or Email"));
                }
    
                // If not blocked, forward the email
                forwardTransport.sendMail({
                    envelope: {
                        from: session.envelope.mailFrom,
                        to: session.envelope.rcptTo
                    },
                    raw: mailData
                }, (err, info) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, 'Message accepted');
                });
            });
        });
    }
    
    
});

server.listen(2525);

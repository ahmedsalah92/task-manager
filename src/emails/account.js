const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)


const sendWelcomeEmail =  (mail, name) => {
    const msg = {
        to: mail, // Change to your recipient
        from: mail, // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'hello' + name,
    }
    sgMail.send(msg)
}

module.exports = {
    sendWelcomeEmail
}

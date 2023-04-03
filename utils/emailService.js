const sgMail = require('@sendgrid/mail')

const mailapi = process.env.SENDGRID_API_KEY;

const sendEmailService = async(toEmail, subject,body) => {
try {
    sgMail.setApiKey(mailapi)
    const msg = {
  to: `${toEmail}`, // Change to your recipient
  from: 'sunraja1996@gmail.com', // Change to your verified sender
  subject: `${subject}`,
  html: `${body}`,
}

await sgMail.send(msg)

} catch (error) {
        console.error(error)
      }
}
  
  

module.exports={sendEmailService}
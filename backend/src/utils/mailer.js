import Mailgen from "mailgen"
import nodemailer from "nodemailer"

/**
 *
 * @param {{email: string; subject: string; mailgenContent: Mailgen.Content; }} options
 */
const sendMail = async (options) => {

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
        theme: 'neopolitan',
        product: {
            name: 'shopit',
            link: 'http://localhost:8000/'
        }
    });

    //generate plainText version of email (for clients that doesn't support HTML)
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)

    //generate HTML version of email (for clients that support HTML)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    // Create a nodemailer transporter instance which is responsible to send a mail
    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mail = {
        from: "mail.shopit@gmail.com", // We can name this anything. The mail will go to your Mailtrap inbox
        to: options.email, // receiver's mail
        subject: options.subject, // mail subject
        text: emailTextual, // mailgen content textual variant
        html: emailHtml, // mailgen content html variant
    }

    try {
        await transport.sendMail(mail)
    } catch (error) {
        // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
        // So it's better to fail silently rather than breaking the app
        console.log(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
        );
        console.log("Error: ", error);
    }

}

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description It designs the forgot password mail
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
        name: username,
        intro: "We got a request to reset the password of our account",
        action: {
            instructions:
            "To reset your password click on the following button or link:",
            button: {
            color: "#22BC66", // Optional action button color
            text: "Reset password",
            link: passwordResetUrl,
            },
        },
        outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};


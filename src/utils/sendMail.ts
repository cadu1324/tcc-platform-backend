export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

// Dev transport: no SMTP is wired yet, so the message is logged and the flow stays
// testable. Replace the body with a real transport (nodemailer / provider) without
// changing this signature or any caller.
export async function sendMail(message: MailMessage): Promise<void> {
  console.log(`[sendMail] to=${message.to} subject="${message.subject}"\n${message.text}`);
}

import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailSendService {
  async sendEmail(email: string, letter: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pavvel.potapov@gmail.com',
        pass: 'cfas asrj bell izdi',
      },
    });

    await transport.sendMail({
      from: 'PavelBackend',
      to: email,
      subject: 'Test ПОДТВЕРЖДЕНИЕ регистации',
      html: letter,
    });
  }
}

export class MockEmailSendService {
  async sendEmail(email: string, letter: string) {
    console.log('MockEmailSendService' + email + letter);
  }
}

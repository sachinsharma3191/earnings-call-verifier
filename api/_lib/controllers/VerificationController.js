// Thin controller - delegates to service layer
import { ServiceContainer } from '../container/ServiceContainer.js';

export class VerificationController {
  constructor() {
    const container = ServiceContainer.getInstance();
    this.verificationService = container.getVerificationService();
  }

  async verifyClaims(ticker, quarter, claims) {
    if (!ticker || !quarter || !claims || !Array.isArray(claims)) {
      throw new Error('Missing required parameters: ticker, quarter, claims');
    }

    if (claims.length === 0) {
      throw new Error('Claims array cannot be empty');
    }

    return await this.verificationService.verifyClaims(ticker, quarter, claims);
  }
}

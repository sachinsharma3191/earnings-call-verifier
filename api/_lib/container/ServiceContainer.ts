// Dependency Injection Container - follows Dependency Inversion Principle
import { ITranscriptProvider } from '../interfaces/ITranscriptProvider';
import { ISECDataProvider } from '../interfaces/ISECDataProvider';
import { IVerificationService } from '../interfaces/IVerificationService';
import { FinnhubTranscriptService } from '../services/FinnhubTranscriptService';
import { SECDataService } from '../services/SECDataService';
import { ClaimVerificationService } from '../services/ClaimVerificationService';

export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private transcriptService?: ITranscriptProvider;
  private secDataService?: ISECDataProvider;
  private verificationService?: IVerificationService;

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  getTranscriptService(): ITranscriptProvider {
    if (!this.transcriptService) {
      const apiKey = process.env.FINNHUB_API_KEY || '';
      this.transcriptService = new FinnhubTranscriptService(apiKey);
    }
    return this.transcriptService;
  }

  getSECDataService(): ISECDataProvider {
    if (!this.secDataService) {
      this.secDataService = new SECDataService();
    }
    return this.secDataService;
  }

  getVerificationService(): IVerificationService {
    if (!this.verificationService) {
      const secService = this.getSECDataService();
      this.verificationService = new ClaimVerificationService(secService);
    }
    return this.verificationService;
  }

  // For testing - allow injection of mock services
  setTranscriptService(service: ITranscriptProvider): void {
    this.transcriptService = service;
  }

  setSECDataService(service: ISECDataProvider): void {
    this.secDataService = service;
  }

  setVerificationService(service: IVerificationService): void {
    this.verificationService = service;
  }
}

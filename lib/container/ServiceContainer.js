// Dependency Injection Container - follows Dependency Inversion Principle
import { FinnhubTranscriptService } from '../services/FinnhubTranscriptService';
import { SECDataService } from '../services/SECDataService';
import { ClaimVerificationService } from '../services/ClaimVerificationService';

export class ServiceContainer {
  static instance;
  
  constructor() {
    this.transcriptService = null;
    this.secDataService = null;
    this.verificationService = null;
  }

  static getInstance() {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  getTranscriptService() {
    if (!this.transcriptService) {
      const apiKey = process.env.FINNHUB_API_KEY || '';
      this.transcriptService = new FinnhubTranscriptService(apiKey);
    }
    return this.transcriptService;
  }

  getSECDataService() {
    if (!this.secDataService) {
      this.secDataService = new SECDataService();
    }
    return this.secDataService;
  }

  getVerificationService() {
    if (!this.verificationService) {
      const secService = this.getSECDataService();
      this.verificationService = new ClaimVerificationService(secService);
    }
    return this.verificationService;
  }

  // For testing - allow injection of mock services
  setTranscriptService(service) {
    this.transcriptService = service;
  }

  setSECDataService(service) {
    this.secDataService = service;
  }

  setVerificationService(service) {
    this.verificationService = service;
  }
}

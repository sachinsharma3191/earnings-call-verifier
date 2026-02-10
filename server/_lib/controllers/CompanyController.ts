// Thin controller - delegates to service layer
import { ServiceContainer } from '../container/ServiceContainer';

export class CompanyController {
  private readonly secDataService;

  constructor() {
    const container = ServiceContainer.getInstance();
    this.secDataService = container.getSECDataService();
  }

  async getCompanyFinancials(ticker: string) {
    if (!ticker) {
      throw new Error('Missing required parameter: ticker');
    }

    const cik = this.getCIKForTicker(ticker);
    return await this.secDataService.getCompanyFinancials(cik);
  }

  async getCompanyQuarters(ticker: string) {
    if (!ticker) {
      throw new Error('Missing required parameter: ticker');
    }

    const cik = this.getCIKForTicker(ticker);
    const quarters = await this.secDataService.getQuarterlyData(cik);
    
    return {
      ticker,
      quarters: quarters.map(q => ({
        quarter: `${q.fiscal_period} ${q.fiscal_year}`,
        endDate: q.end_date,
        filed: q.filed
      }))
    };
  }

  async getCompaniesList() {
    // Return list of supported companies
    const companies = [
      { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
      { ticker: 'NVDA', name: 'NVIDIA Corporation', cik: '0001045810' },
      { ticker: 'MSFT', name: 'Microsoft Corporation', cik: '0000789019' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', cik: '0001018724' },
      { ticker: 'META', name: 'Meta Platforms Inc.', cik: '0001326801' },
      { ticker: 'TSLA', name: 'Tesla Inc.', cik: '0001318605' },
      { ticker: 'JPM', name: 'JPMorgan Chase & Co.', cik: '0000019617' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', cik: '0000200406' },
      { ticker: 'WMT', name: 'Walmart Inc.', cik: '0000104169' }
    ];
    
    return {
      companies,
      total: companies.length
    };
  }

  private getCIKForTicker(ticker: string): string {
    const tickerToCIK: Record<string, string> = {
      'AAPL': '0000320193',
      'NVDA': '0001045810',
      'MSFT': '0000789019',
      'GOOGL': '0001652044',
      'AMZN': '0001018724',
      'META': '0001326801',
      'TSLA': '0001318605',
      'JPM': '0000019617',
      'JNJ': '0000200406',
      'WMT': '0000104169'
    };
    return tickerToCIK[ticker] || ticker;
  }
}

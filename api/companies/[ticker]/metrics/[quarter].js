import { CompanyController } from '../../../_lib/controllers/CompanyController';
import { createApiHandler } from '../../../_lib/middleware/apiHandler';

export default createApiHandler(async (req, res) => {
  const { ticker, quarter } = req.query;
  const controller = new CompanyController();
  const financials = await controller.getCompanyFinancials(ticker);
  
  const quarterData = financials.quarters.find(q => 
    `${q.fiscal_period} ${q.fiscal_year}` === quarter
  );

  if (!quarterData) {
    throw new Error('Quarter not found');
  }

  return {
    ticker,
    quarter,
    metrics: quarterData
  };
}, { allowedMethods: ['GET'] });

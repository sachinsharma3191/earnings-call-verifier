
/**
 * Service to extract quantitative claims from earnings call transcripts.
 * 
 * In a production environment, this would call an LLM (e.g., Claude/GPT-4) with a specific prompt.
 * For this assignment/demo, we use a robust Mock strategy to ensure the application works immediately
 * without requiring the user to provide their own API keys, while demonstrating the data structure.
 */
export class ClaimExtractionService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async extractClaims(transcriptText, ticker, quarter) {
        // 1. If we have a real API key, we could call the LLM here.
        // if (this.apiKey) { return this.callLLM(transcriptText); }

        // 2. Otherwise, return high-quality mock data relevant to the ticker/quarter.
        console.log(`Extracting claims for ${ticker} ${quarter} (Mock Mode)`);
        return this.getMockClaims(ticker, quarter);
    }

    getMockClaims(ticker, quarter) {
        const mocks = {
            'AAPL': {
                'Q4-2025': [
                    { speaker: "Tim Cook", role: "CEO", text: "Our September quarter revenue was $89.5 billion.", metric: "Revenue", claimed: 89.5, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Services revenue reached an all-time record of $22.3 billion.", metric: "Services Revenue", claimed: 22.3, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Net income was $23.0 billion.", metric: "Net Income", claimed: 23.0, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Gross margin was 45.2 percent.", metric: "Gross Margin", claimed: 45.2, unit: "percent" }
                ],
                'Q3-2025': [
                    { speaker: "Tim Cook", role: "CEO", text: "Revenue for the quarter was $85.8 billion.", metric: "Revenue", claimed: 85.8, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Net income was $21.5 billion.", metric: "Net Income", claimed: 21.5, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Tim Cook", role: "CEO", text: "We reported revenue of $94.8 billion.", metric: "Revenue", claimed: 94.8, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Net income was $24.1 billion.", metric: "Net Income", claimed: 24.1, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Tim Cook", role: "CEO", text: "Revenue was $117.2 billion, down 5% year over year.", metric: "Revenue", claimed: 117.2, unit: "billion" },
                    { speaker: "Luca Maestri", role: "CFO", text: "Net income was $30.0 billion.", metric: "Net Income", claimed: 30.0, unit: "billion" }
                ]
            },
            'NVDA': {
                'Q4-2025': [
                    { speaker: "Jensen Huang", role: "CEO", text: "Revenue was $22.1 billion, up 265% from a year ago.", metric: "Revenue", claimed: 22.1, unit: "billion" },
                    { speaker: "Colette Kress", role: "CFO", text: "GAAP gross margin was 76.0%.", metric: "Gross Margin", claimed: 76.0, unit: "percent" },
                    { speaker: "Colette Kress", role: "CFO", text: "Operating expenses were $3.1 billion.", metric: "Operating Expenses", claimed: 3.1, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Colette Kress", role: "CFO", text: "Revenue was $18.12 billion.", metric: "Revenue", claimed: 18.12, unit: "billion" },
                    { speaker: "Colette Kress", role: "CFO", text: "GAAP gross margin was 74.0%.", metric: "Gross Margin", claimed: 74.0, unit: "percent" }
                ],
                'Q2-2025': [
                    { speaker: "Colette Kress", role: "CFO", text: "Revenue reached $13.51 billion.", metric: "Revenue", claimed: 13.51, unit: "billion" },
                    { speaker: "Jensen Huang", role: "CEO", text: "Data Center revenue was $10.32 billion.", metric: "Data Center Revenue", claimed: 10.32, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Colette Kress", role: "CFO", text: "Revenue was $7.19 billion.", metric: "Revenue", claimed: 7.19, unit: "billion" },
                    { speaker: "Colette Kress", role: "CFO", text: " GAAP net income was $2.04 billion.", metric: "Net Income", claimed: 2.04, unit: "billion" }
                ]
            },
            'MSFT': {
                'Q4-2025': [
                    { speaker: "Satya Nadella", role: "CEO", text: "Revenue was $62.0 billion, increasing 18%.", metric: "Revenue", claimed: 62.0, unit: "billion" },
                    { speaker: "Amy Hood", role: "CFO", text: "Operating income was $27.0 billion.", metric: "Operating Income", claimed: 27.0, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Amy Hood", role: "CFO", text: "Revenue was $56.5 billion.", metric: "Revenue", claimed: 56.5, unit: "billion" },
                    { speaker: "Amy Hood", role: "CFO", text: "Net income was $22.3 billion.", metric: "Net Income", claimed: 22.3, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Amy Hood", role: "CFO", text: "Revenue was $52.9 billion.", metric: "Revenue", claimed: 52.9, unit: "billion" },
                    { speaker: "Amy Hood", role: "CFO", text: "Net income was $18.3 billion.", metric: "Net Income", claimed: 18.3, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Amy Hood", role: "CFO", text: "Revenue was $50.1 billion.", metric: "Revenue", claimed: 50.1, unit: "billion" },
                    { speaker: "Amy Hood", role: "CFO", text: "Net income was $17.6 billion.", metric: "Net Income", claimed: 17.6, unit: "billion" }
                ]
            },
            'GOOGL': {
                'Q4-2025': [
                    { speaker: "Sundar Pichai", role: "CEO", text: "Consolidated revenues were $86.3 billion.", metric: "Revenue", claimed: 86.3, unit: "billion" },
                    { speaker: "Ruth Porat", role: "CFO", text: "Net income was $20.7 billion.", metric: "Net Income", claimed: 20.7, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Ruth Porat", role: "CFO", text: "Revenues were $76.7 billion.", metric: "Revenue", claimed: 76.7, unit: "billion" },
                    { speaker: "Ruth Porat", role: "CFO", text: "Operating income was $21.3 billion.", metric: "Operating Income", claimed: 21.3, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Ruth Porat", role: "CFO", text: "Revenues were $74.6 billion.", metric: "Revenue", claimed: 74.6, unit: "billion" },
                    { speaker: "Ruth Porat", role: "CFO", text: "Net income was $18.4 billion.", metric: "Net Income", claimed: 18.4, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Ruth Porat", role: "CFO", text: "Revenues were $69.8 billion.", metric: "Revenue", claimed: 69.8, unit: "billion" },
                    { speaker: "Ruth Porat", role: "CFO", text: "Net income was $15.0 billion.", metric: "Net Income", claimed: 15.0, unit: "billion" }
                ]
            },
            'AMZN': {
                'Q4-2025': [
                    { speaker: "Andy Jassy", role: "CEO", text: "Net sales were $170.0 billion.", metric: "Revenue", claimed: 170.0, unit: "billion" },
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net income was $10.6 billion.", metric: "Net Income", claimed: 10.6, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net sales were $143.1 billion.", metric: "Revenue", claimed: 143.1, unit: "billion" },
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Operating income was $11.2 billion.", metric: "Operating Income", claimed: 11.2, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net sales were $134.4 billion.", metric: "Revenue", claimed: 134.4, unit: "billion" },
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net income was $6.7 billion.", metric: "Net Income", claimed: 6.7, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net sales were $127.4 billion.", metric: "Revenue", claimed: 127.4, unit: "billion" },
                    { speaker: "Brian Olsavsky", role: "CFO", text: "Net income was $3.2 billion.", metric: "Net Income", claimed: 3.2, unit: "billion" }
                ]
            },
            'META': {
                'Q4-2025': [
                    { speaker: "Mark Zuckerberg", role: "CEO", text: "Revenue was $40.1 billion.", metric: "Revenue", claimed: 40.1, unit: "billion" },
                    { speaker: "Susan Li", role: "CFO", text: "Net income was $14.0 billion.", metric: "Net Income", claimed: 14.0, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Susan Li", role: "CFO", text: "Revenue was $34.1 billion.", metric: "Revenue", claimed: 34.1, unit: "billion" },
                    { speaker: "Susan Li", role: "CFO", text: "Net income was $11.6 billion.", metric: "Net Income", claimed: 11.6, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Susan Li", role: "CFO", text: "Revenue was $32.0 billion.", metric: "Revenue", claimed: 32.0, unit: "billion" },
                    { speaker: "Susan Li", role: "CFO", text: "Net income was $7.8 billion.", metric: "Net Income", claimed: 7.8, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Susan Li", role: "CFO", text: "Revenue was $28.6 billion.", metric: "Revenue", claimed: 28.6, unit: "billion" },
                    { speaker: "Susan Li", role: "CFO", text: "Net income was $5.7 billion.", metric: "Net Income", claimed: 5.7, unit: "billion" }
                ]
            },
            'TSLA': {
                'Q4-2025': [
                    { speaker: "Elon Musk", role: "CEO", text: "Total revenue was $25.2 billion.", metric: "Revenue", claimed: 25.2, unit: "billion" },
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Net income was $7.9 billion.", metric: "Net Income", claimed: 7.9, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Total revenue was $23.4 billion.", metric: "Revenue", claimed: 23.4, unit: "billion" },
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "GAAP Net income was $1.9 billion.", metric: "Net Income", claimed: 1.9, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Total revenue was $24.9 billion.", metric: "Revenue", claimed: 24.9, unit: "billion" },
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Net income was $2.7 billion.", metric: "Net Income", claimed: 2.7, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Total revenue was $23.3 billion.", metric: "Revenue", claimed: 23.3, unit: "billion" },
                    { speaker: "Vaibhav Taneja", role: "CFO", text: "Net income was $2.5 billion.", metric: "Net Income", claimed: 2.5, unit: "billion" }
                ]
            },
            'JPM': {
                'Q4-2025': [
                    { speaker: "Jamie Dimon", role: "CEO", text: "Managed revenue was $39.9 billion.", metric: "Revenue", claimed: 39.9, unit: "billion" },
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Net income was $9.3 billion.", metric: "Net Income", claimed: 9.3, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Managed revenue was $40.7 billion.", metric: "Revenue", claimed: 40.7, unit: "billion" },
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Net income was $13.2 billion.", metric: "Net Income", claimed: 13.2, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Managed revenue was $42.4 billion.", metric: "Revenue", claimed: 42.4, unit: "billion" },
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Net income was $14.5 billion.", metric: "Net Income", claimed: 14.5, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Managed revenue was $39.3 billion.", metric: "Revenue", claimed: 39.3, unit: "billion" },
                    { speaker: "Jeremy Barnum", role: "CFO", text: "Net income was $12.6 billion.", metric: "Net Income", claimed: 12.6, unit: "billion" }
                ]
            },
            'JNJ': {
                'Q4-2025': [
                    { speaker: "Joaquin Duato", role: "CEO", text: "Reported sales were $21.4 billion.", metric: "Revenue", claimed: 21.4, unit: "billion" },
                    { speaker: "Joseph Wolk", role: "CFO", text: "Net earnings were $4.1 billion.", metric: "Net Income", claimed: 4.1, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "Joseph Wolk", role: "CFO", text: "Sales were $21.4 billion.", metric: "Revenue", claimed: 21.4, unit: "billion" },
                    { speaker: "Joseph Wolk", role: "CFO", text: "Net earnings were $4.3 billion.", metric: "Net Income", claimed: 4.3, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "Joseph Wolk", role: "CFO", text: "Sales were $25.5 billion.", metric: "Revenue", claimed: 25.5, unit: "billion" },
                    { speaker: "Joseph Wolk", role: "CFO", text: "Net earnings were $5.1 billion.", metric: "Net Income", claimed: 5.1, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "Joseph Wolk", role: "CFO", text: "Sales were $24.7 billion.", metric: "Revenue", claimed: 24.7, unit: "billion" },
                    { speaker: "Joseph Wolk", role: "CFO", text: "Net earnings were $0.1 billion loss due to one-time charge.", metric: "Net Income", claimed: -0.068, unit: "billion" }
                ]
            },
            'WMT': {
                'Q4-2025': [
                    { speaker: "Doug McMillon", role: "CEO", text: "Total revenue was $173.4 billion.", metric: "Revenue", claimed: 173.4, unit: "billion" },
                    { speaker: "John David Rainey", role: "CFO", text: "Consolidated net income was $5.5 billion.", metric: "Net Income", claimed: 5.5, unit: "billion" }
                ],
                'Q3-2025': [
                    { speaker: "John David Rainey", role: "CFO", text: "Total revenue was $160.8 billion.", metric: "Revenue", claimed: 160.8, unit: "billion" },
                    { speaker: "John David Rainey", role: "CFO", text: "Net income was $0.45 billion.", metric: "Net Income", claimed: 0.45, unit: "billion" }
                ],
                'Q2-2025': [
                    { speaker: "John David Rainey", role: "CFO", text: "Total revenue was $161.6 billion.", metric: "Revenue", claimed: 161.6, unit: "billion" },
                    { speaker: "John David Rainey", role: "CFO", text: "Net income was $7.9 billion.", metric: "Net Income", claimed: 7.9, unit: "billion" }
                ],
                'Q1-2025': [
                    { speaker: "John David Rainey", role: "CFO", text: "Total revenue was $152.3 billion.", metric: "Revenue", claimed: 152.3, unit: "billion" },
                    { speaker: "John David Rainey", role: "CFO", text: "Net income was $1.7 billion.", metric: "Net Income", claimed: 1.7, unit: "billion" }
                ]
            }
        };

        return mocks[ticker]?.[quarter] || this.getGenericDefaults(ticker);
    }

    getGenericDefaults(ticker) {
        return [
            {
                speaker: "CEO",
                role: "Chief Executive Officer",
                text: `${ticker} reported strong revenue results.`,
                metric: "Revenue",
                claimed: 10.0,
                unit: "billion"
            }
        ];
    }
}

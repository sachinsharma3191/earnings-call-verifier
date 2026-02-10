// Generate 100 sample claims across 10 companies for static demo
const companies = [
  { ticker: "AAPL", name: "Apple Inc.", execs: [["Tim Cook", "CEO"], ["Luca Maestri", "CFO"]] },
  { ticker: "NVDA", name: "NVIDIA Corporation", execs: [["Jensen Huang", "CEO"], ["Colette Kress", "CFO"]] },
  { ticker: "TSLA", name: "Tesla Inc.", execs: [["Elon Musk", "CEO"], ["Zachary Kirkhorn", "CFO"]] },
  { ticker: "MSFT", name: "Microsoft Corporation", execs: [["Satya Nadella", "CEO"], ["Amy Hood", "CFO"]] },
  { ticker: "GOOGL", name: "Alphabet Inc.", execs: [["Sundar Pichai", "CEO"], ["Ruth Porat", "CFO"]] },
  { ticker: "AMZN", name: "Amazon.com Inc.", execs: [["Andy Jassy", "CEO"], ["Brian Olsavsky", "CFO"]] },
  { ticker: "META", name: "Meta Platforms Inc.", execs: [["Mark Zuckerberg", "CEO"], ["Susan Li", "CFO"]] },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", execs: [["Jamie Dimon", "CEO"], ["Jeremy Barnum", "CFO"]] },
  { ticker: "JNJ", name: "Johnson & Johnson", execs: [["Joaquin Duato", "CEO"], ["Joseph Wolk", "CFO"]] },
  { ticker: "WMT", name: "Walmart Inc.", execs: [["Doug McMillon", "CEO"], ["John David Rainey", "CFO"]] }
];

const metrics = [
  { name: "Revenue", unit: "billion", baseRange: [20, 200] },
  { name: "Net Income", unit: "billion", baseRange: [5, 30] },
  { name: "Operating Income", unit: "billion", baseRange: [8, 40] },
  { name: "Gross Profit", unit: "billion", baseRange: [15, 80] },
  { name: "Gross Margin", unit: "percent", baseRange: [35, 75] },
  { name: "Operating Margin", unit: "percent", baseRange: [15, 45] }
];

const claimTemplates = {
  Revenue: [
    "Revenue for the quarter was $VALUE, up GROWTH% from a year ago",
    "We delivered $VALUE in revenue, representing GROWTH% year-over-year growth",
    "Total revenue came in at $VALUE for the quarter",
    "Q4 revenue reached $VALUE, exceeding our expectations"
  ],
  "Net Income": [
    "Net income was $VALUE, and earnings per diluted share were $EPS",
    "We reported net income of $VALUE for the quarter",
    "Net income came in at $VALUE, up GROWTH% year over year",
    "Our net income reached $VALUE this quarter"
  ],
  "Operating Income": [
    "Operating income came in at $VALUE, representing an operating margin of MARGIN%",
    "We generated $VALUE in operating income",
    "Operating income increased to $VALUE",
    "Operating income was $VALUE for the quarter"
  ],
  "Gross Profit": [
    "Gross profit was $VALUE, reflecting strong demand",
    "We achieved gross profit of $VALUE",
    "Gross profit came in at $VALUE for the quarter",
    "Our gross profit reached $VALUE"
  ],
  "Gross Margin": [
    "Our gross margin expanded to VALUE%, up 150 basis points year over year",
    "Gross margin came in at VALUE%, reflecting strong pricing power",
    "We maintained a gross margin of VALUE%",
    "Gross margin was VALUE% for the quarter"
  ],
  "Operating Margin": [
    "Operating margin improved to VALUE%",
    "We achieved an operating margin of VALUE%",
    "Operating margin was VALUE% for the quarter",
    "Our operating margin expanded to VALUE%"
  ]
};

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function generateClaim(ticker, idx, exec, metric) {
  const [speaker, role] = exec;
  const [min, max] = metric.baseRange;
  const actualValue = randomInRange(min, max);
  
  // 60% accurate, 30% discrepant, 10% unverifiable
  const rand = Math.random();
  let status, claimed, actual, difference, percentDiff, flag, severity;
  
  if (rand < 0.6) {
    // Accurate
    status = "accurate";
    claimed = actualValue + randomInRange(-actualValue * 0.03, actualValue * 0.03);
    actual = actualValue;
    difference = claimed - actual;
    percentDiff = (difference / actual) * 100;
    flag = null;
    severity = "low";
  } else if (rand < 0.9) {
    // Discrepant
    status = "discrepant";
    const discrepancy = randomInRange(0.05, 0.15);
    claimed = actualValue * (1 + discrepancy);
    actual = actualValue;
    difference = claimed - actual;
    percentDiff = (difference / actual) * 100;
    flag = difference > 0 ? "optimistic" : "conservative";
    severity = Math.abs(percentDiff) > 10 ? "high" : Math.abs(percentDiff) > 5 ? "moderate" : "low";
  } else {
    // Unverifiable
    status = "unverifiable";
    claimed = randomInRange(min, max);
    actual = null;
    difference = null;
    percentDiff = null;
    flag = null;
    severity = "low";
  }
  
  const templates = claimTemplates[metric.name];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const text = template
    .replace("VALUE", claimed.toFixed(metric.unit === "billion" ? 1 : 1))
    .replace("$VALUE", `$${claimed.toFixed(1)}${metric.unit === "billion" ? "B" : ""}`)
    .replace("GROWTH", (Math.random() * 50 + 5).toFixed(0))
    .replace("MARGIN", (Math.random() * 20 + 20).toFixed(1))
    .replace("$EPS", `$${(claimed / 15).toFixed(2)}`);
  
  return {
    id: `${ticker}_Q4_2024_${String(idx).padStart(3, '0')}`,
    speaker,
    role,
    text,
    metric: metric.name,
    claimed: parseFloat(claimed.toFixed(2)),
    actual: actual !== null ? parseFloat(actual.toFixed(2)) : null,
    unit: metric.unit,
    difference: difference !== null ? parseFloat(difference.toFixed(2)) : null,
    percentDiff: percentDiff !== null ? parseFloat(percentDiff.toFixed(2)) : null,
    status,
    flag,
    severity
  };
}

// Generate 10 claims per company = 100 total
const allClaims = [];
companies.forEach((company, companyIdx) => {
  for (let i = 0; i < 10; i++) {
    const exec = company.execs[i % 2];
    const metric = metrics[i % metrics.length];
    const claim = generateClaim(company.ticker, i + 1, exec, metric);
    allClaims.push({ ...claim, companyTicker: company.ticker, companyName: company.name });
  }
});

// Calculate stats
const accurate = allClaims.filter(c => c.status === "accurate").length;
const discrepant = allClaims.filter(c => c.status === "discrepant").length;
const unverifiable = allClaims.filter(c => c.status === "unverifiable").length;
const verifiable = accurate + discrepant;
const accuracyScore = verifiable > 0 ? ((accurate / verifiable) * 100).toFixed(1) : 0;

console.log(`Generated ${allClaims.length} claims:`);
console.log(`  Accurate: ${accurate}`);
console.log(`  Discrepant: ${discrepant}`);
console.log(`  Unverifiable: ${unverifiable}`);
console.log(`  Accuracy: ${accuracyScore}%`);
console.log(`\nCopy the claims array to verificationData.js`);


const cik = '0000320193'; // AAPL
const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;

async function inspect() {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, { headers: { 'User-Agent': 'EarningsVerifier/1.0', 'Accept': 'application/json' } });
    const data = await response.json();

    const facts = data.facts?.['us-gaap'];
    if (!facts) { console.log('No us-gaap facts found'); return; }

    const revenues = facts.RevenueFromContractWithCustomerExcludingAssessedTax || facts.Revenues;
    if (!revenues) { console.log('No Revenues found'); return; }

    const units = revenues.units?.USD || [];
    console.log(`Found ${units.length} revenue items.`);

    console.log('First 3 items:');
    console.log(JSON.stringify(units.slice(0, 3), null, 2));

    console.log('Last 3 items:');
    console.log(JSON.stringify(units.slice(-3), null, 2));
}

inspect();

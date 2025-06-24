# Banking Onboarding Browser Tests

This directory contains comprehensive browser tests for the banking onboarding application using Playwright for end-to-end testing and Artillery for load testing.

## Setup

1. **Install dependencies:**
   ```bash
   cd browser-tests
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run install-browsers
   ```

3. **Make sure the application is running:**
   ```bash
   # From the project root
   pnpm run dev
   ```

## Test Structure

```
browser-tests/
├── tests/
│   ├── onboarding-flow.spec.js      # Playwright E2E tests
│   └── artillery-functions.js        # Artillery test functions
├── utils/
│   └── data-generator.js            # Random test data generation
├── configs/
│   └── artillery-playwright.yml     # Artillery configuration
├── playwright.config.js             # Playwright configuration
└── package.json                     # Dependencies and scripts
```

## Random Data Generation

The `DataGenerator` class creates realistic test data including:

- **Customer Information**: Names, emails, phone numbers, addresses
- **Identification Data**: Various ID types (driver's license, passport, state ID, military ID)
- **Product Selection**: Random combinations of banking products
- **Edge Cases**: International customers without SSN, different billing addresses

## Running Tests

### Playwright E2E Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run with UI mode (interactive)
npm run test:playwright-ui

# Run in headed mode (see browser)
npm run test:playwright-headed
```

### Artillery Load Tests

```bash
# Run full load test scenario
npm run test:artillery

# Quick load test (5 users, 2 concurrent)
npm run test:artillery-quick

# Run all tests
npm run test:all
```

## Test Scenarios

### Playwright E2E Tests

1. **Complete Onboarding Flow**: 
   - Tests the full 5-step onboarding process with random data
   - Product selection → Customer info → Identification → Documents → Confirmation

2. **Edge Case - No SSN Customer**:
   - Tests international customer flow without Social Security Number
   - Uses passport identification with different validation rules

### Artillery Load Tests

1. **Complete Onboarding Flow (80% weight)**:
   - Standard onboarding flow with random data generation
   - Tests performance under realistic user scenarios

2. **No SSN Edge Case (20% weight)**:
   - International customer scenario for edge case testing
   - Ensures the application handles edge cases under load

## Load Test Configuration

The Artillery test runs in phases:
- **Warm up**: 30s @ 1 user/second
- **Ramp up**: 60s @ 2 users/second  
- **Sustained load**: 120s @ 5 users/second
- **Cool down**: 30s @ 1 user/second

## Browser Support

Playwright tests run against:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## Test Data Examples

The data generator creates realistic test data such as:

```javascript
{
  "products": ["checking", "savings"],
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "phoneNumber": "(555) 123-4567",
    "mailingAddress": {
      "street": "123 Main St",
      "city": "Anytown", 
      "state": "CA",
      "zipCode": "90210"
    }
  },
  "identificationInfo": {
    "identificationType": "drivers-license",
    "identificationNumber": "D1234567",
    "state": "CA",
    "socialSecurityNumber": "123-45-6789",
    "dateOfBirth": "1990-05-15"
  }
}
```

## Configuration

### Playwright Configuration

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Timeouts**: 60s test timeout, 15s action timeout
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots/Videos**: Captured on failure
- **Trace**: Recorded on first retry

### Artillery Configuration

- **Target**: `http://localhost:5173`
- **Engines**: Playwright with headless Chrome
- **Reporting**: Metrics by endpoint, 10s stats interval
- **Browser Options**: Optimized for load testing

## Troubleshooting

### Common Issues

1. **Application not running**: Ensure `pnpm run dev` is running from project root
2. **Port conflicts**: Check that port 5173 is available
3. **Browser installation**: Run `npm run install-browsers` if browsers are missing
4. **Timeout errors**: Increase timeouts in config if application is slow to respond

### Debug Mode

Run Playwright tests in debug mode:
```bash
npx playwright test --debug
```

### View Test Results

Playwright generates an HTML report:
```bash
npx playwright show-report
```

## Performance Metrics

Artillery tracks:
- **Response times**: P95, P99 percentiles
- **Success rates**: HTTP response codes
- **Throughput**: Requests per second
- **Errors**: Failed requests and reasons

## CI/CD Integration

The tests are configured for CI environments:
- Parallel execution disabled on CI
- Increased retry count (2)
- JSON/JUnit reporting for integration
- Webserver auto-start with proper timeouts
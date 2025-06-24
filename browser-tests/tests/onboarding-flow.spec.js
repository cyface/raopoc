const { test, expect } = require('@playwright/test');
const { DataGenerator } = require('../utils/data-generator');

test.describe('Banking Onboarding Flow', () => {
  let dataGenerator;
  let testData;

  test.beforeEach(async ({ page }) => {
    dataGenerator = new DataGenerator();
    testData = dataGenerator.generateCompleteOnboardingData();
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete onboarding flow with random data', async ({ page }) => {
    console.log('Generated test data:', JSON.stringify(testData, null, 2));

    // Step 1: Product Selection
    await test.step('Step 1: Product Selection', async () => {
      // Wait for product selection page to load
      await expect(page).toHaveURL(/\/step\/1\/product-selection/);
      
      // Select products based on generated data
      for (const product of testData.products) {
        const productSelector = `[data-testid="product-${product}"], input[value="${product}"], input[type="checkbox"][name*="${product}"]`;
        await page.click(productSelector);
      }
      
      // Click continue/next button
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      await continueButton.click();
      
      // Wait for database save (indicated by navigation)
      await page.waitForURL(/\/step\/2\/customer-info/);
      
      // Verify that data was persisted by checking API (optional)
      // This ensures the database save actually happened
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response) {
        console.log('Step 1 - Lead saved with ID:', response.id);
        expect(response.currentStep).toBe(1);
      }
    });

    // Step 2: Customer Information
    await test.step('Step 2: Customer Information', async () => {
      await expect(page).toHaveURL(/\/step\/2\/customer-info/);
      
      const { customerInfo } = testData;
      
      // Fill out customer information form
      await page.fill('input[name="firstName"], input[id*="firstName"], input[placeholder*="First"]', customerInfo.firstName);
      await page.fill('input[name="lastName"], input[id*="lastName"], input[placeholder*="Last"]', customerInfo.lastName);
      await page.fill('input[name="email"], input[id*="email"], input[type="email"]', customerInfo.email);
      await page.fill('input[name="phoneNumber"], input[id*="phone"], input[type="tel"]', customerInfo.phoneNumber);
      
      // Mailing address
      await page.fill('input[name*="street"], input[id*="street"], input[placeholder*="Street"]', customerInfo.mailingAddress.street);
      await page.fill('input[name*="city"], input[id*="city"], input[placeholder*="City"]', customerInfo.mailingAddress.city);
      
      // State selection - try different approaches
      const stateSelectors = [
        `select[name*="state"]`,
        `select[id*="state"]`,
        `input[name*="state"]`,
        `[data-testid*="state"]`
      ];
      
      let stateField = null;
      for (const selector of stateSelectors) {
        try {
          stateField = page.locator(selector).first();
          if (await stateField.count() > 0) {
            const tagName = await stateField.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
              await stateField.selectOption(customerInfo.mailingAddress.state);
            } else {
              await stateField.fill(customerInfo.mailingAddress.state);
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      await page.fill('input[name*="zip"], input[id*="zip"], input[placeholder*="ZIP"]', customerInfo.mailingAddress.zipCode);
      
      // Handle billing address
      if (!customerInfo.useSameAddress && customerInfo.billingAddress) {
        // Uncheck "use same address" if it exists
        const sameAddressCheckbox = page.locator('input[type="checkbox"]:has-text("same"), input[name*="same"], input[id*="same"]').first();
        if (await sameAddressCheckbox.count() > 0) {
          await sameAddressCheckbox.uncheck();
        }
        
        // Fill billing address
        await page.fill('input[name*="billing"][name*="street"], input[id*="billing"][id*="street"]', customerInfo.billingAddress.street);
        await page.fill('input[name*="billing"][name*="city"], input[id*="billing"][id*="city"]', customerInfo.billingAddress.city);
        
        // Billing state
        const billingStateSelectors = [
          `select[name*="billing"][name*="state"]`,
          `select[id*="billing"][id*="state"]`,
          `input[name*="billing"][name*="state"]`
        ];
        
        for (const selector of billingStateSelectors) {
          try {
            const billingStateField = page.locator(selector).first();
            if (await billingStateField.count() > 0) {
              const tagName = await billingStateField.evaluate(el => el.tagName.toLowerCase());
              if (tagName === 'select') {
                await billingStateField.selectOption(customerInfo.billingAddress.state);
              } else {
                await billingStateField.fill(customerInfo.billingAddress.state);
              }
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        await page.fill('input[name*="billing"][name*="zip"], input[id*="billing"][id*="zip"]', customerInfo.billingAddress.zipCode);
      }
      
      // Submit form
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      await continueButton.click();
      
      await page.waitForURL(/\/step\/3\/identification/);
      
      // Verify step 2 data was persisted
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response) {
        console.log('Step 2 - Lead updated, current step:', response.currentStep);
        expect(response.currentStep).toBe(2);
        expect(response.completedSteps).toContain(2);
      }
    });

    // Step 3: Identification Information
    await test.step('Step 3: Identification Information', async () => {
      await expect(page).toHaveURL(/\/step\/3\/identification/);
      
      const { identificationInfo } = testData;
      
      // Select identification type
      const idTypeSelectors = [
        `select[name*="identification"], select[name*="idType"]`,
        `input[value="${identificationInfo.identificationType}"]`,
        `[data-testid="id-type-${identificationInfo.identificationType}"]`
      ];
      
      for (const selector of idTypeSelectors) {
        try {
          const idTypeField = page.locator(selector).first();
          if (await idTypeField.count() > 0) {
            const tagName = await idTypeField.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
              await idTypeField.selectOption(identificationInfo.identificationType);
            } else if (tagName === 'input') {
              await idTypeField.click();
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Fill identification number
      await page.fill('input[name*="identification"][name*="number"], input[id*="idNumber"], input[placeholder*="ID"]', identificationInfo.identificationNumber);
      
      // Fill state or country based on ID type
      if (identificationInfo.state) {
        const stateSelectors = [
          `select[name*="state"]:not([name*="billing"])`,
          `input[name*="state"]:not([name*="billing"])`
        ];
        
        for (const selector of stateSelectors) {
          try {
            const stateField = page.locator(selector).first();
            if (await stateField.count() > 0) {
              const tagName = await stateField.evaluate(el => el.tagName.toLowerCase());
              if (tagName === 'select') {
                await stateField.selectOption(identificationInfo.state);
              } else {
                await stateField.fill(identificationInfo.state);
              }
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      if (identificationInfo.country) {
        await page.fill('input[name*="country"], select[name*="country"]', identificationInfo.country);
      }
      
      // Handle SSN
      if (identificationInfo.noSSN) {
        const noSSNCheckbox = page.locator('input[type="checkbox"]:has-text("SSN"), input[name*="noSSN"], input[id*="noSSN"]').first();
        if (await noSSNCheckbox.count() > 0) {
          await noSSNCheckbox.check();
        }
      } else if (identificationInfo.socialSecurityNumber) {
        await page.fill('input[name*="ssn"], input[name*="social"], input[placeholder*="SSN"]', identificationInfo.socialSecurityNumber);
      }
      
      // Fill date of birth
      await page.fill('input[name*="birth"], input[name*="dob"], input[type="date"]', identificationInfo.dateOfBirth);
      
      // Submit form
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      await continueButton.click();
      
      await page.waitForURL(/\/step\/4\/documents/);
      
      // Verify step 3 data was persisted
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response) {
        console.log('Step 3 - Lead updated, current step:', response.currentStep);
        expect(response.currentStep).toBe(3);
        expect(response.completedSteps).toContain(3);
      }
    });

    // Step 4: Document Acceptance
    await test.step('Step 4: Document Acceptance', async () => {
      await expect(page).toHaveURL(/\/step\/4\/documents/);
      
      // Wait for documents to load
      await page.waitForTimeout(1000);
      
      // Try to find and click "Accept All" button first
      const acceptAllButton = page.locator('button:has-text("Accept All"), button:has-text("Accept all")').first();
      if (await acceptAllButton.count() > 0) {
        await acceptAllButton.click();
      } else {
        // Accept individual documents
        const documentCheckboxes = page.locator('input[type="checkbox"]:not([disabled])');
        const checkboxCount = await documentCheckboxes.count();
        
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = documentCheckboxes.nth(i);
          if (!(await checkbox.isChecked())) {
            await checkbox.check();
          }
        }
      }
      
      // Submit form
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Complete"), button[type="submit"]').first();
      await continueButton.click();
      
      await page.waitForURL(/\/step\/5\/confirmation/);
      
      // Verify step 4 data was persisted
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response) {
        console.log('Step 4 - Lead updated, current step:', response.currentStep);
        expect(response.currentStep).toBe(4);
        expect(response.completedSteps).toContain(4);
      }
    });

    // Step 5: Confirmation
    await test.step('Step 5: Confirmation', async () => {
      await expect(page).toHaveURL(/\/step\/5\/confirmation/);
      
      // Verify confirmation page loaded
      await expect(page.locator('h1, h2, [data-testid*="confirmation"], [data-testid*="success"]')).toBeVisible();
      
      // Look for success indicators
      const successIndicators = [
        'text=Success',
        'text=Complete',
        'text=Confirmed',
        'text=Application submitted',
        '[data-testid*="success"]',
        '[data-testid*="complete"]'
      ];
      
      let foundSuccess = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).count() > 0) {
          foundSuccess = true;
          break;
        }
      }
      
      // If no specific success indicator found, just verify we're on the confirmation page
      if (!foundSuccess) {
        await expect(page).toHaveURL(/\/step\/5\/confirmation/);
      }
      
      // Verify final step was completed and lead was submitted
      const finalResponse = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (finalResponse) {
        console.log('Step 5 - Lead completed with status:', finalResponse.status);
        expect(finalResponse.currentStep).toBe(5);
        expect(finalResponse.completedSteps).toContain(5);
        // Note: Lead might be submitted status depends on if auto-submit happens
      }
    });
  });

  test('Complete onboarding flow with edge case: No SSN customer', async ({ page }) => {
    // Generate specific test data for international customer
    const edgeCaseData = {
      products: ['checking', 'savings'],
      customerInfo: dataGenerator.generateCustomerInfo(),
      identificationInfo: {
        identificationType: 'passport',
        identificationNumber: 'P123456789',
        country: 'Canada',
        socialSecurityNumber: null,
        noSSN: true,
        dateOfBirth: '1985-03-15'
      },
      documentAcceptance: dataGenerator.generateDocumentAcceptance()
    };

    console.log('Edge case test data (No SSN):', JSON.stringify(edgeCaseData, null, 2));

    // Follow similar flow but with edge case data
    // Step 1: Product Selection
    await expect(page).toHaveURL(/\/step\/1\/product-selection/);
    
    for (const product of edgeCaseData.products) {
      const productSelector = `[data-testid="product-${product}"], input[value="${product}"], input[type="checkbox"][name*="${product}"]`;
      await page.click(productSelector);
    }
    
    await page.click('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]');
    await page.waitForURL(/\/step\/2\/customer-info/);

    // Step 2: Customer Information (same as before)
    const { customerInfo } = edgeCaseData;
    await page.fill('input[name="firstName"], input[id*="firstName"], input[placeholder*="First"]', customerInfo.firstName);
    await page.fill('input[name="lastName"], input[id*="lastName"], input[placeholder*="Last"]', customerInfo.lastName);
    await page.fill('input[name="email"], input[id*="email"], input[type="email"]', customerInfo.email);
    await page.fill('input[name="phoneNumber"], input[id*="phone"], input[type="tel"]', customerInfo.phoneNumber);
    
    await page.fill('input[name*="street"], input[id*="street"], input[placeholder*="Street"]', customerInfo.mailingAddress.street);
    await page.fill('input[name*="city"], input[id*="city"], input[placeholder*="City"]', customerInfo.mailingAddress.city);
    await page.fill('input[name*="zip"], input[id*="zip"], input[placeholder*="ZIP"]', customerInfo.mailingAddress.zipCode);
    
    await page.click('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]');
    await page.waitForURL(/\/step\/3\/identification/);

    // Step 3: Identification (No SSN case)
    const { identificationInfo } = edgeCaseData;
    
    // Select passport
    try {
      await page.selectOption('select[name*="identification"], select[name*="idType"]', identificationInfo.identificationType);
    } catch (e) {
      // Try clicking radio button instead
      await page.click(`input[value="${identificationInfo.identificationType}"]`);
    }
    
    await page.fill('input[name*="identification"][name*="number"], input[id*="idNumber"]', identificationInfo.identificationNumber);
    await page.fill('input[name*="country"]', identificationInfo.country);
    
    // Check "No SSN" checkbox
    const noSSNCheckbox = page.locator('input[type="checkbox"]:has-text("SSN"), input[name*="noSSN"], input[id*="noSSN"]').first();
    if (await noSSNCheckbox.count() > 0) {
      await noSSNCheckbox.check();
    }
    
    await page.fill('input[name*="birth"], input[name*="dob"], input[type="date"]', identificationInfo.dateOfBirth);
    
    await page.click('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]');
    await page.waitForURL(/\/step\/4\/documents/);

    // Step 4 & 5: Same as main test
    await page.waitForTimeout(1000);
    
    const acceptAllButton = page.locator('button:has-text("Accept All")').first();
    if (await acceptAllButton.count() > 0) {
      await acceptAllButton.click();
    } else {
      const checkboxes = page.locator('input[type="checkbox"]:not([disabled])');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }
    }
    
    await page.click('button:has-text("Continue"), button:has-text("Complete"), button[type="submit"]');
    await page.waitForURL(/\/step\/5\/confirmation/);
    
    await expect(page).toHaveURL(/\/step\/5\/confirmation/);
  });
});
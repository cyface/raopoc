const { DataGenerator } = require('../utils/data-generator');

// Initialize data generator
const dataGenerator = new DataGenerator();

async function completeOnboardingFlow(page, context) {
  const testData = dataGenerator.generateCompleteOnboardingData();
  
  try {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Step 1: Product Selection
    await page.waitForSelector('[data-testid*="product"], input[type="checkbox"]', { timeout: 10000 });
    
    for (const product of testData.products) {
      const productSelectors = [
        `[data-testid="product-${product}"]`,
        `input[value="${product}"]`,
        `input[type="checkbox"][name*="${product}"]`
      ];
      
      let clicked = false;
      for (const selector of productSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            clicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        console.warn(`Could not find product selector for: ${product}`);
      }
    }
    
    await page.click('button[type="submit"], button:has-text("Continue"), button:has-text("Next")');
    await page.waitForURL(/\/step\/2/, { timeout: 15000 });
    
    // Verify step 1 was saved to database
    try {
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response && response.currentStep >= 1) {
        context.vars.step1Saved = true;
      }
    } catch (e) {
      console.warn('Could not verify step 1 database save');
    }

    // Step 2: Customer Information
    const { customerInfo } = testData;
    
    await page.fill('input[name="firstName"], input[id*="firstName"]', customerInfo.firstName);
    await page.fill('input[name="lastName"], input[id*="lastName"]', customerInfo.lastName);
    await page.fill('input[name="email"], input[type="email"]', customerInfo.email);
    await page.fill('input[name="phoneNumber"], input[type="tel"]', customerInfo.phoneNumber);
    
    // Address fields
    await page.fill('input[name*="street"]', customerInfo.mailingAddress.street);
    await page.fill('input[name*="city"]', customerInfo.mailingAddress.city);
    
    // Try to select state
    try {
      const stateSelect = await page.$('select[name*="state"]');
      if (stateSelect) {
        await stateSelect.selectOption(customerInfo.mailingAddress.state);
      } else {
        await page.fill('input[name*="state"]', customerInfo.mailingAddress.state);
      }
    } catch (e) {
      console.warn('Could not set state field');
    }
    
    await page.fill('input[name*="zip"]', customerInfo.mailingAddress.zipCode);
    
    // Handle billing address if different
    if (!customerInfo.useSameAddress && customerInfo.billingAddress) {
      try {
        const sameAddressCheckbox = await page.$('input[type="checkbox"][name*="same"]');
        if (sameAddressCheckbox) {
          await sameAddressCheckbox.uncheck();
        }
        
        await page.fill('input[name*="billing"][name*="street"]', customerInfo.billingAddress.street);
        await page.fill('input[name*="billing"][name*="city"]', customerInfo.billingAddress.city);
        await page.fill('input[name*="billing"][name*="zip"]', customerInfo.billingAddress.zipCode);
        
        const billingStateSelect = await page.$('select[name*="billing"][name*="state"]');
        if (billingStateSelect) {
          await billingStateSelect.selectOption(customerInfo.billingAddress.state);
        }
      } catch (e) {
        console.warn('Could not set billing address fields');
      }
    }
    
    await page.click('button[type="submit"], button:has-text("Continue"), button:has-text("Next")');
    await page.waitForURL(/\/step\/3/, { timeout: 15000 });
    
    // Verify step 2 was saved to database
    try {
      const response = await page.evaluate(() => {
        const sessionId = sessionStorage.getItem('onboarding-session-id');
        return sessionId ? fetch(`/api/leads/session/${sessionId}`).then(r => r.json()).catch(() => null) : null;
      });
      
      if (response && response.currentStep >= 2) {
        context.vars.step2Saved = true;
      }
    } catch (e) {
      console.warn('Could not verify step 2 database save');
    }

    // Step 3: Identification Information
    const { identificationInfo } = testData;
    
    // Select identification type
    try {
      const idTypeSelect = await page.$('select[name*="identification"], select[name*="idType"]');
      if (idTypeSelect) {
        await idTypeSelect.selectOption(identificationInfo.identificationType);
      } else {
        await page.click(`input[value="${identificationInfo.identificationType}"]`);
      }
    } catch (e) {
      console.warn('Could not set identification type');
    }
    
    await page.fill('input[name*="identification"][name*="number"], input[name*="idNumber"]', identificationInfo.identificationNumber);
    
    // Fill state or country
    if (identificationInfo.state) {
      try {
        const stateSelect = await page.$('select[name*="state"]:not([name*="billing"])');
        if (stateSelect) {
          await stateSelect.selectOption(identificationInfo.state);
        } else {
          await page.fill('input[name*="state"]:not([name*="billing"])', identificationInfo.state);
        }
      } catch (e) {
        console.warn('Could not set ID state');
      }
    }
    
    if (identificationInfo.country) {
      try {
        await page.fill('input[name*="country"], select[name*="country"]', identificationInfo.country);
      } catch (e) {
        console.warn('Could not set country');
      }
    }
    
    // Handle SSN
    if (identificationInfo.noSSN) {
      try {
        const noSSNCheckbox = await page.$('input[type="checkbox"][name*="noSSN"]');
        if (noSSNCheckbox) {
          await noSSNCheckbox.check();
        }
      } catch (e) {
        console.warn('Could not check No SSN checkbox');
      }
    } else if (identificationInfo.socialSecurityNumber) {
      try {
        await page.fill('input[name*="ssn"], input[name*="social"]', identificationInfo.socialSecurityNumber);
      } catch (e) {
        console.warn('Could not set SSN');
      }
    }
    
    // Date of birth
    try {
      await page.fill('input[name*="birth"], input[name*="dob"], input[type="date"]', identificationInfo.dateOfBirth);
    } catch (e) {
      console.warn('Could not set date of birth');
    }
    
    await page.click('button[type="submit"], button:has-text("Continue"), button:has-text("Next")');
    await page.waitForURL(/\/step\/4/, { timeout: 15000 });

    // Step 4: Document Acceptance
    await page.waitForTimeout(2000); // Wait for documents to load
    
    // Try to accept all documents
    try {
      const acceptAllButton = await page.$('button:has-text("Accept All")');
      if (acceptAllButton) {
        await acceptAllButton.click();
      } else {
        // Accept individual documents
        const checkboxes = await page.$$('input[type="checkbox"]:not([disabled])');
        for (const checkbox of checkboxes) {
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            await checkbox.check();
          }
        }
      }
    } catch (e) {
      console.warn('Could not accept documents');
    }
    
    await page.click('button[type="submit"], button:has-text("Continue"), button:has-text("Complete")');
    await page.waitForURL(/\/step\/5/, { timeout: 15000 });

    // Step 5: Confirmation
    await page.waitForSelector('h1, h2, [data-testid*="confirmation"]', { timeout: 10000 });
    
    // Mark as successful completion
    context.vars.flowCompleted = true;
    
  } catch (error) {
    console.error('Flow failed:', error.message);
    context.vars.flowCompleted = false;
    throw error;
  }
}

async function completeOnboardingFlowNoSSN(page, context) {
  const edgeCaseData = {
    products: ['checking', 'savings'],
    customerInfo: dataGenerator.generateCustomerInfo(),
    identificationInfo: {
      identificationType: 'passport',
      identificationNumber: 'P' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      country: 'Canada',
      socialSecurityNumber: null,
      noSSN: true,
      dateOfBirth: '1985-03-15'
    },
    documentAcceptance: dataGenerator.generateDocumentAcceptance()
  };
  
  try {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Step 1: Product Selection
    await page.waitForSelector('[data-testid*="product"], input[type="checkbox"]', { timeout: 10000 });
    
    for (const product of edgeCaseData.products) {
      try {
        await page.click(`[data-testid="product-${product}"], input[value="${product}"]`);
      } catch (e) {
        console.warn(`Could not select product: ${product}`);
      }
    }
    
    await page.click('button[type="submit"], button:has-text("Continue")');
    await page.waitForURL(/\/step\/2/, { timeout: 15000 });

    // Step 2: Customer Information (simplified)
    const { customerInfo } = edgeCaseData;
    
    await page.fill('input[name="firstName"]', customerInfo.firstName);
    await page.fill('input[name="lastName"]', customerInfo.lastName);
    await page.fill('input[name="email"]', customerInfo.email);
    await page.fill('input[name="phoneNumber"]', customerInfo.phoneNumber);
    await page.fill('input[name*="street"]', customerInfo.mailingAddress.street);
    await page.fill('input[name*="city"]', customerInfo.mailingAddress.city);
    await page.fill('input[name*="zip"]', customerInfo.mailingAddress.zipCode);
    
    try {
      const stateSelect = await page.$('select[name*="state"]');
      if (stateSelect) {
        await stateSelect.selectOption(customerInfo.mailingAddress.state);
      }
    } catch (e) {
      console.warn('Could not set state');
    }
    
    await page.click('button[type="submit"], button:has-text("Continue")');
    await page.waitForURL(/\/step\/3/, { timeout: 15000 });

    // Step 3: Identification Information (No SSN case)
    const { identificationInfo } = edgeCaseData;
    
    // Select passport
    try {
      const idTypeSelect = await page.$('select[name*="identification"]');
      if (idTypeSelect) {
        await idTypeSelect.selectOption('passport');
      } else {
        await page.click('input[value="passport"]');
      }
    } catch (e) {
      console.warn('Could not select passport');
    }
    
    await page.fill('input[name*="identification"][name*="number"]', identificationInfo.identificationNumber);
    
    try {
      await page.fill('input[name*="country"]', identificationInfo.country);
    } catch (e) {
      console.warn('Could not set country');
    }
    
    // Check No SSN
    try {
      const noSSNCheckbox = await page.$('input[type="checkbox"][name*="noSSN"]');
      if (noSSNCheckbox) {
        await noSSNCheckbox.check();
      }
    } catch (e) {
      console.warn('Could not check No SSN');
    }
    
    try {
      await page.fill('input[type="date"]', identificationInfo.dateOfBirth);
    } catch (e) {
      console.warn('Could not set date of birth');
    }
    
    await page.click('button[type="submit"], button:has-text("Continue")');
    await page.waitForURL(/\/step\/4/, { timeout: 15000 });

    // Step 4 & 5: Same as main flow
    await page.waitForTimeout(2000);
    
    try {
      const acceptAllButton = await page.$('button:has-text("Accept All")');
      if (acceptAllButton) {
        await acceptAllButton.click();
      } else {
        const checkboxes = await page.$$('input[type="checkbox"]:not([disabled])');
        for (const checkbox of checkboxes) {
          await checkbox.check();
        }
      }
    } catch (e) {
      console.warn('Could not accept documents');
    }
    
    await page.click('button[type="submit"], button:has-text("Complete")');
    await page.waitForURL(/\/step\/5/, { timeout: 15000 });
    
    await page.waitForSelector('h1, h2', { timeout: 10000 });
    
    context.vars.flowCompleted = true;
    
  } catch (error) {
    console.error('No SSN flow failed:', error.message);
    context.vars.flowCompleted = false;
    throw error;
  }
}

module.exports = {
  completeOnboardingFlow,
  completeOnboardingFlowNoSSN
};
const { faker } = require('@faker-js/faker');

class DataGenerator {
  constructor() {
    this.usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    this.identificationTypes = [
      'drivers-license',
      'state-id',
      'passport',
      'military-id'
    ];

    this.productTypes = [
      'checking',
      'savings',
      'money-market'
    ];
  }

  generateCustomerInfo() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const phoneNumber = faker.phone.number('(###) ###-####');
    
    const mailingAddress = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.helpers.arrayElement(this.usStates),
      zipCode: faker.location.zipCode('#####')
    };

    // 70% chance of using same address for billing
    const useSameAddress = faker.datatype.boolean({ probability: 0.7 });
    
    let billingAddress = null;
    if (!useSameAddress) {
      billingAddress = {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement(this.usStates),
        zipCode: faker.location.zipCode('#####')
      };
    }

    return {
      firstName,
      lastName,
      email,
      phoneNumber,
      mailingAddress,
      useSameAddress,
      billingAddress
    };
  }

  generateIdentificationInfo() {
    const identificationType = faker.helpers.arrayElement(this.identificationTypes);
    const dateOfBirth = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });
    
    // 10% chance of being international customer without SSN
    const noSSN = faker.datatype.boolean({ probability: 0.1 });
    
    let identificationNumber;
    let state = null;
    let country = null;

    switch (identificationType) {
      case 'drivers-license':
        identificationNumber = faker.string.alphanumeric({ length: 8, casing: 'upper' });
        state = faker.helpers.arrayElement(this.usStates);
        break;
      case 'state-id':
        identificationNumber = faker.string.alphanumeric({ length: 8, casing: 'upper' });
        state = faker.helpers.arrayElement(this.usStates);
        break;
      case 'passport':
        identificationNumber = faker.string.alphanumeric({ length: 9, casing: 'upper' });
        country = noSSN ? faker.location.country() : 'United States';
        break;
      case 'military-id':
        identificationNumber = 'M' + faker.string.numeric({ length: 9 });
        break;
    }

    return {
      identificationType,
      identificationNumber,
      state,
      country,
      socialSecurityNumber: noSSN ? null : faker.string.numeric({ length: 9 }).replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3'),
      noSSN,
      dateOfBirth: dateOfBirth.toISOString().split('T')[0]
    };
  }

  generateProductSelection() {
    // Generate 1-3 products randomly
    const numProducts = faker.number.int({ min: 1, max: 3 });
    const selectedProducts = faker.helpers.arrayElements(this.productTypes, numProducts);
    
    // Ensure checking is often selected (80% chance)
    if (faker.datatype.boolean({ probability: 0.8 }) && !selectedProducts.includes('checking')) {
      selectedProducts.push('checking');
    }

    return selectedProducts;
  }

  generateDocumentAcceptance() {
    const now = new Date().toISOString();
    
    return {
      acceptances: {
        'terms-of-service': {
          documentId: 'terms-of-service',
          accepted: true,
          acceptedAt: now
        },
        'privacy-policy': {
          documentId: 'privacy-policy',
          accepted: true,
          acceptedAt: now
        },
        'account-agreement': {
          documentId: 'account-agreement',
          accepted: true,
          acceptedAt: now
        }
      },
      allAccepted: true
    };
  }

  generateCompleteOnboardingData() {
    return {
      products: this.generateProductSelection(),
      customerInfo: this.generateCustomerInfo(),
      identificationInfo: this.generateIdentificationInfo(),
      documentAcceptance: this.generateDocumentAcceptance()
    };
  }

  // Helper method to format phone number for input
  formatPhoneForInput(phoneNumber) {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    // Format as (###) ###-####
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // Helper method to format date for input
  formatDateForInput(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

module.exports = { DataGenerator };
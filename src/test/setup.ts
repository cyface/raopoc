import '@testing-library/jest-dom'
import { beforeAll, afterAll } from 'vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Initialize i18n for testing  
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    resources: {
      en: {
        translation: {
          'common.next': 'Next',
          'common.continue': 'Continue',
          'common.darkMode': 'Dark mode',
          'common.lightMode': 'Light mode',
          'productSelection.title': "Let's Open Your Account!",
          'productSelection.subtitle': 'Select the account types you\'d like to open. You can choose multiple options.',
          'productSelection.selectedProducts': 'Selected Products:',
          'customerInfo.title': 'Personal Information',
          'customerInfo.subtitle': 'Please provide your contact information and addresses for your new account(s).',
          'customerInfo.personalDetails': 'Personal Details',
          'customerInfo.firstName': 'First Name',
          'customerInfo.lastName': 'Last Name',
          'customerInfo.emailAddress': 'Email Address',
          'customerInfo.phoneNumber': 'Phone Number',
          'customerInfo.mailingAddress': 'Mailing Address',
          'customerInfo.billingAddress': 'Billing Address',
          'customerInfo.streetAddress': 'Street Address',
          'customerInfo.city': 'City',
          'customerInfo.state': 'State',
          'customerInfo.zipCode': 'ZIP Code',
          'customerInfo.useSameAddress': 'Use same address for billing',
          'customerInfo.placeholders.email': 'name@example.com',
          'customerInfo.placeholders.phone': '(555) 123-4567',
          'customerInfo.placeholders.zipCode': '12345',
          'customerInfo.placeholders.selectState': 'Select a state',
          'documentAcceptance.title': 'Review Required Documents',
          'documentAcceptance.subtitle': 'Please review and accept the following documents to continue with your account opening.',
          'documentAcceptance.loading': 'Loading document requirements...',
          'documentAcceptance.noDocumentsRequired': 'No additional documents are required for your selected products.',
          'documentAcceptance.acceptText': 'I have read and accept the {{documentName}}',
          'documentAcceptance.acceptAllDocuments': 'Accept All Documents',
          'documentAcceptance.view': 'View',
          'documentAcceptance.download': 'Download',
          'documentAcceptance.viewDocument': 'View Document',
          'documentAcceptance.downloadDocument': 'Download Document',
          'documentAcceptance.errors.failedToLoad': 'Failed to load document requirements',
          'identificationInfo.title': 'Identity Verification',
          'identificationInfo.subtitle': 'Please provide your identification details for account verification.',
          'identificationInfo.identificationType': 'Identification Type',
          'identificationInfo.passportNumber': 'Passport Number',
          'identificationInfo.driversLicenseNumber': 'Driver\'s License Number',
          'identificationInfo.stateIdNumber': 'State ID Number',
          'identificationInfo.militaryIdNumber': 'Military ID Number',
          'identificationInfo.issuingState': 'Issuing State',
          'identificationInfo.issuingCountry': 'Issuing Country',
          'identificationInfo.dateOfBirth': 'Date of Birth',
          'identificationInfo.socialSecurityInformation': 'Social Security Information',
          'identificationInfo.socialSecurityNumber': 'Social Security Number',
          'identificationInfo.noSSN': 'I don\'t have a Social Security Number',
          'confirmationScreen.submitting.title': 'Submitting Your Application',
          'confirmationScreen.submitting.message': 'Please wait while we process your information...',
          'confirmationScreen.success.title': 'Application Submitted Successfully!',
          'confirmationScreen.success.applicationId': 'Application ID',
          'confirmationScreen.success.submitted': 'Submitted',
          'bankInfo.defaultName': 'Cool Bank'
        }
      }
    }
  })

// Suppress jsdom navigation errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
# i18n Architecture Design

## Overview
New internationalization architecture supporting:
- Flat key structure for easier management
- Split translation files by feature/domain
- Separate folders per language
- Dynamic loading from filesystem or API
- No rebuild required for translation updates

## Directory Structure
```
translations/
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── products.json
│   ├── customer-info.json
│   ├── identification.json
│   ├── documents.json
│   ├── confirmation.json
│   ├── validation.json
│   └── bank-info.json
├── es/
│   ├── common.json
│   ├── navigation.json
│   ├── products.json
│   ├── customer-info.json
│   ├── identification.json
│   ├── documents.json
│   ├── confirmation.json
│   ├── validation.json
│   └── bank-info.json
└── [other-languages]/
```

## Key Structure
Flat keys with dot notation for logical grouping:
```json
{
  "common.next": "Next",
  "common.previous": "Previous",
  "customerInfo.title": "Personal Information",
  "customerInfo.firstName.label": "First Name",
  "customerInfo.firstName.placeholder": "Enter your first name",
  "validation.required": "This field is required",
  "validation.email.invalid": "Please enter a valid email"
}
```

## Loading Strategy
1. **Development**: Load from local filesystem via API endpoint
2. **Production**: Load from API or CDN
3. **Fallback**: Bundle minimal core translations

## Translation Sources
- **Primary**: External translation management system writes to filesystem
- **Secondary**: API endpoint for dynamic updates
- **Cache**: Local storage with TTL for performance

## Benefits
- No rebuild/redeploy for translation updates
- Easy integration with translation tools
- Clear separation by feature
- Supports A/B testing of translations
- Per-tenant/bank customization possible
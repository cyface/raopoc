import { getApiUrl } from '../utils/apiUrl'

export interface LeadData {
  id?: string
  sessionId?: string
  currentStep: number
  completedSteps: number[]
  selectedProducts?: string[]
  customerInfo?: any
  identificationInfo?: any
  status?: string
  financialInstitution?: string
  language?: string
  theme?: string
}

export interface StepUpdateData {
  currentStep: number
  completedSteps?: number[]
  stepData?: any
}

class LeadService {
  private apiUrl: string

  constructor() {
    this.apiUrl = getApiUrl()
  }

  private async getSessionId(): Promise<string> {
    // Get session ID from session storage or generate a new one
    let sessionId = sessionStorage.getItem('onboarding-session-id')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('onboarding-session-id', sessionId)
    }
    return sessionId
  }

  private async getCurrentLead(): Promise<LeadData | null> {
    try {
      const sessionId = await this.getSessionId()
      const response = await fetch(`${this.apiUrl}/leads/session/${sessionId}`)
      
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error getting current lead:', error)
      return null
    }
  }

  async createOrUpdateLead(data: Partial<LeadData>): Promise<LeadData> {
    try {
      const sessionId = await this.getSessionId()
      
      const leadData = {
        sessionId,
        currentStep: data.currentStep || 1,
        completedSteps: data.completedSteps || [1],
        ...data
      }


      const response = await fetch(`${this.apiUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      })


      if (!response.ok) {
        throw new Error(`Failed to create/update lead: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Store lead ID for future updates
      sessionStorage.setItem('onboarding-lead-id', result.id)
      
      return result
    } catch (error) {
      console.error('Error creating/updating lead:', error)
      throw error
    }
  }

  async updateStep(stepData: StepUpdateData): Promise<LeadData> {
    try {
      const leadId = sessionStorage.getItem('onboarding-lead-id')
      
      if (!leadId) {
        // If no lead ID, create a new lead
        return this.createOrUpdateLead({
          currentStep: stepData.currentStep,
          completedSteps: stepData.completedSteps
        })
      }

      const response = await fetch(`${this.apiUrl}/leads/${leadId}/step`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData)
      })

      if (!response.ok) {
        throw new Error(`Failed to update step: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating step:', error)
      throw error
    }
  }

  async saveProductSelection(selectedProducts: string[]): Promise<LeadData> {
    return this.createOrUpdateLead({
      currentStep: 1,
      completedSteps: [1],
      selectedProducts
    })
  }

  async saveCustomerInfo(customerInfo: any, selectedProducts?: string[]): Promise<LeadData> {
    const currentLead = await this.getCurrentLead()
    
    // If no current lead exists, create one with the selected products
    if (!currentLead) {
      return this.createOrUpdateLead({
        currentStep: 2,
        completedSteps: [1, 2],
        selectedProducts,
        customerInfo
      })
    }
    
    // If lead exists, update it
    const completedSteps = [...(currentLead.completedSteps || [1]), 2]
    
    return this.updateStep({
      currentStep: 2,
      completedSteps: Array.from(new Set(completedSteps)), // Remove duplicates
      stepData: { customerInfo }
    })
  }

  async saveIdentificationInfo(identificationInfo: any): Promise<LeadData> {
    const currentLead = await this.getCurrentLead()
    const completedSteps = [...(currentLead?.completedSteps || [1, 2]), 3]
    
    return this.updateStep({
      currentStep: 3,
      completedSteps: Array.from(new Set(completedSteps)), // Remove duplicates
      stepData: { identificationInfo }
    })
  }

  async saveDocumentAcceptances(acceptances: any[]): Promise<void> {
    try {
      const leadId = sessionStorage.getItem('onboarding-lead-id')
      
      if (!leadId) {
        throw new Error('No lead ID found')
      }

      // First update the step
      const currentLead = await this.getCurrentLead()
      const completedSteps = [...(currentLead?.completedSteps || [1, 2, 3]), 4]
      
      await this.updateStep({
        currentStep: 4,
        completedSteps: Array.from(new Set(completedSteps))
      })

      // Then update document acceptances
      const response = await fetch(`${this.apiUrl}/leads/${leadId}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acceptances })
      })

      if (!response.ok) {
        throw new Error(`Failed to save document acceptances: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error saving document acceptances:', error)
      throw error
    }
  }

  async completeOnboarding(): Promise<LeadData> {
    const currentLead = await this.getCurrentLead()
    const completedSteps = [...(currentLead?.completedSteps || [1, 2, 3, 4]), 5]
    
    return this.updateStep({
      currentStep: 5,
      completedSteps: Array.from(new Set(completedSteps))
    })
  }

  async submitLead(): Promise<LeadData> {
    try {
      const leadId = sessionStorage.getItem('onboarding-lead-id')
      
      if (!leadId) {
        throw new Error('No lead ID found')
      }

      const response = await fetch(`${this.apiUrl}/leads/${leadId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to submit lead: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Clear session data after successful submission
      sessionStorage.removeItem('onboarding-session-id')
      sessionStorage.removeItem('onboarding-lead-id')
      
      return result
    } catch (error) {
      console.error('Error submitting lead:', error)
      throw error
    }
  }

  async getLeadProgress(): Promise<LeadData | null> {
    return this.getCurrentLead()
  }

  clearSession(): void {
    sessionStorage.removeItem('onboarding-session-id')
    sessionStorage.removeItem('onboarding-lead-id')
  }
}

export const leadService = new LeadService()
export default leadService
export const validateTourPayload = (tour_details, plan_details) => {
    const validDays = [3, 5, 7];
  
    const validateTourDetails = (details) => {
      if (
        !details.title ||
        typeof details.title !== 'string' ||
        !details.title.trim()
      ) {
        return {
          isValid: false,
          message: "Tour title is required and must be a non-empty string"
        }
      }
  
      if (
        !details.country ||
        typeof details.country !== 'string' ||
        !details.country.trim()
      ) {
        return {
          isValid: false,
          message: "Country is required and must be a non-empty string"
        }
      }
  
      return { isValid: true }
    }
  
    const validatePlan = (plan, index = 0) => {
      if (!plan.days || !validDays.includes(plan.days)) {
        return {
          isValid: false,
          message: `Plan ${index + 1}: 'days' must be one of [3, 5, 7]`
        }
      }
  
      if (typeof plan.budget !== 'number' || plan.budget <= 0) {
        return {
          isValid: false,
          message: `Plan ${index + 1}: 'budget' must be a positive number`
        }
      }
  
      if (!plan.title || typeof plan.title !== 'string' || !plan.title.trim()) {
        return {
          isValid: false,
          message: `Plan ${index + 1}: 'title' is required and must be a string`
        }
      }
  
      if (!Array.isArray(plan.placesCovered) || plan.placesCovered.length === 0) {
        return {
          isValid: false,
          message: `Plan ${index + 1}: 'placesCovered' must be a non-empty array`
        }
      }
  
      for (let j = 0; j < plan.placesCovered.length; j++) {
        const place = plan.placesCovered[j];
        if (!place.name || typeof place.name !== 'string' || !place.name.trim()) {
          return {
            isValid: false,
            message: `Plan ${index + 1}, Place ${j + 1}: 'name' is required and must be a string`
          }
        }
      }
  
      return { isValid: true }
    }

    if (tour_details) {
      const result = validateTourDetails(tour_details)
      if (!result.isValid) return result
    }
  
    if (!Array.isArray(plan_details) || plan_details.length === 0) {
      return {
        isValid: false,
        message: "At least one plan is required"
      }
    }
  
    for (let i = 0; i < plan_details.length; i++) {
      const result = validatePlan(plan_details[i], i);
      if (!result.isValid) return result
    }
  
    return { isValid: true }
  }
  
export const validateTourPayload = (payload) => {
  const requiredFields = ['title', 'country', 'days', 'budget', 'plan_title']
  for (const field of requiredFields) {
    if (!payload[field]) {
      return {
        isValid: false,
        message: `${field} is required`,
      };
    }
  }

  if (![3, 5, 7].includes(Number(payload.days))) {
    return {
      isValid: false,
      message: `Days must be one of [3, 5, 7]`,
    };
  }

  if (!Array.isArray(payload.inclusions) || !Array.isArray(payload.exclusions)) {
    return {
      isValid: false,
      message: `Inclusions and Exclusions must be arrays`,
    };
  }

  if (!Array.isArray(payload.places_covered)) {
    return {
      isValid: false,
      message: `places_covered must be an array`,
    };
  }

  for (const place of payload.places_covered) {
    if (!place.name) {
      return {
        isValid: false,
        message: `Each place_covered must have a name`,
      };
    }
  }

  return { isValid: true, message: 'Valid' };
};

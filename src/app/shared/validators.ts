import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function prescriptionFileRequired(requiresPrescription: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!requiresPrescription) {
      return null;
    }
    const file = control.value;
    if (!file || (typeof file === 'string' && !file.trim()) || (file instanceof File && !file.name)) {
      return { prescriptionRequired: 'A doctor\'s prescription file is required to purchase restricted items.' };
    }
    return null;
  };
}

// Custom validator-1 to enforce quantity limits based on prescription requirements - allows max 5 units for prescription meds and 30 for non-prescription
export function quantityLimitValidator(isPrescriptionRequired: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const qty = Number(control.value);
    if (isNaN(qty) || qty <= 0) {
      return { invalidQuantity: 'Quantity must be a positive integer.' };
    }
    const limit = isPrescriptionRequired ? 5 : 30;
    if (qty > limit) {
      return {
        quantityLimitExceeded: {
          maxAllowed: limit,
          actual: qty,
          message: Maximum allowed quantity for this product is ${limit} units.
        }
      };
    }
    return null;
  };
}

//custom validator-2 to check if user is at least 18 years old based on their date of birth input - used for restricted chronic care medications
export function ageEligibilityValidator(minAge: number = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const birthDateStr = control.value;
    if (!birthDateStr) {
      return null; 
    }

    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) {
      return { invalidDateFormat: 'Please enter a valid date.' };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < minAge) {
      return {
        underage: {
          minAge,
          actualAge: age,
          message: You must be at least ${minAge} years old to purchase restricted chronic care medications.
        }
      };
    }

    return null;
  };
}

// custom validator3 to prevent adding duplicate medicines to cart - checks if the selected medicine ID already exists in the cart and returns an error if so
export function duplicateMedicineValidator(existingMedicineIds: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selection = control.value;
    if (!selection) return null;

    if (existingMedicineIds.includes(selection)) {
      return { duplicateMedicine: 'This medication is already in your cart. Adjust its quantity instead.' };
    }
    return null;
  };
}

// custom validator4 to ensure delivery slots are at least 4 hours in the future to allow for review and preparation
export function deliverySlotValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedDateTimeStr = control.value;
    if (!selectedDateTimeStr) {
      return null;
    }

    const selectedDateTime = new Date(selectedDateTimeStr);
    if (isNaN(selectedDateTime.getTime())) {
      return { invalidDate: 'Invalid delivery date and time.' };
    }

    const currentDateTime = new Date();
    const minRequiredTime = new Date(currentDateTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours in future

    if (selectedDateTime.getTime() < minRequiredTime.getTime()) {
      return {
        insufficientLeadTime: {
          message: 'Delivery slots must be scheduled at least 4 hours in advance to allow review and preparation.'
        }
      };
    }

    return null;
  };
}
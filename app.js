// Application data
const appData = {
    businessWhatsAppNumber: "9408694686",
    companyName: "Navkar Insurance Services",
    vehicleMakes: ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Ford", "Renault", "Kia", "MG", "Nissan", "Skoda", "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Others"],
    ncbOptions: ["0%", "20%", "25%", "35%", "45%", "50%"],
    yearRange: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
    formSteps: [
        {
            id: 1,
            title: "Personal Information",
            description: "Basic contact details"
        },
        {
            id: 2, 
            title: "Vehicle Information",
            description: "Details about your vehicle"
        },
        {
            id: 3,
            title: "Policy Information", 
            description: "Insurance policy details"
        },
        {
            id: 4,
            title: "Review & Submit",
            description: "Review and submit your quotation request"
        }
    ]
};

// Form state management (no localStorage usage)
let currentStep = 1;
let formData = {};
const totalSteps = 4;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing form...');
    initializeForm();
    updateProgressIndicator();
    updateNavigationButtons();
    setupEventListeners();
});

// Initialize form with data
function initializeForm() {
    populateDropdowns();
    
    // Set max date for date inputs
    const today = new Date().toISOString().split('T')[0];
    const eighteenYearsAgo = new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dobField = document.getElementById('dateOfBirth');
    const regField = document.getElementById('dateOfRegistration');
    const policyField = document.getElementById('policyExpiryDate');
    
    if (dobField) dobField.max = eighteenYearsAgo;
    if (regField) regField.max = today;
    if (policyField) policyField.min = '2020-01-01';
    
    // Initialize policy details visibility
    const previousPolicyDetails = document.getElementById('previousPolicyDetails');
    const noPreviousPolicyDetails = document.getElementById('noPreviousPolicyDetails');
    
    if (previousPolicyDetails) previousPolicyDetails.classList.remove('hidden');
    if (noPreviousPolicyDetails) noPreviousPolicyDetails.classList.add('hidden');
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Add change listeners to form inputs
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            handleFieldChange(this);
        });
        input.addEventListener('change', function() {
            handleFieldChange(this);
        });
    });

    // Format registration number
    const regField = document.getElementById('registrationNumber');
    if (regField) {
        regField.addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            e.target.value = value;
            handleFieldChange(e.target);
        });
    }

    // Format mobile numbers to digits only
    const mobileField = document.getElementById('mobileNumber');
    if (mobileField) {
        mobileField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '').substring(0, 10);
            e.target.value = value;
            handleFieldChange(e.target);
        });
    }

    // Setup step indicator clicks
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            const targetStep = index + 1;
            if (targetStep <= currentStep || targetStep === currentStep + 1) {
                if (targetStep > currentStep && !validateCurrentStep()) {
                    return;
                }
                goToStep(targetStep);
            }
        });
    });
}

// Handle field changes
function handleFieldChange(field) {
    if (!field.name && !field.id) return;
    
    const key = field.name || field.id;
    
    if (field.type === 'radio') {
        if (field.checked) {
            formData[key] = field.value;
            if (field.name === 'hasPreviousPolicy') {
                handlePreviousPolicyToggle();
            }
        }
    } else if (field.type === 'checkbox') {
        formData[key] = field.checked;
    } else {
        formData[key] = field.value;
    }
    
    // Clear any error styling
    field.style.borderColor = '';
    const errorElement = document.getElementById(`${key}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Handle previous policy toggle
function handlePreviousPolicyToggle() {
    const hasPreviousPolicy = document.querySelector('input[name="hasPreviousPolicy"]:checked');
    const previousPolicyDetails = document.getElementById('previousPolicyDetails');
    const noPreviousPolicyDetails = document.getElementById('noPreviousPolicyDetails');
    
    if (hasPreviousPolicy) {
        const hasPolicy = hasPreviousPolicy.value === 'Yes';
        
        if (hasPolicy) {
            previousPolicyDetails.classList.remove('hidden');
            noPreviousPolicyDetails.classList.add('hidden');
            
            // Make insurance status required
            const statusRadios = document.querySelectorAll('input[name="insuranceStatus"]');
            statusRadios.forEach(radio => radio.required = true);
        } else {
            previousPolicyDetails.classList.add('hidden');
            noPreviousPolicyDetails.classList.remove('hidden');
            
            // Remove insurance status requirement
            const statusRadios = document.querySelectorAll('input[name="insuranceStatus"]');
            statusRadios.forEach(radio => {
                radio.required = false;
                radio.checked = false;
            });
            
            // Clear optional policy fields from formData
            ['insuranceStatus', 'previousInsurer', 'policyExpiryDate', 'ncb', 'claimsLastThreeYears', 'policyExpired90Days'].forEach(field => {
                delete formData[field];
            });
        }
    }
}

// Populate dropdown options
function populateDropdowns() {
    // Populate vehicle makes dropdown
    const makeSelect = document.getElementById('vehicleMake');
    if (makeSelect) {
        makeSelect.innerHTML = '<option value="">Select Make</option>';
        appData.vehicleMakes.forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeSelect.appendChild(option);
        });
    }

    // Populate year dropdown
    const yearSelect = document.getElementById('yearOfManufacture');
    if (yearSelect) {
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        appData.yearRange.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    // Populate NCB dropdown
    const ncbSelect = document.getElementById('ncb');
    if (ncbSelect) {
        ncbSelect.innerHTML = '<option value="">Select NCB</option>';
        appData.ncbOptions.forEach(ncb => {
            const option = document.createElement('option');
            option.value = ncb;
            option.textContent = ncb;
            ncbSelect.appendChild(option);
        });
    }
}

// Navigation functions
function changeStep(direction) {
    console.log(`Attempting to change step by ${direction}. Current step: ${currentStep}`);
    
    if (direction === 1) {
        // Validate before moving forward
        if (!validateCurrentStep()) {
            console.log('Validation failed, not advancing step');
            return false;
        }
        if (currentStep < totalSteps) {
            currentStep++;
            console.log(`Advanced to step: ${currentStep}`);
        }
    } else if (direction === -1) {
        if (currentStep > 1) {
            currentStep--;
            console.log(`Moved back to step: ${currentStep}`);
        }
    }
    
    if (currentStep === 4) {
        populateReviewSection();
    }
    
    showStep(currentStep);
    updateProgressIndicator();
    updateNavigationButtons();
    
    // Scroll to top of form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    return true;
}

// Go to specific step
function goToStep(step) {
    console.log(`Going to step: ${step}`);
    currentStep = step;
    
    if (currentStep === 4) {
        populateReviewSection();
    }
    
    showStep(currentStep);
    updateProgressIndicator();
    updateNavigationButtons();
}

// Show specific step
function showStep(step) {
    console.log(`Showing step: ${step}`);
    
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(stepElement => {
        stepElement.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step${step}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        console.log(`Step ${step} is now active`);
    } else {
        console.error(`Step element step${step} not found`);
    }
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 === step) {
            indicator.classList.add('active');
        } else if (index + 1 < step) {
            indicator.classList.add('completed');
        }
    });
}

// Update progress indicator
function updateProgressIndicator() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        console.log(`Progress updated to: ${progressPercentage}%`);
    }
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }
    
    if (currentStep === totalSteps) {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (submitBtn) submitBtn.classList.remove('hidden');
    } else {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (submitBtn) submitBtn.classList.add('hidden');
    }
    
    console.log(`Navigation updated for step: ${currentStep}`);
}

// Validate current step
function validateCurrentStep() {
    console.log(`Validating step: ${currentStep}`);
    
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) {
        console.error(`Step element not found: step${currentStep}`);
        return false;
    }
    
    let isValid = true;
    
    // Clear previous error messages
    currentStepElement.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    
    // Get required fields based on current step
    let fieldsToValidate = [];
    
    if (currentStep === 1) {
        fieldsToValidate = ['fullName', 'mobileNumber'];
        console.log('Validating step 1 fields:', fieldsToValidate);
    } else if (currentStep === 2) {
        fieldsToValidate = ['registrationNumber', 'vehicleMake', 'vehicleModel', 'yearOfManufacture', 'fuelType', 'cubicCapacity', 'vehicleType', 'idv', 'dateOfRegistration'];
        console.log('Validating step 2 fields:', fieldsToValidate);
    } else if (currentStep === 3) {
        fieldsToValidate = ['hasPreviousPolicy', 'insuranceType'];
        
        // If user has previous policy, add insurance status as required
        const hasPreviousPolicy = formData.hasPreviousPolicy;
        if (hasPreviousPolicy === 'Yes') {
            fieldsToValidate.push('insuranceStatus');
        }
        console.log('Validating step 3 fields:', fieldsToValidate);
    } else if (currentStep === 4) {
        // No additional validation required for review step
        fieldsToValidate = [];
        console.log('Step 4 - no validation required');
    }
    
    // Validate each required field
    fieldsToValidate.forEach(fieldName => {
        const fieldValid = validateSpecificField(fieldName);
        if (!fieldValid) {
            isValid = false;
            console.log(`Field validation failed: ${fieldName}`);
        }
    });
    
    console.log(`Step ${currentStep} validation result: ${isValid}`);
    return isValid;
}

// Validate specific field
function validateSpecificField(fieldName) {
    const field = document.getElementById(fieldName) || document.querySelector(`input[name="${fieldName}"]:checked`);
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    if (fieldName === 'fuelType' || fieldName === 'vehicleType' || fieldName === 'hasPreviousPolicy' || fieldName === 'insuranceType' || fieldName === 'insuranceStatus') {
        // Radio button validation
        const radioGroup = document.querySelectorAll(`input[name="${fieldName}"]`);
        const isChecked = Array.from(radioGroup).some(radio => radio.checked);
        
        if (!isChecked) {
            if (errorElement) {
                errorElement.textContent = 'Please select an option';
            }
            console.log(`Radio validation failed for: ${fieldName}`);
            return false;
        }
        return true;
    }
    
    if (!field) {
        console.log(`Field not found: ${fieldName}`);
        return false;
    }
    
    const value = field.value ? field.value.trim() : '';
    
    if (!value) {
        if (errorElement) {
            errorElement.textContent = 'This field is required';
        }
        field.style.borderColor = 'var(--color-error)';
        console.log(`Empty field: ${fieldName}`);
        return false;
    }
    
    // Specific validations
    switch (field.type) {
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid email address';
                }
                field.style.borderColor = 'var(--color-error)';
                return false;
            }
            break;
        case 'tel':
            if (!/^[0-9]{10}$/.test(value)) {
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid 10-digit mobile number';
                }
                field.style.borderColor = 'var(--color-error)';
                console.log(`Invalid mobile number: ${value}`);
                return false;
            }
            break;
        case 'number':
            const num = parseInt(value);
            if (num <= 0) {
                if (errorElement) {
                    errorElement.textContent = 'Please enter a valid number';
                }
                field.style.borderColor = 'var(--color-error)';
                return false;
            }
            break;
        default:
            if (fieldName === 'registrationNumber') {
                if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value.toUpperCase())) {
                    if (errorElement) {
                        errorElement.textContent = 'Please enter a valid registration number (e.g., MH12AB1234)';
                    }
                    field.style.borderColor = 'var(--color-error)';
                    return false;
                }
            }
            break;
    }
    
    field.style.borderColor = '';
    return true;
}

// Calculate age from date of birth
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Populate review section
function populateReviewSection() {
    const reviewContainer = document.getElementById('reviewContainer');
    if (!reviewContainer) return;
    
    reviewContainer.innerHTML = '';
    
    const sections = [
        {
            title: 'Personal Details',
            step: 1,
            fields: [
                { key: 'fullName', label: 'Full Name' },
                { key: 'mobileNumber', label: 'Mobile Number' },
                { key: 'email', label: 'Email Address' },
                { key: 'dateOfBirth', label: 'Date of Birth' }
            ]
        },
        {
            title: 'Vehicle Details',
            step: 2,
            fields: [
                { key: 'registrationNumber', label: 'Registration Number' },
                { key: 'vehicleMake', label: 'Make' },
                { key: 'vehicleModel', label: 'Model' },
                { key: 'yearOfManufacture', label: 'Year' },
                { key: 'fuelType', label: 'Fuel Type' },
                { key: 'cubicCapacity', label: 'Cubic Capacity (CC)' },
                { key: 'vehicleType', label: 'Vehicle Type' },
                { key: 'idv', label: 'IDV', format: 'currency' },
                { key: 'dateOfRegistration', label: 'Registration Date' }
            ]
        },
        {
            title: 'Policy Details',
            step: 3,
            fields: [
                { key: 'hasPreviousPolicy', label: 'Has Previous Policy Details' },
                { key: 'insuranceType', label: 'Insurance Type' },
                { key: 'insuranceStatus', label: 'Current Status' },
                { key: 'previousInsurer', label: 'Previous Insurer' },
                { key: 'policyExpiryDate', label: 'Policy Expiry Date' },
                { key: 'policyExpired90Days', label: 'Policy Expired >90 Days', format: 'boolean' },
                { key: 'ncb', label: 'No Claim Bonus' },
                { key: 'claimsLastThreeYears', label: 'Claims in Last 3 Years' }
            ]
        }
    ];
    
    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'review-section';
        
        const sectionHeader = document.createElement('h3');
        sectionHeader.innerHTML = `
            ${section.title}
            <span class="edit-section" onclick="goToStep(${section.step})">Edit</span>
        `;
        sectionDiv.appendChild(sectionHeader);
        
        const reviewGrid = document.createElement('div');
        reviewGrid.className = 'review-grid';
        
        section.fields.forEach(field => {
            const value = formData[field.key];
            if (value !== undefined && value !== '' && value !== false) {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const label = document.createElement('div');
                label.className = 'review-label';
                label.textContent = field.label;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'review-value';
                
                if (field.format === 'currency') {
                    valueDiv.textContent = `₹${parseInt(value).toLocaleString('en-IN')}`;
                } else if (field.format === 'boolean') {
                    valueDiv.textContent = value ? 'Yes' : 'No';
                } else {
                    valueDiv.textContent = value;
                }
                
                reviewItem.appendChild(label);
                reviewItem.appendChild(valueDiv);
                reviewGrid.appendChild(reviewItem);
            }
        });
        
        if (reviewGrid.children.length > 0) {
            sectionDiv.appendChild(reviewGrid);
            reviewContainer.appendChild(sectionDiv);
        }
    });
}

// Format WhatsApp message
function formatWhatsAppMessage() {
    const data = formData;
    const age = data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : null;
    
    let message = `*VEHICLE INSURANCE QUOTE REQUEST*
*${appData.companyName}*

*Customer Details:*
Name: ${data.fullName || 'N/A'}
Mobile: ${data.mobileNumber || 'N/A'}
Email: ${data.email || 'Not provided'}`;
    
    if (age) {
        message += `\nAge: ${age} years`;
    } else {
        message += `\nAge: Not provided`;
    }
    
    message += `

*Vehicle Details:*
Registration No: ${data.registrationNumber || 'N/A'}
Make/Model: ${data.vehicleMake || 'N/A'} ${data.vehicleModel || 'N/A'}
Year: ${data.yearOfManufacture || 'N/A'}
Fuel Type: ${data.fuelType || 'N/A'}
CC: ${data.cubicCapacity || 'N/A'}
Vehicle Type: ${data.vehicleType || 'N/A'}
IDV: ₹${data.idv ? parseInt(data.idv).toLocaleString('en-IN') : 'N/A'}
Registration Date: ${data.dateOfRegistration || 'N/A'}

*Policy Details:*
Insurance Type: ${data.insuranceType || 'N/A'}
Previous Policy Details: ${data.hasPreviousPolicy || 'N/A'}`;

    if (data.hasPreviousPolicy === 'Yes') {
        message += `
Current Status: ${data.insuranceStatus || 'N/A'}
Previous Insurer: ${data.previousInsurer || 'Not provided'}
Policy Expiry: ${data.policyExpiryDate || 'Not provided'}
Policy Expired 90+ days ago: ${data.policyExpired90Days ? 'Yes' : 'No'}
NCB: ${data.ncb || 'Not provided'}
Claims in Last 3 Years: ${data.claimsLastThreeYears || '0'}`;
    } else if (data.hasPreviousPolicy === 'No') {
        message += `
First Time Policy: Yes`;
    }
    
    message += `

Please provide quotation for the above details.

Thank you,
${data.fullName || 'Customer'}`;
    
    return message;
}

// Submit form - FIXED to use hardcoded business WhatsApp number
function submitForm() {
    console.log('Submitting form...');
    
    // Use the business WhatsApp number directly
    const businessNumber = appData.businessWhatsAppNumber;
    
    const message = formatWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${businessNumber}?text=${encodedMessage}`;
    
    console.log('Opening WhatsApp with URL:', whatsappUrl);
    
    showModal();
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}

// Show success modal
function showModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
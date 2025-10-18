let currentUser = null;
let appointments = [];
let medicalRecords = [];
let users = [];

// Initialize data - no longer using localStorage
function initializeData() {
    // Data is now loaded from database via API calls
    // No localStorage initialization needed
}

// Mobile navigation toggle
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Update navigation menu based on login status
function updateNavMenu() {
    const navMenu = document.querySelector('.nav-menu');
    
    if (navMenu) {
        navMenu.innerHTML = '';
        
        const links = [];
        
        // Always show Home
        
        if (!currentUser) {
            // Unlogged in: Show Signup and Login
            links.push({ href: 'index.html', text: 'Home' });
            links.push({ href: 'signup.html', text: 'Sign Up' });
            links.push({ href: 'login.html', text: 'Login' });
        } else {
            // Logged in: Show restricted links based on role
            if (currentUser.role === 'patient') {
            links.push({ href: 'book-appointment.html', text: 'Book Appointment' });
            links.push({ href: 'emr-records.html', text: 'EMR Records' });
            } else if (currentUser.role === 'doctor') {
                links.push({ href: 'doctor-dashboard.html', text: 'Dashboard' });
                links.push({ href: 'doctor-appointments.html', text: 'Appointments' });
                links.push({ href: 'doctor-patients.html', text: 'Patients' });
            }
            links.push({ href: 'contact.html', text: 'Contact' });
            
            // Profile section instead of logout link
            const profileSection = createProfileSection();
            navMenu.appendChild(profileSection);
        }
        
        links.forEach(link => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'nav-link';
            a.textContent = link.text;
            
            // Highlight active link
            if (window.location.pathname.endsWith(link.href)) {
                a.classList.add('active');
            }
            
            li.appendChild(a);
            navMenu.appendChild(li);
        });
    }
}

// Create profile section
function createProfileSection() {
    const li = document.createElement('li');
    li.className = 'nav-item profile-section';
    
    const profileDiv = document.createElement('div');
    profileDiv.className = 'profile-avatar';
    profileDiv.textContent = getInitials(currentUser.full_name || currentUser.name);
    profileDiv.addEventListener('click', toggleProfileDropdown);
    
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-large">${getInitials(currentUser.full_name || currentUser.name)}</div>
            <div class="profile-name">${currentUser.full_name || currentUser.name}</div>
            <div class="profile-role">${currentUser.role}</div>
        </div>
        <div class="profile-details">
            <div class="profile-detail-item">
                <div class="profile-detail-icon">📧</div>
                <div class="profile-detail-text">${currentUser.email}</div>
            </div>
            <div class="profile-detail-item">
                <div class="profile-detail-icon">📱</div>
                <div class="profile-detail-text">${currentUser.phone_number || 'Not provided'}</div>
            </div>
            <div class="profile-detail-item">
                <div class="profile-detail-icon">👤</div>
                <div class="profile-detail-text">${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Account</div>
            </div>
        </div>
        <div class="profile-actions">
            <button class="profile-logout-btn" onclick="handleLogout(event)">Logout</button>
        </div>
    `;
    
    profileDiv.appendChild(dropdown);
    li.appendChild(profileDiv);
    
    return li;
}

// Get user initials
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
}

// Toggle profile dropdown
function toggleProfileDropdown(e) {
    e.stopPropagation();
    const dropdown = e.target.querySelector('.profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close profile dropdown when clicking outside
document.addEventListener('click', function(e) {
    const profileDropdowns = document.querySelectorAll('.profile-dropdown');
    profileDropdowns.forEach(dropdown => {
        if (!dropdown.closest('.profile-section').contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});

// Logout handler
function handleLogout(e) {
    if (e) e.preventDefault();
    
    // Close profile dropdown
    const profileDropdowns = document.querySelectorAll('.profile-dropdown');
    profileDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
    // Logout via API
    fetch('api/auth.php?action=logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
    currentUser = null;
        showAlert('Logout successful!', 'success');
    window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Still logout locally even if API fails
        currentUser = null;
        showAlert('Logout successful!', 'success');
        window.location.href = 'index.html';
    });
}

// Check login status from server
function checkLoginStatus() {
    return fetch('api/auth.php?action=check_session', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.logged_in) {
            currentUser = data.user;
            updateWelcomeMessage();
        } else {
            currentUser = null;
        }
    })
    .catch(error => {
        console.error('Session check error:', error);
        currentUser = null;
    });
}

// Update welcome message with username
function updateWelcomeMessage() {
    if (currentUser) {
        // Update dashboard headers
        const welcomeElements = document.querySelectorAll('#doctorName, .welcome-name, .user-name');
        welcomeElements.forEach(element => {
            element.textContent = currentUser.full_name || currentUser.name;
        });
        
        // Update any welcome messages
        const welcomeMessages = document.querySelectorAll('.welcome-message');
        welcomeMessages.forEach(element => {
            element.textContent = `Welcome, ${currentUser.full_name || currentUser.name}!`;
        });
    }
}

// Utility functions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s+/g, ''));
}

function validatePassword(password) {
    return password.length >= 6;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error') || 
        document.querySelector(`.error-message[data-for="${fieldId}"]`);
    if (errorElement) {
        errorElement.textContent = message;
    } else {
        // Create error element if it doesn't exist
        const field = document.getElementById(fieldId);
        if (field) {
            const error = document.createElement('span');
            error.className = 'error-message';
            error.id = fieldId + 'Error';
            error.textContent = message;
            field.parentElement.appendChild(error);
        }
    }
}

// Role selection function
function selectRole(role) {
    const roleInput = document.getElementById('signupRole') || document.getElementById('loginRole');
    const roleButtons = document.querySelectorAll('.role-button');
    const forms = document.querySelectorAll('.auth-form');
    
    // Update hidden role input
    if (roleInput) {
        roleInput.value = role;
    }
    
    // Toggle selected class for buttons
    roleButtons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('data-role') === role) {
            button.classList.add('selected');
        }
    });
    
    // Show the selected role's form
    forms.forEach(form => {
        form.style.display = form.getAttribute('data-role') === role ? 'block' : 'none';
    });
    
    // Clear any role-related error
    const errorElement = document.querySelector('.error-message[data-for="signupRole"]') || 
        document.querySelector('.error-message[data-for="loginRole"]');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Authentication functions
function initializeAuth() {
    const patientLoginForm = document.getElementById('patient-login-form');
    const doctorLoginForm = document.getElementById('doctor-login-form');
    const patientForm = document.getElementById('patient-form');
    const doctorForm = document.getElementById('doctor-form');
    
    // Initialize login forms
    if (patientLoginForm) patientLoginForm.addEventListener('submit', handleLogin);
    if (doctorLoginForm) doctorLoginForm.addEventListener('submit', handleLogin);
    
    // Initialize signup forms
    if (patientForm) patientForm.addEventListener('submit', handleSignup);
    if (doctorForm) doctorForm.addEventListener('submit', handleSignup);
    
    // Initialize role buttons for both login and signup
    document.querySelectorAll('.role-button').forEach(button => {
        button.addEventListener('click', () => {
            const role = button.getAttribute('data-role');
            selectRole(role);
        });
    });
    
    // Check if user is already logged in
    checkLoginStatus();
}

function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const role = document.getElementById('loginRole').value;
    const specialization = formData.get('specialization');
    
    let isValid = true;
    
    if (!validateEmail(email)) {
        showError(`${role}LoginEmail`, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!validatePassword(password)) {
        showError(`${role}LoginPassword`, 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!role) {
        showError('loginRole', 'Please select your role');
        isValid = false;
    }
    
    if (role === 'doctor' && !specialization) {
        showError('doctorSpecialization', 'Please select specialization');
        isValid = false;
    }
    
    
    if (isValid) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Login via API
        fetch('api/auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                role: role
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
            
            showAlert('Login successful!', 'success');
                
                // Update welcome message
                updateWelcomeMessage();
            
            // Redirect based on role
            setTimeout(() => {
                if (role === 'doctor') {
                    window.location.href = 'doctor-dashboard.html';
                } else {
                    window.location.href = 'emr-records.html';
                }
            }, 1500);
        } else {
                showAlert(data.message || 'Login failed. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showAlert('Login failed. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

function handleSignup(e) {
    e.preventDefault();
    clearErrors();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const mobile = formData.get('mobile');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const role = document.getElementById('signupRole').value;
    const specialization = formData.get('specialization');
    
    let isValid = true;
    
    if (!username || username.length < 3) {
        showError(`${role}Username`, 'Username must be at least 3 characters');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError(`${role}Email`, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (mobile && !validatePhone(mobile)) {
        showError(`${role}Mobile`, 'Please enter a valid mobile number');
        isValid = false;
    }
    
    if (!validatePassword(password)) {
        showError(`${role}Password`, 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError(`${role}ConfirmPassword`, 'Passwords do not match');
        isValid = false;
    }
    
    if (!role) {
        showError('signupRole', 'Please select your role');
        isValid = false;
    }
    
    if (role === 'doctor' && !specialization) {
        showError('doctorSpecialization', 'Please select a specialization');
        isValid = false;
    }
    
    if (role === 'doctor') {
        const officeHoursDays = formData.get('office_hours_days');
        const officeHoursTime = formData.get('office_hours_time');
        
        if (!officeHoursDays) {
            showError('officeHoursDays', 'Please select working days');
            isValid = false;
        }
        
        if (!officeHoursTime) {
            showError('officeHoursTime', 'Please select working hours');
            isValid = false;
        }
    }
    
    
    if (isValid) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        // Register via API
        const requestData = {
            full_name: username,
            email: email,
            phone: mobile || '',
            password: password,
            confirm_password: confirmPassword,
            role: role,
            specialization: specialization || '',
            office_hours_days: formData.get('office_hours_days') || '',
            office_hours_time: formData.get('office_hours_time') || ''
        };
        
        fetch('api/auth.php?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('✅ ' + (data.message || 'Account created successfully! You can now login.'), 'success');
        
        // Redirect to login page after showing success message
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000); // Increased to 3 seconds so users can see the message
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showAlert('Registration failed. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// Appointment booking functions
function initializeAppointmentForm() {
    const appointmentForm = document.getElementById('appointmentForm');
    const specializationSelect = document.getElementById('specialization');
    const doctorSelect = document.getElementById('doctor');
    const appointmentDate = document.getElementById('appointmentDate');
    
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentBooking);
    }
    
    if (specializationSelect && doctorSelect) {
        specializationSelect.addEventListener('change', updateDoctorList);
        
        // Set minimum date to today
        if (appointmentDate) {
            const today = new Date().toISOString().split('T')[0];
            appointmentDate.setAttribute('min', today);
        }
    }
}

function updateDoctorList() {
    const specialization = document.getElementById('specialization').value;
    const doctorSelect = document.getElementById('doctor');
    
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (specialization) {
        // Show loading state
        doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
        
        // Fetch doctors from database
        fetch(`api/doctors.php?action=get_by_specialization&specialization=${specialization}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
            if (data.success && data.doctors.length > 0) {
                data.doctors.forEach(doctor => {
            const option = document.createElement('option');
                    option.value = doctor.full_name;
                    option.textContent = doctor.full_name;
            doctorSelect.appendChild(option);
        });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No doctors available for this specialization';
                option.disabled = true;
                doctorSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error loading doctors:', error);
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        });
    }
}

function handleAppointmentBooking(e) {
    e.preventDefault();
    clearErrors();
    
    const formData = new FormData(e.target);
    let isValid = true;
    
    // Validate all required fields
    const requiredFields = ['patientName', 'patientEmail', 'patientPhone', 'specialization', 'doctor', 'appointmentDate', 'appointmentTime', 'reason'];
    
    requiredFields.forEach(field => {
        const value = formData.get(field);
        if (!value) {
            showError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate email and phone specifically
    const email = formData.get('patientEmail');
    const phone = formData.get('patientPhone');
    
    if (email && !validateEmail(email)) {
        showError('patientEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (phone && !validatePhone(phone)) {
        showError('patientPhone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (isValid) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Booking Appointment...';
        submitBtn.disabled = true;
        
        // Book appointment via API
        fetch('api/appointments.php?action=create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            patientName: formData.get('patientName'),
            patientEmail: formData.get('patientEmail'),
            patientPhone: formData.get('patientPhone'),
            specialization: formData.get('specialization'),
            doctor: formData.get('doctor'),
            appointmentDate: formData.get('appointmentDate'),
            appointmentTime: formData.get('appointmentTime'),
            reason: formData.get('reason'),
                additionalNotes: formData.get('additionalNotes')
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Appointment booked successfully! You will receive a confirmation email shortly.', 'success');
        e.target.reset();
            } else {
                showAlert(data.message || 'Failed to book appointment. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Appointment booking error:', error);
            showAlert('Failed to book appointment. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// EMR Records functions
function initializeEMRRecords() {
    if (document.getElementById('recordsTableBody')) {
        loadMedicalRecords();
        setupEMRFilters();
    }
}

function loadMedicalRecords(recordsToShow = null) {
    const tableBody = document.getElementById('recordsTableBody');
    const noRecords = document.getElementById('noRecords');
    
    if (!tableBody) return;
    
    // If no records provided, fetch from database
    if (!recordsToShow) {
        fetch('api/medical_records.php?action=get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                medicalRecords = data.records; // Store records for filtering
                displayMedicalRecords(data.records);
            } else {
                showAlert('Failed to load medical records', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading medical records:', error);
            showAlert('Failed to load medical records', 'error');
        });
        return;
    }
    
    displayMedicalRecords(recordsToShow);
}

function displayMedicalRecords(records) {
    const tableBody = document.getElementById('recordsTableBody');
    const noRecords = document.getElementById('noRecords');
    
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        noRecords.style.display = 'block';
        document.querySelector('.records-container').style.display = 'none';
    } else {
        noRecords.style.display = 'none';
        document.querySelector('.records-container').style.display = 'block';
        
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(record.visit_date)}</td>
                <td>${record.doctor_name || record.patient_name || 'N/A'}</td>
                <td>${record.diagnosis}</td>
                <td>${record.prescription || 'N/A'}</td>
                <td>
                    <button class="action-button edit-button" onclick="viewRecordDetails(${record.record_id})">
                        View Details
                    </button>
                    <button class="action-button delete-button" onclick="deleteMedicalRecord(${record.record_id})">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function setupEMRFilters() {
    const searchInput = document.getElementById('searchRecords');
    const filterDoctor = document.getElementById('filterDoctor');
    const filterYear = document.getElementById('filterYear');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterRecords);
    }
    if (filterDoctor) {
        filterDoctor.addEventListener('change', filterRecords);
    }
    if (filterYear) {
        filterYear.addEventListener('change', filterRecords);
    }
    if (sortBy) {
        sortBy.addEventListener('change', filterRecords);
    }
}

function filterRecords() {
    const searchTerm = document.getElementById('searchRecords').value.toLowerCase();
    const doctorFilter = document.getElementById('filterDoctor').value;
    const yearFilter = document.getElementById('filterYear').value;
    const sortOption = document.getElementById('sortBy').value;
    
    let filteredRecords = medicalRecords.filter(record => {
        const matchesSearch = !searchTerm || 
            record.diagnosis.toLowerCase().includes(searchTerm) ||
            (record.doctor_name && record.doctor_name.toLowerCase().includes(searchTerm)) ||
            (record.prescription && record.prescription.toLowerCase().includes(searchTerm));
        
        const matchesDoctor = !doctorFilter || record.doctor_name === doctorFilter;
        const matchesYear = !yearFilter || record.visit_date.startsWith(yearFilter);
        
        return matchesSearch && matchesDoctor && matchesYear;
    });
    
    // Sort records
    filteredRecords.sort((a, b) => {
        switch (sortOption) {
            case 'date-desc':
                return new Date(b.visit_date) - new Date(a.visit_date);
            case 'date-asc':
                return new Date(a.visit_date) - new Date(b.visit_date);
            case 'doctor':
                return (a.doctor_name || '').localeCompare(b.doctor_name || '');
            case 'diagnosis':
                return a.diagnosis.localeCompare(b.diagnosis);
            default:
                return 0;
        }
    });
    
    loadMedicalRecords(filteredRecords);
}

function viewRecordDetails(recordId) {
    const record = medicalRecords.find(r => r.record_id == recordId);
    if (!record) return;
    
    const modal = document.getElementById('recordModal');
    const recordDetails = document.getElementById('recordDetails');
    
    recordDetails.innerHTML = `
        <div class="record-detail">
            <strong>Date:</strong> ${formatDate(record.visit_date)}
        </div>
        <div class="record-detail">
            <strong>Doctor:</strong> ${record.doctor_name || 'N/A'}
        </div>
        <div class="record-detail">
            <strong>Diagnosis:</strong> ${record.diagnosis}
        </div>
        <div class="record-detail">
            <strong>Prescription:</strong> ${record.prescription || 'N/A'}
        </div>
    `;
    
    modal.style.display = 'block';
}

function deleteMedicalRecord(recordId) {
    if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
        return;
    }
    
    fetch(`api/medical_records.php?action=delete&id=${recordId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Medical record deleted successfully!', 'success');
            loadMedicalRecords(); // Reload the records
        } else {
            showAlert(data.message || 'Failed to delete medical record', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting medical record:', error);
        showAlert('Failed to delete medical record', 'error');
    });
}

// Doctor Dashboard functions
function initializeDoctorDashboard() {
    if (document.getElementById('todayAppointments')) {
        loadTodayAppointments();
        setupDoctorForms();
        loadRecentRecords();
    }
}

function loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    
    const container = document.getElementById('todayAppointments');
    const countElement = document.getElementById('todayCount');
    
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<p>Loading today\'s appointments...</p>';
    
    // Fetch today's appointments from database
    fetch('api/appointments.php?action=get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.appointments) {
            const todayAppointments = data.appointments.filter(apt => apt.appointment_date === today);
    
    if (countElement) {
        countElement.textContent = todayAppointments.length;
    }
    
    container.innerHTML = '';
    
    if (todayAppointments.length === 0) {
        container.innerHTML = '<p>No appointments scheduled for today.</p>';
    } else {
        todayAppointments.forEach(appointment => {
            const appointmentDiv = document.createElement('div');
            appointmentDiv.className = 'appointment-item';
            appointmentDiv.innerHTML = `
                        <strong>${appointment.patient_name}</strong><br>
                        <span>Time: ${formatTime(appointment.appointment_time)}</span><br>
                        <span>Reason: ${appointment.reason_for_visit}</span>
            `;
            container.appendChild(appointmentDiv);
        });
    }
        } else {
            container.innerHTML = '<p>Error loading appointments.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading today\'s appointments:', error);
        container.innerHTML = '<p>Error loading appointments.</p>';
    });
}

function setupDoctorForms() {
    const notesForm = document.getElementById('notesForm');
    if (notesForm) {
        notesForm.addEventListener('submit', handleSaveRecord);
        
        // Set today's date by default
        const visitDate = document.getElementById('visitDate');
        if (visitDate) {
            visitDate.value = new Date().toISOString().split('T')[0];
        }
        
        // Load patients who have booked appointments with this doctor
        loadDoctorPatientsForDropdown();
    }
}

function loadDoctorPatientsForDropdown() {
    const patientSelect = document.getElementById('patientSelect');
    if (!patientSelect) return;
    
    // Show loading state
    patientSelect.innerHTML = '<option value="">Loading patients...</option>';
    
    // Fetch patients from database
    fetch('api/doctors.php?action=get_patients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        patientSelect.innerHTML = '<option value="">Select a patient</option>';
        
        if (data.success && data.patients.length > 0) {
            data.patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.full_name;
                option.textContent = patient.full_name;
                patientSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No patients found';
            option.disabled = true;
            patientSelect.appendChild(option);
        }
    })
    .catch(error => {
        console.error('Error loading patients:', error);
        patientSelect.innerHTML = '<option value="">Error loading patients</option>';
    });
}

function handleSaveRecord(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const visitDate = formData.get('visitDate');
    const diagnosis = formData.get('diagnosis');
    const prescription = formData.get('prescription');
    const notes = formData.get('notes');
    const patient = formData.get('patient');
    
    if (!visitDate || !diagnosis || !patient) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Save medical record via API
    fetch('api/medical_records.php?action=create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            patient: patient,
            diagnosis: diagnosis,
            prescription: prescription || '',
            visitDate: visitDate,
            notes: notes || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
    showAlert('Medical record saved successfully!', 'success');
    e.target.reset();
    loadRecentRecords();
        } else {
            showAlert(data.message || 'Failed to save medical record', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving medical record:', error);
        showAlert('Failed to save medical record', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function loadRecentRecords() {
    const container = document.getElementById('recentRecords');
    if (!container) return;
    
    // Fetch recent records from database
    fetch('api/medical_records.php?action=get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const recentRecords = data.records.slice(0, 5); // Get latest 5 records
            displayRecentRecords(recentRecords);
        } else {
            container.innerHTML = '<p>No recent records found.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading recent records:', error);
        container.innerHTML = '<p>No recent records found.</p>';
    });
}

function displayRecentRecords(records) {
    const container = document.getElementById('recentRecords');
    container.innerHTML = '';
    
    if (records.length === 0) {
        container.innerHTML = '<p>No recent records found.</p>';
    } else {
        records.forEach(record => {
            const recordDiv = document.createElement('div');
            recordDiv.className = 'record-item';
            recordDiv.innerHTML = `
                <strong>Date:</strong> ${formatDate(record.visit_date)}<br>
                <strong>Patient:</strong> ${record.patient_name || 'N/A'}<br>
                <strong>Diagnosis:</strong> ${record.diagnosis}
            `;
            container.appendChild(recordDiv);
        });
    }
}

// Admin functionality removed

// Doctor Appointments functions
function initializeDoctorAppointments() {
    if (document.getElementById('appointmentsTableBody')) {
        loadDoctorAppointmentsFromDB();
        setupDoctorAppointmentFilters();
    }
}

function loadDoctorAppointmentsFromDB() {
    const tableBody = document.getElementById('appointmentsTableBody');
    const noAppointments = document.getElementById('noAppointments');
    
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading appointments...</td></tr>';
    
    // Fetch appointments from database
    fetch('api/appointments.php?action=get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = '';
        
        if (data.success && data.appointments.length > 0) {
            noAppointments.style.display = 'none';
            document.querySelector('.records-container').style.display = 'block';
            
            data.appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatDate(appointment.appointment_date)}</td>
                    <td>${formatTime(appointment.appointment_time)}</td>
                    <td>${appointment.patient_name}</td>
                    <td>${appointment.reason_for_visit}</td>
                    <td><span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                    <td>
                        <button class="action-button edit-button" onclick="updateAppointmentStatus(${appointment.appointment_id}, 'completed')">
                            Complete
                        </button>
                        <button class="action-button delete-button" onclick="updateAppointmentStatus(${appointment.appointment_id}, 'cancelled')">
                            Cancel
                        </button>
                        <button class="action-button delete-button" onclick="deleteAppointment(${appointment.appointment_id})" style="background-color: #dc3545;">
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            noAppointments.style.display = 'block';
            document.querySelector('.records-container').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading appointments:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading appointments</td></tr>';
    });
}

function setupDoctorAppointmentFilters() {
    const searchInput = document.getElementById('searchAppointments');
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDoctorAppointments);
    }
    if (filterDate) {
        filterDate.addEventListener('change', filterDoctorAppointments);
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', filterDoctorAppointments);
    }
}

function filterDoctorAppointments() {
    const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
    const dateFilter = document.getElementById('filterDate').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = !searchTerm || 
            appointment.patientName.toLowerCase().includes(searchTerm) ||
            appointment.reason.toLowerCase().includes(searchTerm);
        
        const matchesDate = !dateFilter || checkDateFilter(appointment.appointmentDate, dateFilter);
        const matchesStatus = !statusFilter || appointment.status === statusFilter;
        
        return matchesSearch && matchesDate && matchesStatus;
    });
    
    loadDoctorAppointments(filteredAppointments);
}

function checkDateFilter(date, filter) {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (filter) {
        case 'today':
            return appointmentDate.toDateString() === today.toDateString();
        case 'tomorrow':
            return appointmentDate.toDateString() === tomorrow.toDateString();
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appointmentDate >= weekAgo && appointmentDate <= today;
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return appointmentDate >= monthAgo && appointmentDate <= today;
        default:
            return true;
    }
}

function viewAppointmentDetails(appointmentId) {
    const appointment = appointments.find(a => a.id == appointmentId);
    if (!appointment) return;
    
    const modal = document.getElementById('recordModal');
    const recordDetails = document.getElementById('recordDetails');
    
    recordDetails.innerHTML = `
        <div class="record-detail">
            <strong>Patient:</strong> ${appointment.patientName}
        </div>
        <div class="record-detail">
            <strong>Email:</strong> ${appointment.patientEmail}
        </div>
        <div class="record-detail">
            <strong>Phone:</strong> ${appointment.patientPhone}
        </div>
        <div class="record-detail">
            <strong>Date:</strong> ${formatDate(appointment.appointmentDate)}
        </div>
        <div class="record-detail">
            <strong>Time:</strong> ${appointment.appointmentTime}
        </div>
        <div class="record-detail">
            <strong>Reason:</strong> ${appointment.reason}
        </div>
        ${appointment.additionalNotes ? `
        <div class="record-detail">
            <strong>Notes:</strong> ${appointment.additionalNotes}
        </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Doctor Patients functions
function initializeDoctorPatients() {
    if (document.getElementById('patientsTableBody')) {
        loadDoctorPatientsFromDB();
        setupDoctorPatientFilters();
    }
}

function updateAppointmentStatus(appointmentId, newStatus) {
    if (!confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) {
        return;
    }
    
    fetch('api/appointments.php?action=update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: appointmentId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(`Appointment ${newStatus} successfully!`, 'success');
            loadDoctorAppointmentsFromDB(); // Reload the appointments
        } else {
            showAlert(data.message || 'Failed to update appointment', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating appointment:', error);
        showAlert('Failed to update appointment', 'error');
    });
}

function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }
    
    fetch(`api/appointments.php?action=delete&id=${appointmentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Appointment deleted successfully!', 'success');
            loadDoctorAppointmentsFromDB(); // Reload the appointments
        } else {
            showAlert(data.message || 'Failed to delete appointment', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting appointment:', error);
        showAlert('Failed to delete appointment', 'error');
    });
}

function loadDoctorPatientsFromDB() {
    const tableBody = document.getElementById('patientsTableBody');
    const noPatients = document.getElementById('noPatients');
    
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading patients...</td></tr>';
    
    // Fetch patients from database
    fetch('api/doctors.php?action=get_patients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = '';
        
        if (data.success && data.patients.length > 0) {
            noPatients.style.display = 'none';
            document.querySelector('.records-container').style.display = 'block';
            
            data.patients.forEach(patient => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.full_name}</td>
                    <td>${patient.email}</td>
                    <td>${patient.phone_number || 'N/A'}</td>
                    <td>N/A</td>
                    <td>0</td>
                    <td>
                        <button class="action-button edit-button" onclick="viewPatientRecords('${patient.full_name}')">
                            View Records
                        </button>
                        <button class="action-button delete-button" onclick="deletePatient(${patient.user_id})">
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            noPatients.style.display = 'block';
            document.querySelector('.records-container').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error loading patients:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading patients</td></tr>';
    });
}

function loadDoctorPatients(patientsToShow = getDoctorPatients()) {
    const tableBody = document.getElementById('patientsTableBody');
    const noPatients = document.getElementById('noPatients');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (patientsToShow.length === 0) {
        noPatients.style.display = 'block';
        document.querySelector('.records-container').style.display = 'none';
    } else {
        noPatients.style.display = 'none';
        document.querySelector('.records-container').style.display = 'block';
        
        patientsToShow.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.email}</td>
                <td>${patient.mobile || 'N/A'}</td>
                <td>${patient.lastVisit ? formatDate(patient.lastVisit) : 'N/A'}</td>
                <td>${patient.recordCount || 0}</td>
                <td>
                    <button class="action-button edit-button" onclick="viewPatientRecords('${patient.name}')">
                        View Records
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function getDoctorPatients() {
    // Get unique patients from appointments and medical records
    const patientNames = new Set();
    const patients = [];
    
    // Add patients from appointments
    appointments.forEach(appointment => {
        if (!patientNames.has(appointment.patientName)) {
            patientNames.add(appointment.patientName);
            patients.push({
                name: appointment.patientName,
                email: appointment.patientEmail,
                mobile: appointment.patientPhone,
                lastVisit: appointment.appointmentDate,
                recordCount: medicalRecords.filter(record => record.patient === appointment.patientName).length
            });
        }
    });
    
    // Add patients from medical records
    medicalRecords.forEach(record => {
        if (record.patient && !patientNames.has(record.patient)) {
            patientNames.add(record.patient);
            patients.push({
                name: record.patient,
                email: 'N/A',
                mobile: 'N/A',
                lastVisit: record.date,
                recordCount: medicalRecords.filter(r => r.patient === record.patient).length
            });
        }
    });
    
    return patients;
}

function setupDoctorPatientFilters() {
    const searchInput = document.getElementById('searchPatients');
    const filterLastVisit = document.getElementById('filterLastVisit');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDoctorPatients);
    }
    if (filterLastVisit) {
        filterLastVisit.addEventListener('change', filterDoctorPatients);
    }
}

function filterDoctorPatients() {
    const searchTerm = document.getElementById('searchPatients').value.toLowerCase();
    const visitFilter = document.getElementById('filterLastVisit').value;
    
    let filteredPatients = getDoctorPatients().filter(patient => {
        const matchesSearch = !searchTerm || 
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm);
        
        const matchesVisit = !visitFilter || checkVisitFilter(patient.lastVisit, visitFilter);
        
        return matchesSearch && matchesVisit;
    });
    
    loadDoctorPatients(filteredPatients);
}

function checkVisitFilter(lastVisit, filter) {
    if (!lastVisit) return filter === 'older';
    
    const visitDate = new Date(lastVisit);
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    switch (filter) {
        case 'recent':
            return visitDate >= thirtyDaysAgo;
        case 'older':
            return visitDate < thirtyDaysAgo;
        default:
            return true;
    }
}

function viewPatientRecords(patientName) {
    const patientRecords = medicalRecords.filter(record => record.patient === patientName);
    
    if (patientRecords.length === 0) {
        showAlert('No records found for this patient.', 'warning');
        return;
    }
    
    // Redirect to EMR records with patient filter
    window.location.href = `emr-records.html?patient=${encodeURIComponent(patientName)}`;
}

function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient and all their associated records? This action cannot be undone.')) {
        return;
    }
    
    fetch(`api/doctors.php?action=delete_patient&id=${patientId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Patient and associated records deleted successfully!', 'success');
            loadDoctorPatientsFromDB(); // Reload the patients
        } else {
            showAlert(data.message || 'Failed to delete patient', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting patient:', error);
        showAlert('Failed to delete patient', 'error');
    });
}

// Admin Users functions
function initializeAdminUsers() {
    if (document.getElementById('usersTableBody')) {
        loadUsers();
        setupAdminFilters();
        setupModal();
        updateAdminStats();
    }
}

// Admin Doctors functions
function initializeAdminDoctors() {
    if (document.getElementById('doctorsTableBody')) {
        loadDoctors();
        setupDoctorAdminFilters();
        setupDoctorModal();
    }
}

function loadDoctors(doctorsToShow = getDoctors()) {
    const tableBody = document.getElementById('doctorsTableBody');
    const noDoctors = document.getElementById('noDoctors');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (doctorsToShow.length === 0) {
        noDoctors.style.display = 'block';
        document.querySelector('.users-container').style.display = 'none';
    } else {
        noDoctors.style.display = 'none';
        document.querySelector('.users-container').style.display = 'block';
        
        doctorsToShow.forEach(doctor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doctor.id}</td>
                <td>${doctor.name}</td>
                <td>${doctor.email}</td>
                <td>${doctor.specialization || 'N/A'}</td>
                <td><span class="status-badge status-${doctor.status}">${doctor.status}</span></td>
                <td>${formatDate(doctor.joined)}</td>
                <td>
                    <button class="action-button edit-button" onclick="editDoctor(${doctor.id})">
                        Edit
                    </button>
                    <button class="action-button delete-button" onclick="deleteDoctor(${doctor.id})">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function getDoctors() {
    return users.filter(user => user.role === 'doctor');
}

function setupDoctorAdminFilters() {
    const searchInput = document.getElementById('searchDoctors');
    const filterSpecialization = document.getElementById('filterSpecialization');
    const filterStatus = document.getElementById('filterStatus');
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDoctors);
    }
    if (filterSpecialization) {
        filterSpecialization.addEventListener('change', filterDoctors);
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', filterDoctors);
    }
    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', () => openDoctorModal());
    }
}

function filterDoctors() {
    const searchTerm = document.getElementById('searchDoctors').value.toLowerCase();
    const specializationFilter = document.getElementById('filterSpecialization').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredDoctors = getDoctors().filter(doctor => {
        const matchesSearch = !searchTerm || 
            doctor.name.toLowerCase().includes(searchTerm) ||
            doctor.email.toLowerCase().includes(searchTerm);
        
        const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;
        const matchesStatus = !statusFilter || doctor.status === statusFilter;
        
        return matchesSearch && matchesSpecialization && matchesStatus;
    });
    
    loadDoctors(filteredDoctors);
}

function setupDoctorModal() {
    const modal = document.getElementById('doctorModal');
    const closeModal = document.querySelector('.close-modal');
    const doctorForm = document.getElementById('doctorForm');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    if (doctorForm) {
        doctorForm.addEventListener('submit', handleDoctorSave);
    }
}

function openDoctorModal(doctor = null) {
    const modal = document.getElementById('doctorModal');
    const modalTitle = document.getElementById('modalTitle');
    const doctorForm = document.getElementById('doctorForm');
    
    modalTitle.textContent = doctor ? 'Edit Doctor' : 'Add New Doctor';
    
    if (doctor) {
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('doctorName').value = doctor.name;
        document.getElementById('doctorEmail').value = doctor.email;
        document.getElementById('doctorSpecialization').value = doctor.specialization || '';
        document.getElementById('doctorStatus').value = doctor.status;
    } else {
        doctorForm.reset();
    }
    
    modal.style.display = 'block';
}

function editDoctor(doctorId) {
    const doctor = getDoctors().find(d => d.id == doctorId);
    if (doctor) {
        openDoctorModal(doctor);
    }
}

function deleteDoctor(doctorId) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        const doctorIndex = users.findIndex(u => u.id == doctorId);
        if (doctorIndex !== -1) {
            users.splice(doctorIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
            loadDoctors();
            showAlert('Doctor deleted successfully!', 'success');
        }
    }
}

function handleDoctorSave(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const doctorId = formData.get('doctorId');
    
    const doctorData = {
        name: formData.get('name'),
        email: formData.get('email'),
        specialization: formData.get('specialization'),
        status: formData.get('status')
    };
    
    if (doctorId) {
        // Update existing doctor
        const doctorIndex = users.findIndex(u => u.id == doctorId);
        if (doctorIndex !== -1) {
            users[doctorIndex] = { ...users[doctorIndex], ...doctorData };
        }
    } else {
        // Add new doctor
        doctorData.id = generateId();
        doctorData.role = 'doctor';
        doctorData.joined = new Date().toISOString().split('T')[0];
        users.push(doctorData);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    loadDoctors();
    
    document.getElementById('doctorModal').style.display = 'none';
    showAlert(doctorId ? 'Doctor updated successfully!' : 'Doctor added successfully!', 'success');
}

// Admin Messages functions
function initializeAdminMessages() {
    if (document.getElementById('messagesTableBody')) {
        loadMessages();
        setupMessageFilters();
    }
}

function loadMessages(messagesToShow = getMessages()) {
    const tableBody = document.getElementById('messagesTableBody');
    const noMessages = document.getElementById('noMessages');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (messagesToShow.length === 0) {
        noMessages.style.display = 'block';
        document.querySelector('.users-container').style.display = 'none';
    } else {
        noMessages.style.display = 'none';
        document.querySelector('.users-container').style.display = 'block';
        
        messagesToShow.forEach(message => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${message.id}</td>
                <td>${message.name}</td>
                <td>${message.email}</td>
                <td>${message.subject}</td>
                <td>${formatDate(message.date)}</td>
                <td>
                    <button class="action-button edit-button" onclick="viewMessageDetails(${message.id})">
                        View Details
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function getMessages() {
    // Return sample messages for demonstration
    return [
        {
            id: 1,
            name: 'John Smith',
            email: 'john@email.com',
            subject: 'Appointment Inquiry',
            message: 'I would like to schedule an appointment with a cardiologist.',
            date: '2024-01-15'
        },
        {
            id: 2,
            name: 'Jane Doe',
            email: 'jane@email.com',
            subject: 'Technical Support',
            message: 'I am having trouble accessing my medical records.',
            date: '2024-01-14'
        }
    ];
}

function setupMessageFilters() {
    const searchInput = document.getElementById('searchMessages');
    const filterSubject = document.getElementById('filterSubject');
    const filterDate = document.getElementById('filterDate');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterMessages);
    }
    if (filterSubject) {
        filterSubject.addEventListener('change', filterMessages);
    }
    if (filterDate) {
        filterDate.addEventListener('change', filterMessages);
    }
}

function filterMessages() {
    const searchTerm = document.getElementById('searchMessages').value.toLowerCase();
    const subjectFilter = document.getElementById('filterSubject').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    let filteredMessages = getMessages().filter(message => {
        const matchesSearch = !searchTerm || 
            message.name.toLowerCase().includes(searchTerm) ||
            message.email.toLowerCase().includes(searchTerm) ||
            message.subject.toLowerCase().includes(searchTerm);
        
        const matchesSubject = !subjectFilter || message.subject === subjectFilter;
        const matchesDate = !dateFilter || checkDateFilter(message.date, dateFilter);
        
        return matchesSearch && matchesSubject && matchesDate;
    });
    
    loadMessages(filteredMessages);
}

function viewMessageDetails(messageId) {
    const message = getMessages().find(m => m.id == messageId);
    if (!message) return;
    
    const modal = document.getElementById('messageModal');
    const messageDetails = document.getElementById('messageDetails');
    
    messageDetails.innerHTML = `
        <div class="record-detail">
            <strong>Name:</strong> ${message.name}
        </div>
        <div class="record-detail">
            <strong>Email:</strong> ${message.email}
        </div>
        <div class="record-detail">
            <strong>Subject:</strong> ${message.subject}
        </div>
        <div class="record-detail">
            <strong>Date:</strong> ${formatDate(message.date)}
        </div>
        <div class="record-detail">
            <strong>Message:</strong><br>
            <p style="margin-top: 0.5rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">${message.message}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Contact form functions
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    clearErrors();
    
    const formData = new FormData(e.target);
    let isValid = true;
    
    // Validate required fields
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const consent = formData.get('consent');
    
    if (!name || name.length < 2) {
        showError('contactName', 'Please enter your full name');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('contactEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!subject) {
        showError('contactSubject', 'Please select a subject');
        isValid = false;
    }
    
    if (!message || message.length < 10) {
        showError('contactMessage', 'Please enter a message (minimum 10 characters)');
        isValid = false;
    }
    
    if (!consent) {
        showError('contactConsent', 'Please agree to be contacted');
        isValid = false;
    }
    
    if (isValid) {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Send message via API
        fetch('api/messages.php?action=create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
        showAlert('Thank you for your message! We will get back to you within 24 hours.', 'success');
        e.target.reset();
            } else {
                showAlert(data.message || 'Failed to send message. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            showAlert('Failed to send message. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
}

// Modal functions
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Table sorting functions
function sortTable(column) {
    console.log('Sorting by:', column);
}

function sortUserTable(column) {
    console.log('Sorting users by:', column);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    initializeNavigation();
    
    // First check login status, then proceed with page-specific logic
    checkLoginStatus().then(() => {
    updateNavMenu();  // Dynamically update the nav menu based on login status
    
    // Page-specific initialization and restrictions
    const currentPage = window.location.pathname.split('/').pop();
    
        const restrictedPages = ['emr-records.html', 'contact.html'];
        const patientPages = ['book-appointment.html'];
        const doctorPages = ['doctor-dashboard.html', 'doctor-appointments.html', 'doctor-patients.html'];
        const adminPages = ['admin-dashboard.html', 'admin-users.html', 'admin-doctors.html', 'admin-messages.html'];
    
    // Enforce restrictions
    if ((restrictedPages.includes(currentPage) && !currentUser) ||
            (patientPages.includes(currentPage) && (!currentUser || currentUser.role !== 'patient')) ||
        (doctorPages.includes(currentPage) && (!currentUser || currentUser.role !== 'doctor')) ||
        (adminPages.includes(currentPage) && (!currentUser || currentUser.role !== 'admin'))) {
        showAlert('You must be logged in to access this page.', 'error');
        window.location.href = 'login.html';
        return;  // Stop further execution
    }
    
        initializePageSpecificFeatures(currentPage);
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    });
});

// Initialize page-specific features
function initializePageSpecificFeatures(currentPage) {
    switch (currentPage) {
        case 'login.html':
        case 'signup.html':
            initializeAuth();
            break;
        case 'book-appointment.html':
            initializeAppointmentForm();
            break;
        case 'emr-records.html':
            initializeEMRRecords();
            break;
        case 'doctor-dashboard.html':
            initializeDoctorDashboard();
            break;
        case 'doctor-appointments.html':
            initializeDoctorAppointments();
            break;
        case 'doctor-patients.html':
            initializeDoctorPatients();
            break;
        case 'admin-dashboard.html':
            initializeAdminDashboard();
            break;
        case 'admin-users.html':
            initializeAdminUsers();
            break;
        case 'admin-doctors.html':
            initializeAdminDoctors();
            break;
        case 'admin-messages.html':
            initializeAdminMessages();
            break;
        case 'contact.html':
            initializeContactForm();
            break;
        default:
            // Home page or other pages
            break;
    }
}
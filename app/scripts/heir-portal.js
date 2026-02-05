// HEIR PORTAL JAVASCRIPT
// Handles UI interactions and form submissions

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const willId = urlParams.get('will') || 'will-001';
const initialStep = urlParams.get('step') || 'choose-method';

// State
let selectedFile = null;
let attemptsRemaining = 3;

// Initialize portal
document.addEventListener('DOMContentLoaded', () => {
    console.log('[HEIR PORTAL] Initializing...');
    console.log('[HEIR PORTAL] Will ID:', willId);
    
    // Navigate to initial step
    if (initialStep === 'hardware-key') {
        selectAccessMethod('hardware-key');
    }
    
    // Setup event listeners
    setupFileUpload();
    setupHardwareKeyInput();
    setupEmergencyForm();
});

// ============================================================================
// NAVIGATION
// ============================================================================

function selectAccessMethod(method) {
    console.log('[NAVIGATION] Selected method:', method);
    
    // Hide all steps
    document.querySelectorAll('.portal-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show selected step
    const stepMap = {
        'death-certificate': 'step-death-certificate',
        'emergency-access': 'step-emergency-access',
        'hardware-key': 'step-hardware-key'
    };
    
    const stepId = stepMap[method];
    if (stepId) {
        document.getElementById(stepId).classList.add('active');
    }
}

function goBack() {
    console.log('[NAVIGATION] Going back to method selection');
    
    // Hide all steps
    document.querySelectorAll('.portal-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show method selection
    document.getElementById('step-choose-method').classList.add('active');
}

function showProcessing(title, message) {
    // Hide all steps
    document.querySelectorAll('.portal-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Update processing step
    document.getElementById('processing-title').textContent = title;
    document.getElementById('processing-message').textContent = message;
    
    // Show processing step
    document.getElementById('step-processing').classList.add('active');
}

// ============================================================================
// DEATH CERTIFICATE UPLOAD
// ============================================================================

function setupFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('certificate-file');
    
    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    console.log('[FILE UPLOAD] Selected file:', file.name);
    
    // Validate file
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file');
        return;
    }
    
    if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
    }
    
    // Store file
    selectedFile = file;
    
    // Show preview
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    
    // Enable submit button
    document.getElementById('btn-submit-cert').disabled = false;
}

function removeFile() {
    selectedFile = null;
    document.getElementById('upload-zone').style.display = 'flex';
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('btn-submit-cert').disabled = true;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function submitCertificate() {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }
    
    console.log('[SUBMIT] Processing death certificate...');
    
    // Show processing
    showProcessing('Verifying Certificate', 'Running automated verification checks...');
    
    try {
        // Process certificate (using mock heir ID for demo)
        const result = await window.DeathCertificateVerification.processCertificateUpload(
            selectedFile,
            willId,
            'heir-001'  // In production, get from session
        );
        
        console.log('[SUBMIT] Result:', result);
        
        if (result.success) {
            if (result.action === 'proceed_to_hardware_key') {
                // Auto-approved - show success
                showProcessing(
                    '✓ Certificate Verified!',
                    result.message + ' Redirecting to hardware key entry...'
                );
                
                setTimeout(() => {
                    selectAccessMethod('hardware-key');
                }, 3000);
                
            } else if (result.action === 'manual_review') {
                // Manual review required
                showProcessing(
                    'Under Review',
                    result.message
                );
            }
        } else {
            // Rejected
            showProcessing(
                'Verification Failed',
                result.message
            );
            
            setTimeout(() => {
                goBack();
            }, 5000);
        }
        
    } catch (error) {
        console.error('[SUBMIT] Error:', error);
        showProcessing(
            'Error',
            'An error occurred during verification. Please try again.'
        );
        
        setTimeout(() => {
            goBack();
        }, 3000);
    }
}

// ============================================================================
// EMERGENCY ACCESS REQUEST
// ============================================================================

function setupEmergencyForm() {
    const form = document.getElementById('emergency-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEmergencyRequest();
    });
}

async function submitEmergencyRequest() {
    console.log('[EMERGENCY] Submitting request...');
    
    // Collect form data
    const reason = document.getElementById('emergency-reason').value;
    const additionalInfo = document.getElementById('additional-info').value;
    const contactName = document.getElementById('contact-name').value;
    const contactPhone = document.getElementById('contact-phone').value;
    const contactRelationship = document.getElementById('contact-relationship').value;
    const isUrgent = document.getElementById('urgent-request').checked;
    
    // Get selected document types
    const docTypes = Array.from(document.querySelectorAll('input[name="doc-type"]:checked'))
        .map(cb => cb.value);
    
    if (docTypes.length === 0) {
        alert('Please select at least one type of documentation');
        return;
    }
    
    // Show processing
    showProcessing('Submitting Request', 'Please wait...');
    
    try {
        const result = window.EmergencyAccess.submitEmergencyAccessRequest(
            willId,
            'heir-001',  // In production, get from session
            {
                reason: reason,
                additionalInfo: additionalInfo,
                docTypes: docTypes,
                emergencyContact: {
                    name: contactName,
                    phone: contactPhone,
                    relationship: contactRelationship
                },
                urgency: isUrgent ? 'urgent' : 'normal'
            }
        );
        
        console.log('[EMERGENCY] Result:', result);
        
        if (result.success) {
            showProcessing(
                '✓ Request Submitted',
                result.message + '\n\nRequest ID: ' + result.request_id
            );
        } else {
            showProcessing(
                'Error',
                result.message
            );
        }
        
    } catch (error) {
        console.error('[EMERGENCY] Error:', error);
        showProcessing(
            'Error',
            'An error occurred. Please try again.'
        );
    }
}

// ============================================================================
// HARDWARE KEY VERIFICATION
// ============================================================================

function setupHardwareKeyInput() {
    const segments = document.querySelectorAll('.key-segment');
    
    segments.forEach((segment, index) => {
        // Auto-advance to next segment
        segment.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            e.target.value = value;
            
            if (value.length === 4 && index < segments.length - 1) {
                segments[index + 1].focus();
            }
            
            // Enable verify button if all segments filled
            checkKeyComplete();
        });
        
        // Backspace to previous segment
        segment.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                segments[index - 1].focus();
            }
        });
        
        // Paste handling
        segment.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = e.clipboardData.getData('text').replace(/-/g, '').toUpperCase();
            
            // Distribute across segments
            let charIndex = 0;
            for (let i = index; i < segments.length && charIndex < paste.length; i++) {
                const chunk = paste.substr(charIndex, 4);
                segments[i].value = chunk;
                charIndex += 4;
            }
            
            checkKeyComplete();
        });
    });
}

function checkKeyComplete() {
    const segments = document.querySelectorAll('.key-segment');
    const allFilled = Array.from(segments).every(s => s.value.length === 4);
    
    document.getElementById('btn-verify-key').disabled = !allFilled;
}

function getHardwareKey() {
    const segments = document.querySelectorAll('.key-segment');
    return Array.from(segments).map(s => s.value).join('-');
}

async function verifyHardwareKey() {
    const key = getHardwareKey();
    console.log('[HARDWARE KEY] Verifying:', key);
    
    // Show processing
    showProcessing('Verifying Key', 'Checking hardware key...');
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification (in production, hash and compare)
    // For demo, accept any key that starts with "HEIR"
    if (key.startsWith('HEIR')) {
        console.log('[HARDWARE KEY] ✓ Verified!');
        
        showProcessing(
            '✓ Access Granted!',
            'Redirecting to your Legacy Will dashboard...'
        );
        
        setTimeout(() => {
            window.location.href = 'heir-dashboard.html?will=' + willId;
        }, 2000);
        
    } else {
        console.log('[HARDWARE KEY] ✗ Invalid');
        
        attemptsRemaining--;
        
        if (attemptsRemaining > 0) {
            showProcessing(
                'Invalid Key',
                `The hardware key you entered is incorrect. ${attemptsRemaining} attempts remaining.`
            );
            
            setTimeout(() => {
                selectAccessMethod('hardware-key');
                document.getElementById('attempts-info').innerHTML = `
                    <svg width="16" height="16"><use href="assets/icons-obsidian.svg#shield"></use></svg>
                    <span>${attemptsRemaining} attempts remaining</span>
                `;
            }, 3000);
        } else {
            showProcessing(
                'Access Locked',
                'Too many failed attempts. Your access has been temporarily locked. Please contact support.'
            );
        }
    }
}

console.log('[HEIR PORTAL] Script loaded ✓');

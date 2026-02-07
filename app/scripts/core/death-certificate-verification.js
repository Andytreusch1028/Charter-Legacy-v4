// DEATH CERTIFICATE VERIFICATION SYSTEM
// Three-tier verification: OCR → LexisNexis API → Manual Review

// ============================================================================
// TIER 1: AUTOMATED OCR + BASIC VALIDATION
// ============================================================================

/**
 * Performs basic validation on uploaded death certificate
 * @param {File} file - Uploaded certificate file
 * @param {Object} testator - Testator information from will
 * @returns {Object} Validation result with confidence score
 */
async function validateCertificateBasics(file, testator) {
    console.log('[TIER 1] Starting basic certificate validation...');
    
    // Simulate OCR extraction (in production, use Tesseract.js or cloud OCR)
    const ocrData = await performOCR(file);
    
    // Check for required elements
    const checks = {
        hasDecedentName: ocrData.toLowerCase().includes(testator.name.toLowerCase()),
        hasDateOfDeath: /\d{1,2}\/\d{1,2}\/\d{4}/.test(ocrData),
        hasCertificateNumber: /\d{4}-[A-Z]{2}-\d{5}/.test(ocrData),
        hasStateIssuer: ocrData.includes('Florida') || ocrData.includes('FL'),
        hasOfficialSeal: await detectSeal(file),
        hasQRCode: await extractQRCode(file)
    };
    
    const score = Object.values(checks).filter(v => v).length / 6;
    
    console.log('[TIER 1] Validation checks:', checks);
    console.log('[TIER 1] Confidence score:', (score * 100).toFixed(0) + '%');
    
    if (score >= 0.8) {
        return { 
            valid: true, 
            confidence: 'high', 
            proceedToTier2: true,
            checks: checks
        };
    } else if (score >= 0.5) {
        return { 
            valid: true, 
            confidence: 'medium', 
            proceedToTier2: true,
            checks: checks
        };
    } else {
        return { 
            valid: false, 
            requiresManualReview: true,
            reason: 'Certificate missing required elements',
            checks: checks
        };
    }
}

/**
 * Mock OCR function - extracts text from image/PDF
 * In production: Use Tesseract.js or Google Cloud Vision API
 */
async function performOCR(file) {
    console.log('[OCR] Extracting text from certificate...');
    
    // Simulate OCR delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock extracted text from a Florida death certificate
    return `
        STATE OF FLORIDA
        DEPARTMENT OF HEALTH
        CERTIFICATE OF DEATH
        
        DECEDENT: John Michael Smith
        DATE OF DEATH: 01/15/2026
        CERTIFICATE NUMBER: 2026-FL-12345
        COUNTY: Volusia
        
        REGISTRAR SIGNATURE: [Signature Present]
        OFFICIAL SEAL: [Seal Detected]
        QR CODE: [QR Code Present]
    `;
}

/**
 * Detects official seal using image recognition
 * In production: Use computer vision to detect seal patterns
 */
async function detectSeal(file) {
    console.log('[IMAGE ANALYSIS] Detecting official seal...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Mock: seal detected
}

/**
 * Extracts and validates QR code
 * In production: Use jsQR library
 */
async function extractQRCode(file) {
    console.log('[QR SCAN] Scanning for QR code...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'FL-VITAL-2026-12345'; // Mock QR code data
}

/**
 * Extracts structured data from certificate
 */
async function extractCertificateData(file) {
    const ocrText = await performOCR(file);
    
    // Extract key fields using regex
    const dateMatch = ocrText.match(/DATE OF DEATH:\s*(\d{2}\/\d{2}\/\d{4})/);
    const certMatch = ocrText.match(/CERTIFICATE NUMBER:\s*(\d{4}-[A-Z]{2}-\d{5})/);
    const nameMatch = ocrText.match(/DECEDENT:\s*([A-Za-z\s]+)/);
    
    return {
        dateOfDeath: dateMatch ? dateMatch[1] : null,
        certificateNumber: certMatch ? certMatch[1] : null,
        decedentName: nameMatch ? nameMatch[1].trim() : null,
        state: 'FL'
    };
}

// ============================================================================
// TIER 2: LEXISNEXIS API VERIFICATION
// ============================================================================

/**
 * Verifies death certificate with LexisNexis Risk Solutions API
 * @param {Object} certificateData - Extracted certificate data
 * @param {Object} testator - Testator information
 * @returns {Object} Verification result
 */
async function verifyWithLexisNexis(certificateData, testator) {
    console.log('[TIER 2] Verifying with LexisNexis API...');
    
    const apiRequest = {
        decedent_name: testator.name,
        date_of_birth: testator.dob,
        date_of_death: certificateData.dateOfDeath,
        state: 'FL',
        certificate_number: certificateData.certificateNumber,
        ssn: testator.ssn  // If available
    };
    
    console.log('[LEXISNEXIS] Request:', apiRequest);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // MOCK RESPONSE - In production, call actual LexisNexis API
    // API Endpoint: https://api.lexisnexis.com/risk/v1/death-verification
    const mockResponse = {
        verified: true,
        confidence: 'high',
        ssdi_match: true,  // Social Security Death Index match
        state_records_match: true,  // State vital records match
        verification_id: 'LN-' + Date.now(),
        verification_date: new Date().toISOString(),
        cost: 10.00,  // Cost per verification
        details: {
            name_match: 'exact',
            dob_match: true,
            dod_match: true,
            certificate_valid: true
        }
    };
    
    console.log('[LEXISNEXIS] Response:', mockResponse);
    
    if (mockResponse.verified && mockResponse.confidence === 'high') {
        return { 
            approved: true, 
            method: 'lexisnexis', 
            result: mockResponse 
        };
    } else if (mockResponse.verified && mockResponse.confidence === 'medium') {
        return { 
            approved: false, 
            requiresManualReview: true, 
            reason: 'Medium confidence - manual review required',
            result: mockResponse 
        };
    } else {
        return { 
            approved: false, 
            requiresManualReview: true,
            reason: 'LexisNexis verification failed',
            result: mockResponse 
        };
    }
}

// ============================================================================
// TIER 3: MANUAL STAFF REVIEW
// ============================================================================

/**
 * Flags certificate for manual review by Charter Legacy staff
 * @param {File} certificateFile - Certificate file
 * @param {string} reason - Reason for manual review
 * @returns {Object} Review task details
 */
function flagForManualReview(certificateFile, reason) {
    console.log('[TIER 3] Flagging for manual review:', reason);
    
    const reviewTask = {
        status: 'pending_review',
        reason: reason,
        flagged_at: new Date().toISOString(),
        review_by: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        priority: reason.includes('URGENT') ? 'high' : 'normal',
        reviewChecklist: [
            'Certificate appears authentic (no obvious forgery)',
            'Decedent name matches testator exactly',
            'Date of death is recent and plausible',
            'Certificate number format matches state standards',
            'Issuing authority is legitimate (county/state)',
            'Official seal is present and clear',
            'Registrar signature is present',
            'Document quality is sufficient (not blurry/altered)'
        ],
        escalation_steps: [
            'Google decedent name + obituary',
            'Check funeral home website',
            'Call issuing county to verify certificate number',
            'Request additional documentation if suspicious'
        ]
    };
    
    // In production: Create ticket in staff review system
    console.log('[MANUAL REVIEW] Task created:', reviewTask);
    
    return reviewTask;
}

// ============================================================================
// COMPLETE VERIFICATION PROCESS
// ============================================================================

/**
 * Main function to process death certificate upload
 * @param {File} file - Uploaded certificate file
 * @param {string} willId - Will ID
 * @param {string} heirId - Heir ID making the request
 * @returns {Object} Processing result
 */
async function processCertificateUpload(file, willId, heirId) {
    console.log('='.repeat(60));
    console.log('[DEATH CERTIFICATE VERIFICATION] Starting process...');
    console.log('Will ID:', willId);
    console.log('Heir ID:', heirId);
    console.log('='.repeat(60));
    
    // Get will and heir data
    const will = CONFIG.MOCK_WILLS.find(w => w.id === willId);
    if (!will) {
        return { success: false, message: 'Will not found' };
    }
    
    const heir = will.heirs.find(h => h.id === heirId);
    if (!heir) {
        return { success: false, message: 'Heir not found' };
    }
    
    // STEP 1: Basic validation
    console.log('\n[STEP 1] Running basic validation...');
    const basicCheck = await validateCertificateBasics(file, will.testator);
    
    if (!basicCheck.valid) {
        will.access_methods.death_certificate.status = 'rejected';
        
        // Log attempt
        will.access_attempts.push({
            timestamp: new Date().toISOString(),
            heir_id: heirId,
            method: 'death_certificate',
            result: 'rejected',
            reason: basicCheck.reason
        });
        
        return { 
            success: false, 
            message: 'Certificate does not meet basic requirements. Please ensure you have uploaded a valid death certificate.',
            action: 'rejected',
            details: basicCheck.checks
        };
    }
    
    // STEP 2: Extract certificate data
    console.log('\n[STEP 2] Extracting certificate data...');
    const certData = await extractCertificateData(file);
    console.log('[EXTRACTED DATA]', certData);
    
    // STEP 3: LexisNexis verification
    console.log('\n[STEP 3] Verifying with LexisNexis...');
    const lexisNexisResult = await verifyWithLexisNexis(certData, will.testator);
    
    if (lexisNexisResult.approved) {
        // AUTO-APPROVE
        console.log('\n✅ [SUCCESS] Certificate verified automatically!');
        
        will.access_methods.death_certificate.status = 'verified';
        will.access_methods.death_certificate.uploaded_at = new Date().toISOString();
        will.access_methods.death_certificate.uploaded_by = heirId;
        will.access_methods.death_certificate.verified_at = new Date().toISOString();
        will.access_methods.death_certificate.lexisnexis_result = lexisNexisResult.result;
        will.access_methods.death_certificate.certificate_file_url = '/uploads/cert-' + Date.now() + '.pdf';
        
        // Log successful verification
        will.access_attempts.push({
            timestamp: new Date().toISOString(),
            heir_id: heirId,
            method: 'death_certificate',
            result: 'verified',
            verification_method: 'lexisnexis_auto'
        });
        
        // Send hardware key verification email to heir
        sendHardwareKeyRequest(heir, will);
        
        return {
            success: true,
            message: 'Death certificate verified successfully! Check your email for the next step to access the will.',
            action: 'proceed_to_hardware_key',
            next_step: 'Enter your hardware key to complete verification'
        };
        
    } else {
        // FLAG FOR MANUAL REVIEW
        console.log('\n⚠️ [REVIEW REQUIRED] Flagging for manual review...');
        
        const reviewTask = flagForManualReview(file, lexisNexisResult.reason || 'LexisNexis verification inconclusive');
        
        will.access_methods.death_certificate.status = 'pending_review';
        will.access_methods.death_certificate.uploaded_at = new Date().toISOString();
        will.access_methods.death_certificate.uploaded_by = heirId;
        will.access_methods.death_certificate.certificate_file_url = '/uploads/cert-' + Date.now() + '.pdf';
        
        // Log review request
        will.access_attempts.push({
            timestamp: new Date().toISOString(),
            heir_id: heirId,
            method: 'death_certificate',
            result: 'pending_review',
            reason: reviewTask.reason
        });
        
        return {
            success: true,
            message: 'Your death certificate has been received and is under review. You will be notified within 48 hours.',
            action: 'manual_review',
            reviewTask: reviewTask,
            estimated_completion: reviewTask.review_by
        };
    }
}

/**
 * Sends hardware key verification request to heir
 */
function sendHardwareKeyRequest(heir, will) {
    console.log('\n[NOTIFICATION] Sending hardware key request to:', heir.email);
    console.log('Subject: Access to Legacy Will - Hardware Key Required');
    console.log('Body: Your death certificate has been verified. Please enter your hardware key to access the will.');
    console.log('Portal Link: /app/heir-portal.html?will=' + will.id + '&step=hardware-key');
    
    // In production: Send actual email via Supabase Edge Function
}

// Export functions for use in heir portal
window.DeathCertificateVerification = {
    processCertificateUpload,
    validateCertificateBasics,
    verifyWithLexisNexis,
    extractCertificateData
};

console.log('[DEATH CERTIFICATE VERIFICATION] Module loaded ✓');

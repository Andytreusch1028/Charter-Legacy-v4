// EMERGENCY ACCESS REQUEST SYSTEM
// Backup access method when death certificate unavailable

/**
 * Submits an emergency access request
 * @param {string} willId - Will ID
 * @param {string} heirId - Heir ID making the request
 * @param {Object} requestData - Request details
 * @returns {Object} Request result
 */
function submitEmergencyAccessRequest(willId, heirId, requestData) {
    console.log('='.repeat(60));
    console.log('[EMERGENCY ACCESS] Processing request...');
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
    
    // Create emergency access request
    const request = {
        id: 'req-' + Date.now(),
        will_id: willId,
        heir_id: heirId,
        heir_name: heir.name,
        heir_email: heir.email,
        submitted_at: new Date().toISOString(),
        status: 'pending_review',
        
        // Request details
        reason: requestData.reason,  // Why certificate unavailable
        urgency: requestData.urgency || 'normal',  // 'urgent', 'normal'
        
        // Alternative documentation
        alternative_docs: requestData.documents || [],  // Array of uploaded files
        documentation_types: requestData.docTypes || [],  // ['obituary', 'hospital_records', etc.]
        
        // Emergency contact for verification
        emergency_contact: {
            name: requestData.emergencyContact?.name,
            phone: requestData.emergencyContact?.phone,
            relationship: requestData.emergencyContact?.relationship
        },
        
        // Additional information
        additional_info: requestData.additionalInfo || '',
        
        // Review timeline
        review_by: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),  // 24 hours
        priority: requestData.urgency === 'urgent' ? 'high' : 'normal'
    };
    
    // Add to will's emergency access requests
    will.access_methods.emergency_access.requests.push(request);
    
    // Log access attempt
    will.access_attempts.push({
        timestamp: new Date().toISOString(),
        heir_id: heirId,
        method: 'emergency_access',
        result: 'pending_review',
        request_id: request.id
    });
    
    // Notify Charter Legacy staff for urgent review
    notifyStaffForEmergencyReview(request, will, heir);
    
    // Send confirmation to heir
    sendEmergencyRequestConfirmation(heir, request);
    
    console.log('[EMERGENCY ACCESS] Request created:', request.id);
    console.log('[EMERGENCY ACCESS] Priority:', request.priority);
    console.log('[EMERGENCY ACCESS] Review by:', request.review_by);
    
    return {
        success: true,
        message: 'Emergency access request submitted successfully. Our team will review your request within 24 hours.',
        request_id: request.id,
        estimated_review: request.review_by,
        next_steps: [
            'Our staff will review your submitted documentation',
            'We may contact your emergency contact for verification',
            'You will receive an email notification with the decision',
            'If approved, you will be sent instructions to access the will'
        ]
    };
}

/**
 * Checks status of an emergency access request
 */
function getEmergencyRequestStatus(requestId) {
    // Find request across all wills
    for (const will of CONFIG.MOCK_WILLS) {
        const request = will.access_methods.emergency_access.requests.find(r => r.id === requestId);
        if (request) {
            return {
                success: true,
                request: request,
                will_id: will.id
            };
        }
    }
    
    return {
        success: false,
        message: 'Request not found'
    };
}

/**
 * Staff function to approve emergency access request
 */
function approveEmergencyRequest(requestId, staffNotes) {
    console.log('[STAFF ACTION] Approving emergency request:', requestId);
    
    const result = getEmergencyRequestStatus(requestId);
    if (!result.success) {
        return result;
    }
    
    const will = CONFIG.MOCK_WILLS.find(w => w.id === result.will_id);
    const request = result.request;
    const heir = will.heirs.find(h => h.id === request.heir_id);
    
    // Update request status
    request.status = 'approved';
    request.approved_at = new Date().toISOString();
    request.approved_by = 'staff-001';  // Staff member ID
    request.staff_notes = staffNotes;
    
    // Log approval
    will.access_attempts.push({
        timestamp: new Date().toISOString(),
        heir_id: request.heir_id,
        method: 'emergency_access',
        result: 'approved',
        request_id: requestId,
        approved_by: 'staff-001'
    });
    
    // Send hardware key verification email to heir
    sendHardwareKeyRequest(heir, will, 'emergency_access');
    
    console.log('[STAFF ACTION] Request approved. Heir notified.');
    
    return {
        success: true,
        message: 'Emergency access request approved',
        request: request
    };
}

/**
 * Staff function to reject emergency access request
 */
function rejectEmergencyRequest(requestId, reason) {
    console.log('[STAFF ACTION] Rejecting emergency request:', requestId);
    
    const result = getEmergencyRequestStatus(requestId);
    if (!result.success) {
        return result;
    }
    
    const will = CONFIG.MOCK_WILLS.find(w => w.id === result.will_id);
    const request = result.request;
    const heir = will.heirs.find(h => h.id === request.heir_id);
    
    // Update request status
    request.status = 'rejected';
    request.rejected_at = new Date().toISOString();
    request.rejected_by = 'staff-001';
    request.rejection_reason = reason;
    
    // Log rejection
    will.access_attempts.push({
        timestamp: new Date().toISOString(),
        heir_id: request.heir_id,
        method: 'emergency_access',
        result: 'rejected',
        request_id: requestId,
        reason: reason
    });
    
    // Notify heir of rejection
    sendEmergencyRequestRejection(heir, request, reason);
    
    console.log('[STAFF ACTION] Request rejected. Heir notified.');
    
    return {
        success: true,
        message: 'Emergency access request rejected',
        request: request
    };
}

/**
 * Notifies Charter Legacy staff about emergency access request
 */
function notifyStaffForEmergencyReview(request, will, heir) {
    console.log('\n[STAFF NOTIFICATION] Emergency access request requires review');
    console.log('━'.repeat(60));
    console.log('Request ID:', request.id);
    console.log('Priority:', request.priority.toUpperCase());
    console.log('Heir:', heir.name, '(' + heir.email + ')');
    console.log('Testator:', will.testator.name);
    console.log('Reason:', request.reason);
    console.log('Documentation:', request.documentation_types.join(', '));
    console.log('Review by:', request.review_by);
    console.log('━'.repeat(60));
    console.log('Staff Portal: /app/staff/emergency-requests/' + request.id);
    
    // In production: Send email/SMS to staff, create ticket in review system
}

/**
 * Sends confirmation email to heir
 */
function sendEmergencyRequestConfirmation(heir, request) {
    console.log('\n[EMAIL] Emergency request confirmation');
    console.log('To:', heir.email);
    console.log('Subject: Emergency Access Request Received');
    console.log('Body:');
    console.log(`
        Dear ${heir.name},
        
        We have received your emergency access request for the Legacy Will.
        
        Request ID: ${request.id}
        Submitted: ${new Date(request.submitted_at).toLocaleString()}
        Priority: ${request.priority}
        
        Our team will review your request and the documentation you provided
        within 24 hours. You will receive an email notification with our decision.
        
        If you have any questions, please contact us at support@charter.legacy
        with your request ID.
        
        Best regards,
        Charter Legacy Team
    `);
    
    // In production: Send actual email
}

/**
 * Sends rejection notification to heir
 */
function sendEmergencyRequestRejection(heir, request, reason) {
    console.log('\n[EMAIL] Emergency request rejection');
    console.log('To:', heir.email);
    console.log('Subject: Emergency Access Request - Additional Information Needed');
    console.log('Body:');
    console.log(`
        Dear ${heir.name},
        
        We have reviewed your emergency access request (${request.id}).
        
        Unfortunately, we need additional information or documentation before
        we can approve your request.
        
        Reason: ${reason}
        
        Please submit a new request with the required documentation, or contact
        us at support@charter.legacy for assistance.
        
        Best regards,
        Charter Legacy Team
    `);
    
    // In production: Send actual email
}

/**
 * Sends hardware key request after emergency approval
 */
function sendHardwareKeyRequest(heir, will, accessMethod) {
    console.log('\n[EMAIL] Hardware key request');
    console.log('To:', heir.email);
    console.log('Subject: Access Approved - Hardware Key Required');
    console.log('Body:');
    console.log(`
        Dear ${heir.name},
        
        Your access request has been approved. To complete the verification
        process and access the Legacy Will, please enter your hardware key.
        
        Portal Link: /app/heir-portal.html?will=${will.id}&step=hardware-key
        
        If you do not have your hardware key, please contact us immediately.
        
        Best regards,
        Charter Legacy Team
    `);
    
    // In production: Send actual email
}

// Export functions
window.EmergencyAccess = {
    submitEmergencyAccessRequest,
    getEmergencyRequestStatus,
    approveEmergencyRequest,
    rejectEmergencyRequest
};

console.log('[EMERGENCY ACCESS] Module loaded ✓');

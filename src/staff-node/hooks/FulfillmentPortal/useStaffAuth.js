import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export const useStaffAuth = () => {
    const [user, setUser] = useState(null);
    const [staffRole, setStaffRole] = useState('staff');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            console.warn('⚠️ DIAGNOSTIC MODE: Bypassing Auth Check ⚠️');
            setUser({
                id: 'staff-dev-override',
                email: 'admin@charterlegacy.com',
                app_metadata: { staff_role: 'Superuser' }
            });
            setStaffRole('Superuser');
            setLoading(false);
        };
        
        checkUser();
    }, []);

    const handleLoginSuccess = (loggedInUser) => {
        setUser(loggedInUser);
        setStaffRole(loggedInUser.app_metadata?.staff_role || 'staff');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return {
        user,
        staffRole,
        loading,
        setLoading,
        handleLoginSuccess,
        handleLogout
    };
};

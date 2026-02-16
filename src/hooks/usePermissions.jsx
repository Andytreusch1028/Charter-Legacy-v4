import { 
    useState, 
    createContext, 
    useContext 
} from 'react';

export const PLAN_TIERS = {
    FOUNDER: 'FOUNDER',
    SHIELD: 'SHIELD',
    LEGACY: 'LEGACY'
};

const TIER_FEATURES = {
    [PLAN_TIERS.FOUNDER]: [
        'registered_agent',
        'document_templates_basic',
        'sunbiz_sync'
    ],
    [PLAN_TIERS.SHIELD]: [
        'registered_agent',
        'document_templates_basic',
        'sunbiz_sync',
        'asset_sentry'
    ],
    [PLAN_TIERS.LEGACY]: [
        'registered_agent',
        'document_templates_basic',
        'sunbiz_sync',
        'asset_sentry',
        'dead_mans_switch'
    ]
};

const PContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
    const [currentTier, setCurrentTier] = useState(
        PLAN_TIERS.SHIELD
    );
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(
        false
    );

    const canAccess = (k) => {
        const allowed = TIER_FEATURES[currentTier] || [];
        return allowed.includes(k);
    };

    const upgradeTier = (t) => {
        setCurrentTier(t);
        setIsUpgradeModalOpen(false);
    };

    return (
        <PContext.Provider 
            value={{ 
                currentTier, 
                canAccess, 
                upgradeTier, 
                isUpgradeModalOpen, 
                setIsUpgradeModalOpen 
            }}
        >
            {children}
        </PContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PContext);
    if (!context) {
        throw new Error(
            'usePermissions error'
        );
    }
    return context;
};

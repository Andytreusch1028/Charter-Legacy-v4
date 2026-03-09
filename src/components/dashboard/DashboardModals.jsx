import React from 'react';
import { AnimatePresence } from 'framer-motion';

import FoundersBlueprint from '../../FoundersBlueprint';
import SuccessionSuite from '../../lib/succession/SuccessionSuite';
import DesignationProtocol from '../../DesignationProtocol';
import RegisteredAgentConsole from '../../RegisteredAgentConsole';
import AnnualReportWizard from '../AnnualReportWizard';
import DBAWizard from '../DBAWizard';
import DBARenewalWizard from '../DBARenewalWizard';
import ReinstatementWizard from '../ReinstatementWizard';
import DissolutionWizard from '../DissolutionWizard';
import CertificateOfStatusWizard from '../CertificateOfStatusWizard';
import BOIWizard from '../BOIWizard';
import MercuryApplyWizard from '../MercuryApplyWizard';
import MembershipLedger from './MembershipLedger';

const DashboardModals = ({
    user,
    llcData,
    activeDBA,
    setLlcData,
    
    // UI States
    isBlueprintOpen, setIsBlueprintOpen, blueprintStep,
    showDesignation, setShowDesignation,
    isRAConsoleOpen, setIsRAConsoleOpen,
    isAnnualReportWizardOpen, setIsAnnualReportWizardOpen,
    isDBAWizardOpen, setIsDBAWizardOpen,
    isDBARenewalWizardOpen, setIsDBARenewalWizardOpen,
    isReinstatementWizardOpen, setIsReinstatementWizardOpen,
    isDissolutionWizardOpen, setIsDissolutionWizardOpen,
    isCertStatusWizardOpen, setIsCertStatusWizardOpen,
    isBOIWizardOpen, setIsBOIWizardOpen,
    isMercuryWizardOpen, setIsMercuryWizardOpen,
    isLedgerOpen, setIsLedgerOpen
}) => {
    return (
        <>
            <AnimatePresence>
                {isBlueprintOpen && (
                    <FoundersBlueprint 
                        isOpen={isBlueprintOpen} 
                        onClose={() => setIsBlueprintOpen(false)} 
                        llcData={llcData} 
                        initialStep={blueprintStep}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                <SuccessionSuite user={user} />
            </AnimatePresence>

            <AnimatePresence>
                {showDesignation && (
                    <DesignationProtocol 
                        onComplete={(data) => {
                            setLlcData(data);
                            setShowDesignation(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRAConsoleOpen && (
                    <RegisteredAgentConsole 
                        isModal={true}
                        onClose={() => setIsRAConsoleOpen(false)}
                        initialTab={isRAConsoleOpen}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAnnualReportWizardOpen && (
                    <AnnualReportWizard 
                        llcData={llcData} 
                        onClose={() => setIsAnnualReportWizardOpen(false)}
                        onComplete={() => setIsAnnualReportWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDBAWizardOpen && (
                    <DBAWizard 
                        llcData={llcData} 
                        onClose={() => setIsDBAWizardOpen(false)}
                        onComplete={() => setIsDBAWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDBARenewalWizardOpen && (
                    <DBARenewalWizard 
                        llcData={llcData} 
                        activeDBA={activeDBA}
                        onClose={() => setIsDBARenewalWizardOpen(false)}
                        onComplete={() => setIsDBARenewalWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isReinstatementWizardOpen && (
                    <ReinstatementWizard 
                        llcData={llcData} 
                        onClose={() => setIsReinstatementWizardOpen(false)}
                        onComplete={() => setIsReinstatementWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDissolutionWizardOpen && (
                    <DissolutionWizard 
                        llcData={llcData} 
                        onClose={() => setIsDissolutionWizardOpen(false)}
                        onComplete={() => setIsDissolutionWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCertStatusWizardOpen && (
                    <CertificateOfStatusWizard 
                        llcData={llcData} 
                        onClose={() => setIsCertStatusWizardOpen(false)}
                        onComplete={() => setIsCertStatusWizardOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isBOIWizardOpen && (
                    <BOIWizard 
                        llcData={llcData} 
                        onClose={() => setIsBOIWizardOpen(false)}
                        onComplete={() => setIsBOIWizardOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMercuryWizardOpen && (
                    <MercuryApplyWizard 
                        llcData={llcData} 
                        onClose={() => setIsMercuryWizardOpen(false)} 
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLedgerOpen && (
                    <MembershipLedger 
                        llcData={llcData} 
                        onClose={() => setIsLedgerOpen(false)} 
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default DashboardModals;

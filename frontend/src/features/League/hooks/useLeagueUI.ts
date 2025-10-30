import { useState } from 'react';

/**
 * Hook: Manage UI state (tabs, modals)
 * Responsibility: UI state management only
 */
export const useLeagueUI = () => {
    const [activeTab, setActiveTab] = useState<'lineup' | 'standings'>('lineup');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    
    return {
        activeTab,
        setActiveTab,
        showLeaveModal,
        setShowLeaveModal,
    };
};
import { useState } from 'react';

/**
 * Hook para gestionar el estado de los modales de la página Leagues
 */
export const useLeagueModals = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);
  
  const openJoinModal = () => setShowJoinModal(true);
  const closeJoinModal = () => setShowJoinModal(false);

  return {
    // Estado
    showCreateModal,
    showJoinModal,
    
    // Acciones
    openCreateModal,
    closeCreateModal,
    openJoinModal,
    closeJoinModal,
  };
};

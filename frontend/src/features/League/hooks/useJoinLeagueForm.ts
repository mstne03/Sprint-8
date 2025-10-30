import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagues } from '@/core/contexts/LeaguesContext';
import { formatCurrencyPrecise } from '@/features/Market/utils';

interface UseJoinLeagueFormProps {
    onClose: () => void;
}

export const useJoinLeagueForm = ({ onClose }: UseJoinLeagueFormProps) => {
    const { joinLeague } = useLeagues();
    const navigate = useNavigate();
    
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await joinLeague({ join_code: joinCode.trim() });
            
            // Show success message with team initialization info
            if (result.team_initialized) {
                const budget = result.team_details?.budget_remaining 
                    ? formatCurrencyPrecise(result.team_details.budget_remaining)
                    : '$100M';
                setSuccessMessage(`Welcome! Your starter team has been created with 3 free drivers. Full budget available: ${budget}`);
            } else {
                setSuccessMessage('Successfully joined league!');
            }
            
            // Navigate after showing message briefly
            setTimeout(() => {
                onClose();
                setJoinCode('');
                setSuccessMessage(null);
                navigate(`/leagues/${result.league_id}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to join league');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinCodeChange = (value: string) => {
        setJoinCode(value.toUpperCase());
    };

    return {
        joinCode,
        isLoading,
        error,
        successMessage,
        handleSubmit,
        handleJoinCodeChange
    };
};

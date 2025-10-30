import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagues } from '@/core/contexts/LeaguesContext';

interface CreateLeagueFormData {
    name: string;
    description: string;
}

interface UseCreateLeagueFormProps {
    onClose: () => void;
}

export const useCreateLeagueForm = ({ onClose }: UseCreateLeagueFormProps) => {
    const { createLeague } = useLeagues();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<CreateLeagueFormData>({
        name: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const newLeague = await createLeague({
                name: formData.name,
                description: formData.description || undefined
            });
            onClose();
            setFormData({
                name: '',
                description: ''
            });
            // Navigate to the newly created league
            navigate(`/leagues/${newLeague.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create league');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return {
        formData,
        isLoading,
        error,
        handleSubmit,
        handleInputChange
    };
};

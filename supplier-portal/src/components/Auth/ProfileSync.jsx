import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import api from '../../services/api';

export default function ProfileSync() {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        const sync = async () => {
            if (isSignedIn && user) {
                try {
                    const token = await getToken();
                    await api.post('/profiles/sync', {
                        email: user.primaryEmailAddress?.emailAddress,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        imageUrl: user.imageUrl
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (err) {
                    // Sync errors are non-critical
                }
            }
        };
        sync();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, user?.id]); // getToken intentionally excluded — stable but causes re-renders

    return null;
}

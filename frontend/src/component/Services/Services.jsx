import React from 'react'
import { FaHeadphonesAlt } from 'react-icons/fa'
import { FaCarSide, FaWallet, FaShieldHalved } from 'react-icons/fa6'
import { useAppConfig } from '../context/ConfigContext'

const ICON_MAP = {
    shield: <FaShieldHalved className="text-4xl md:text-5xl text-orange-400" />,
    wallet: <FaWallet className='text-4xl md:text-5xl text-orange-400' />,
    car: <FaCarSide className='text-4xl md:text-5xl text-orange-400' />,
    headphones: <FaHeadphonesAlt className='text-4xl md:text-5xl text-orange-400' />
};

const DEFAULT_SERVICES = [
    { id: 1, icon: 'shield', title: 'Paiement à la réception', description: 'Payez quand vous recevez' },
    { id: 2, icon: 'wallet', title: 'Transactions sécurisées', description: 'Données protégées' },
    { id: 3, icon: 'car', title: 'Livraison simplifiée', description: 'Suivi & coordination' },
    { id: 4, icon: 'headphones', title: 'Support 7j/7', description: 'À votre écoute' },
];

const Services = () => {
    const { getConfig } = useAppConfig();
    let serviceData = DEFAULT_SERVICES;
    try {
        const raw = getConfig('services_cards');
        if (raw) serviceData = JSON.parse(raw);
    } catch (_) {}

    return (
        <div>
            <div className='container mt-6 md:mt-10 px-6'>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6'>
                    {serviceData.map((data) => (
                        <div
                            key={data.id}
                            className={`flex flex-col items-start truncate sm:flex-row gap-4 ${data.icon === 'headphones' ? 'cursor-pointer group' : ''}`}
                            onClick={data.icon === 'headphones' ? () => window.dispatchEvent(new Event('open-support-chat')) : undefined}
                        >
                            {ICON_MAP[data.icon] || ICON_MAP.shield}
                            <div>
                                <h1 className={`lg:text-xl text-base-content/80 font-bold ${data.icon === 'headphones' ? 'group-hover:text-primary transition-colors' : ''}`}>{data.title}</h1>
                                <h1 className='text-base-content/50 text-sm'>{data.description}</h1>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Services

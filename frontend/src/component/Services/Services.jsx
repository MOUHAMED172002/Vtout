import React from 'react'
import { FaHeadphonesAlt } from 'react-icons/fa'
import { FaCarSide, FaWallet, FaShieldHalved } from 'react-icons/fa6'


const ServiceData = [
    {
        id: 1,
        icon: <FaShieldHalved className="text-4xl md:text-5xl text-orange-400" />,
        title: 'Paiement à la réception',
        description: 'Payez quand vous recevez',
    },
    {
        id: 2,
        icon: <FaWallet className='text-4xl md:text-5xl text-orange-400' />,
        title: 'Transactions sécurisées',
        description: 'Données protégées',
    },
    {
        id: 3,
        icon: <FaCarSide className='text-4xl md:text-5xl text-orange-400' />,
        title: 'Livraison simplifiée',
        description: 'Suivi & coordination',
    },
    {
        id: 4,
        icon: <FaHeadphonesAlt className='text-4xl md:text-5xl text-orange-400' />,
        title: 'Support 7j/7',
        description: 'À votre écoute',
    },
]

const Services = () => {
    return (
        <div>
            <div className='container mt-14 md:mt-20 px-6'>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8'>
                    {
                        ServiceData.map((data) => (
                            <div
                                key={data.id}
                                className={`flex flex-col items-start truncate sm:flex-row gap-4 ${data.id === 4 ? 'cursor-pointer group' : ''}`}
                                onClick={data.id === 4 ? () => window.dispatchEvent(new Event('open-support-chat')) : undefined}
                            >
                                {data.icon}
                                <div>
                                    <h1 className={`lg:text-xl text-base-content/80 font-bold ${data.id === 4 ? 'group-hover:text-primary transition-colors' : ''}`}>{data.title}</h1>
                                    <h1 className='text-base-content/50 text-sm'>{data.description}</h1>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Services

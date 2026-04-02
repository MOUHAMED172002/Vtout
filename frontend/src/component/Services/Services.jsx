import React from 'react'
import { FaHeadphonesAlt } from 'react-icons/fa'
import { FaCarSide ,FaWallet, FaCircleCheck } from 'react-icons/fa6'


const ServiceData =[
    {
        id:1,
        icon:<FaCarSide className="text-4xl md:text-5xl text-orange-400"/>,
        title:'Livraison gratuite',
        description: "Livraison gratuite et rapide"

    },
    {
        id:2,
        icon:<FaCircleCheck className='text-4xl md:text-5xl text-orange-400'/>,
        title:'Safe Money',
        description:'30 Days Money Back'
    },
    {
        id:3,
        icon:<FaHeadphonesAlt className='text-4xl md:text-5xl text-orange-400' />,
        title:"Support en ligne 24/7",
        description:"Support client a l'écoute 24/7"
    },
    {
        id:4,
        icon:<FaWallet className='text-4xl md:text-5xl text-orange-400'/>,
        title:"Paiement sécurisé",
        description:"Tous vos paiement sont sécurisé"
    },
    
]

const Services = () => {
  return (
    <div>
        <div className='container mt-14 md:mt-20 px-6'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8'>
                {
                    ServiceData.map((data)=>(
                        <div
                          key={data.id}
                          className={`flex flex-col items-start truncate sm:flex-row gap-4 ${data.id === 3 ? 'cursor-pointer group' : ''}`}
                          onClick={data.id === 3 ? () => window.dispatchEvent(new Event('open-support-chat')) : undefined}
                        >
                            {data.icon}
                            <div>
                                <h1 className={`lg:text-xl text-gray-500 font-bold ${data.id === 3 ? 'group-hover:text-primary transition-colors' : ''}`}>{data.title}</h1>
                                <h1 className='text-gray-400 text-sm'>{data.description}</h1>
                            </div>
                        </div>
                    ))
                }
                <div>

                </div>
            </div>
        </div>
    </div>
  )
}

export default Services

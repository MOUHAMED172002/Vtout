import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppConfig } from '../context/ConfigContext';

const FooterLinks = [
    { title: "Accueil", link: "/" },
    { title: "Boutique", link: "/products-liste" },
    { title: "À propos", link: "/about" },
];

const FooterNav = [
    { title: "Supports", link: "/#" },
    { title: "FAQ", link: "/Faq" },
    { title: "Politique de confidentialité", link: "/Policy" },
    { title: "Devenir livreur", link: "/devenir-livreur" },
];

const Footer = () => {
    const { getConfig } = useAppConfig();
    const appName = getConfig('APP_NAME', 'VTOUT');
    const firstLetter = appName.charAt(0);
    const restOfName = appName.slice(1);

    const socials = {
        facebook: getConfig('FACEBOOK', '#'),
        instagram: getConfig('INSTAGRAM', '#'),
        twitter: getConfig('TWITTER', '#'),
        whatsapp: getConfig('WHATSAPP', '#'),
    };

    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-70"></div>

            <div className="container px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-black tracking-tighter text-gray-900 group">
                            <span className="text-primary transition-transform group-hover:rotate-12 inline-block">{firstLetter}</span>{restOfName}
                        </Link>
                        <p className="text-gray-500 leading-relaxed max-w-xs">
                            Votre destination shopping unique au Bénin. Comme notre nom l'indique, chez {appName}, on vend tout type de produit.
                        </p>
                        <div className="flex gap-4">
                            {socials.instagram !== '#' && (
                                <a href={socials.instagram} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-2xl transition-all">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {socials.facebook !== '#' && (
                                <a href={socials.facebook} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-2xl transition-all">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {socials.whatsapp !== '#' && (
                                <a href={socials.whatsapp} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-2xl transition-all">
                                    <Phone size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Navigation</h3>
                        <ul className="space-y-4">
                            {FooterLinks.map((data, index) => (
                                <li key={index}>
                                    <Link to={data.link} className="text-gray-600 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {data.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Service Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Assistance</h3>
                        <ul className="space-y-4">
                            {FooterNav.map((data, index) => (
                                <li key={index}>
                                    {data.title === "Supports" ? (
                                        <button
                                            onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                                            className="text-gray-600 font-bold hover:text-primary transition-colors flex items-center gap-2 group"
                                        >
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </button>
                                    ) : (
                                        <Link to={data.link} className="text-gray-600 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 text-primary rounded-2xl">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Calavi Bidosèssi</p>
                                    <p className="text-sm text-gray-500">Cotonou, Bénin</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 text-primary rounded-2xl">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">+229 61 23 45 67</p>
                                    <p className="text-sm text-gray-500">Lun - Sam, 9h-19h</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 text-primary rounded-2xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">contact@vtout.bj</p>
                                    <p className="text-sm text-gray-500">Support 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm font-medium">
                        © {new Date().getFullYear()} <span className="text-gray-900 font-bold">{appName}</span>. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" /> Paiements 100% sécurisés
                        </div>
                        <div className="hidden md:block h-3 w-px bg-gray-200"></div>
                        <span className="hover:text-gray-900 cursor-pointer transition-colors">Politique</span>
                        <span className="hover:text-gray-900 cursor-pointer transition-colors">CGU</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

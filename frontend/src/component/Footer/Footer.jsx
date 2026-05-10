import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppConfig } from '../context/ConfigContext';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import ThemeSelector from '../context/ThemeSelector';
import LogoText from '../Shared/LogoText';

const FooterLinks = [
    { title: "Accueil", link: "/" },
    { title: "Boutique", link: "/products-liste" },
    { title: "À propos", link: "/about" },
    { title: "Devenir vendeur", link: import.meta.env.VITE_SUPPLIER_PORTAL_URL || "https://vendeur.vtout.com", external: true },
    { title: "Devenir livreur", link: "/devenir-livreur" },
];

const FooterNav = [
    { title: "Blog", link: "/mag" },
    { title: "Supports", link: "/#" },
    { title: "FAQ", link: "/Faq" },
    { title: "Témoignages", link: "/temoignages" },
    { title: "Politique de confidentialité", link: "/privacy" },

];

const Footer = () => {
    const { getConfig } = useAppConfig();
    const appName = getConfig('APP_NAME', 'VTOUT');
    const firstLetter = appName.charAt(0);
    const restOfName = appName.slice(1);

    const socials = {
        facebook: getConfig('FACEBOOK'),
        instagram: getConfig('INSTAGRAM'),
        tiktok: getConfig('TIKTOK'),
        twitter: getConfig('TWITTER'),
        whatsapp: getConfig('WHATSAPP'),
    };

    return (
        <footer className="bg-base-100 border-t border-base-200 pt-20 pb-10 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-70"></div>

            <div className="container px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="group flex items-center">
                            <LogoText className="text-3xl" />
                        </Link>
                        <p className="text-base-content/70 leading-relaxed max-w-xs">
                            Votre destination shopping unique au Bénin. Comme notre nom l'indique, chez {appName}, on vend tout .
                        </p>
                        <div className="flex gap-4">
                            {socials.instagram && (
                                <a href={socials.instagram} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="Instagram">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {socials.facebook && (
                                <a href={socials.facebook} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="Facebook">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {socials.tiktok && (
                                <a href={socials.tiktok} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="TikTok">
                                    <FaTiktok size={20} />
                                </a>
                            )}
                            {socials.whatsapp && (
                                <a href={socials.whatsapp.startsWith('http') ? socials.whatsapp : `https://wa.me/${socials.whatsapp}`} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="WhatsApp">
                                    <FaWhatsapp size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/50">Navigation</h3>
                        <ul className="space-y-4">
                            {FooterLinks.map((data, index) => (
                                <li key={index}>
                                    {data.external ? (
                                        <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </a>
                                    ) : (
                                        <Link to={data.link} className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Service Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/50">Assistance</h3>
                        <ul className="space-y-4">
                            {FooterNav.map((data, index) => (
                                <li key={index}>
                                    {data.title === "Supports" ? (
                                        <button
                                            onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                                            className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group"
                                        >
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </button>
                                    ) : (
                                        <Link to={data.link} className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/50">Contact</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-base-200 text-primary rounded-2xl">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-base-content">{getConfig('CONTACT_ADDRESS', 'Cotonou, Bénin')}</p>
                                    <p className="text-sm text-base-content/70">Siège Social</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-base-200 text-primary rounded-2xl">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <a href={`tel:${getConfig('CONTACT_PHONE', '+229 61 00 00 00')}`} className="font-bold text-base-content hover:text-primary transition-colors">
                                        {getConfig('CONTACT_PHONE', '+229 61 00 00 00')}
                                    </a>
                                    <p className="text-sm text-base-content/70">{getConfig('hours_weekday', 'Lun - Sam, 8h-18h')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-base-200 text-primary rounded-2xl">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <a href={`mailto:${getConfig('CONTACT_EMAIL', 'contact@vtout.bj')}`} className="font-bold text-base-content hover:text-primary transition-colors">
                                        {getConfig('CONTACT_EMAIL', 'contact@vtout.bj')}
                                    </a>
                                    <p className="text-sm text-base-content/70">Support 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="pt-10 border-t border-base-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-base-content/50 text-sm font-medium">
                        © {new Date().getFullYear()} <LogoText className="text-sm ml-1" />. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-base-content/50 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" /> Paiements 100% sécurisés
                        </div>
                        <div className="hidden md:block h-3 w-px bg-base-300"></div>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Politique de confidentialité</Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Politique de livraison</Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Politique de retours et de remboursement </Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Politique des produits interdits</Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Politique de résolution des litiges</Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Condition livreur </Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">Condition vendeur</Link>
                        <Link to="/Policy" className="hover:text-base-content cursor-pointer transition-colors">CGV</Link>
                        <div className="hidden md:block h-3 w-px bg-base-300"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

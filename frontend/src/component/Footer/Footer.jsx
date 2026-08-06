import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppConfig } from '../context/ConfigContext';
import { FaTiktok, FaWhatsapp } from 'react-icons/fa';
import LogoText from '../Shared/LogoText';
import { getPolicies } from '../../services/contentService';

const FooterLinks = [
    { title: "Accueil", link: "/" },
    { title: "Boutique", link: "/products-liste" },
    { title: "Promotions", link: "/promotions" },
    { title: "Comment ça marche", link: "/comment-ca-marche/acheteur" },
    { title: "À propos", link: "/about" },
    { title: "Devenir vendeur", link: import.meta.env.VITE_SUPPLIER_PORTAL_URL || "https://vendeur.vtout.com", external: true },
    { title: "Devenir livreur", link: "/devenir-livreur" },
    { title: "Devenir annonceur", link: "/devenir-annonceur" },
];

const FooterNav = [
    { title: "Blog", link: "/mag" },
    { title: "Supports", link: "/#" },
    { title: "FAQ", link: "/Faq" },
    { title: "Témoignages", link: "/temoignages" },

    { title: "Mentions légales", link: "/mentions-legales" },
];

const Footer = () => {
    const { getConfig } = useAppConfig();
    const appName = getConfig('APP_NAME', 'VTOUT');
    const [policyLinks, setPolicyLinks] = useState([]);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const data = await getPolicies();
                if (data && data.length > 0) {
                    const links = data.map(p => ({
                        title: p.title,
                        link: `/Policy?tab=${encodeURIComponent(p.title)}`
                    }));
                    setPolicyLinks(links);
                }
            } catch (error) {
                console.error("Failed to load policies in footer", error);
            }
        };
        fetchPolicies();
    }, []);

    const socials = {
        facebook: getConfig('FACEBOOK'),
        instagram: getConfig('INSTAGRAM'),
        tiktok: getConfig('TIKTOK'),
        twitter: getConfig('TWITTER'),
        whatsapp: getConfig('WHATSAPP'),
    };

    const handleLinkClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-base-100 border-t border-base-200 pt-12 pb-6 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70"></div>

            <div className="container px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 pb-8">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" onClick={handleLinkClick} className="group flex items-center">
                            <LogoText className="text-3xl" />
                        </Link>
                        <p className="text-base-content/70 leading-relaxed max-w-xs">
                            Votre marketplace de référence au Bénin.<br />
                            Sur {appName}, des vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple et sécurisée.
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
                            {socials.tiktok ? (
                                <a href={socials.tiktok} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="TikTok">
                                    <FaTiktok size={20} />
                                </a>
                            ) : (
                                <span className="p-3 bg-base-200 text-base-content/30 rounded-2xl cursor-default" title="TikTok (lien non configuré)">
                                    <FaTiktok size={20} />
                                </span>
                            )}
                            {socials.whatsapp && (
                                <a href={socials.whatsapp.startsWith('http') ? socials.whatsapp : `https://wa.me/${socials.whatsapp}`} target="_blank" rel="noreferrer" className="p-3 bg-base-200 text-base-content/50 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all" title="WhatsApp">
                                    <FaWhatsapp size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60">Navigation</h3>
                        <ul className="space-y-3">
                            {FooterLinks.map((data, index) => (
                                <li key={index}>
                                    {data.external ? (
                                        <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </a>
                                    ) : (
                                        <Link to={data.link} onClick={handleLinkClick} className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Service Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60">Assistance</h3>
                        <ul className="space-y-3">
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
                                        <Link to={data.link} onClick={handleLinkClick} className="text-base-content/80 font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                                            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {data.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-base-content/60">Contact</h3>
                        <div className="space-y-3">
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
                                    <a href={`mailto:${getConfig('CONTACT_EMAIL', 'contact@vtout.com')}`} className="font-bold text-base-content hover:text-primary transition-colors">
                                        {getConfig('CONTACT_EMAIL', 'contact@vtout.com')}
                                    </a>
                                    <p className="text-sm text-base-content/70">Support 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="pt-6 border-t border-base-200 flex flex-col lg:flex-row justify-between items-center gap-6">

                    {/* Copyright & Trust Section */}
                    <div className="flex flex-col items-center lg:items-start gap-6">
                        <div className="flex flex-col items-center lg:flex-row gap-3 lg:gap-4">
                            <LogoText className="text-2xl" />
                            <div className="hidden lg:block w-px h-4 bg-base-300"></div>
                            <p className="text-base-content/60 text-sm font-medium">
                                © {new Date().getFullYear()} Tous droits réservés.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-base-200 border border-base-300 rounded-2xl text-base-content/70 text-[10px] font-black uppercase tracking-[0.2em]">
                            <ShieldCheck size={16} className="text-success" />
                            <span>Paiements 100% sécurisés</span>
                        </div>
                    </div>

                    {/* Policy Links Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end items-center gap-x-8 gap-y-6 lg:gap-x-6 lg:gap-y-2">
                        {policyLinks.map((item, index) => (
                            <React.Fragment key={index}>
                                <Link
                                    to={item.link}
                                    onClick={handleLinkClick}
                                    className="text-base-content/60 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-all text-center lg:text-right"
                                >
                                    {item.title}
                                </Link>
                                {index < policyLinks.length - 1 && (
                                    <div className="hidden lg:block w-1 h-1 rounded-full bg-base-content/30"></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

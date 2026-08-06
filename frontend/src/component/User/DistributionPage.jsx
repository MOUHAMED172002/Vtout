import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../lib/AuthHooks";
import { Megaphone, Phone, ShieldCheck, Wallet, Camera, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import {
    requestPhoneOtp, verifyPhoneOtp, getMyDistributorProfile, updateMomoNumber,
    getAvailableCampaigns, claimCampaign, getMySubmissions,
    submitEarlyScreenshot, submitLateScreenshot, submitLiveCheckScreenshot
} from "../../services/adDistributionService";

const STATUS_META = {
    pending: { label: "Capture précoce attendue", cls: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
    awaiting_late: { label: "Capture tardive attendue", cls: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
    live_check: { label: "Vérification demandée !", cls: "bg-rose-50 text-rose-600 border-rose-100", icon: AlertTriangle },
    under_review: { label: "En cours de vérification", cls: "bg-blue-50 text-blue-600 border-blue-100", icon: Clock },
    verified: { label: "Validée — paiement en attente", cls: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle },
    paid: { label: "Payée", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Wallet },
    rejected: { label: "Rejetée", cls: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle },
};

export default function DistributionPage() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    // OTP flow
    const [phone, setPhone] = useState("");
    const [otpStep, setOtpStep] = useState("phone"); // phone | code
    const [code, setCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const [momoInput, setMomoInput] = useState("");
    const [uploadingFor, setUploadingFor] = useState(null); // submission id currently uploading
    const fileInputRefs = useRef({});

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const p = await getMyDistributorProfile(token);
            setProfile(p);
            setMomoInput(p?.momo_number || "");
            if (p?.verified_phone) {
                const [c, s] = await Promise.all([getAvailableCampaigns(token), getMySubmissions(token)]);
                setCampaigns(c || []);
                setSubmissions(s || []);
            }
        } catch (err) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleRequestOtp = async () => {
        if (!phone.trim()) return toast.error("Entrez votre numéro WhatsApp");
        setOtpLoading(true);
        try {
            const token = await getToken();
            await requestPhoneOtp(phone, token);
            toast.success("Code envoyé sur WhatsApp !");
            setOtpStep("code");
        } catch (err) {
            toast.error(err.response?.data?.error || "Échec de l'envoi du code");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!code.trim()) return toast.error("Entrez le code reçu");
        setOtpLoading(true);
        try {
            const token = await getToken();
            await verifyPhoneOtp(phone, code, token);
            toast.success("Numéro vérifié !");
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.error || "Code invalide");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSaveMomo = async () => {
        if (!momoInput.trim()) return;
        try {
            const token = await getToken();
            await updateMomoNumber(momoInput, token);
            toast.success("Numéro Mobile Money enregistré");
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleClaim = async (campaignId) => {
        try {
            const token = await getToken();
            await claimCampaign(campaignId, token);
            toast.success("Campagne réclamée ! Publiez le visuel en Statut puis envoyez votre 1ère capture.");
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur");
        }
    };

    const handleFileUpload = async (submission, kind, file) => {
        if (!file) return;
        setUploadingFor(submission.id);
        try {
            const token = await getToken();
            const fn = kind === "early" ? submitEarlyScreenshot : kind === "late" ? submitLateScreenshot : submitLiveCheckScreenshot;
            const res = await fn(submission.id, file, token);
            if (res.flagged) {
                toast.error("Capture envoyée, mais signalée pour vérification manuelle.");
            } else {
                toast.success("Capture envoyée !");
            }
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.error || "Échec de l'envoi");
        } finally {
            setUploadingFor(null);
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-base-content/40 text-sm">Chargement…</div>;
    }

    const isVerified = !!profile?.verified_phone;
    const isBanned = profile?.trust_level === "banned";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Megaphone size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-base-content">Distribution WhatsApp</h1>
                    <p className="text-sm text-base-content/50 mt-0.5">Publiez des campagnes en Statut WhatsApp et soyez payé pour chaque diffusion validée.</p>
                </div>
            </div>

            {isBanned && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                    <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-rose-700 text-sm">Compte suspendu</p>
                        <p className="text-xs text-rose-600 mt-0.5">{profile.ban_reason || "Votre compte a été banni du programme de distribution."}</p>
                    </div>
                </div>
            )}

            {!isVerified && !isBanned && (
                <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-black text-base-content flex items-center gap-2"><ShieldCheck size={18} className="text-primary" /> Vérifiez votre numéro WhatsApp</h3>
                    <p className="text-xs text-base-content/50">Obligatoire pour participer — un numéro = un compte distributeur.</p>
                    {otpStep === "phone" ? (
                        <div className="flex gap-2">
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229 00 00 00 00"
                                className="flex-1 px-4 py-3 bg-base-200 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            <button onClick={handleRequestOtp} disabled={otpLoading} className="px-5 py-3 bg-primary text-white rounded-2xl text-sm font-black disabled:opacity-50">
                                {otpLoading ? "…" : "Recevoir le code"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} placeholder="Code reçu"
                                className="flex-1 px-4 py-3 bg-base-200 border-none rounded-2xl text-sm font-black tracking-[0.3em] text-center outline-none focus:ring-2 focus:ring-primary/20" />
                            <button onClick={handleVerifyOtp} disabled={otpLoading} className="px-5 py-3 bg-primary text-white rounded-2xl text-sm font-black disabled:opacity-50">
                                {otpLoading ? "…" : "Vérifier"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isVerified && !isBanned && (
                <>
                    {/* Momo */}
                    <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 space-y-3">
                        <h3 className="font-black text-base-content flex items-center gap-2"><Wallet size={18} className="text-primary" /> Numéro Mobile Money (paiement)</h3>
                        <div className="flex gap-2">
                            <input type="tel" value={momoInput} onChange={e => setMomoInput(e.target.value)}
                                className="flex-1 px-4 py-3 bg-base-200 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                            <button onClick={handleSaveMomo} className="px-5 py-3 bg-base-content/5 text-base-content rounded-2xl text-sm font-black hover:bg-base-content/10">Enregistrer</button>
                        </div>
                    </div>

                    {/* Campaigns */}
                    <div className="space-y-3">
                        <h3 className="font-black text-base-content">Campagnes disponibles</h3>
                        {campaigns.length === 0 ? (
                            <div className="py-10 text-center text-base-content/30 text-sm bg-base-100 rounded-3xl border border-base-200">Aucune campagne disponible pour le moment.</div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {campaigns.map(c => (
                                    <div key={c.id} className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                                        <img src={c.creative_url} alt="" className="w-full aspect-video object-cover" />
                                        <div className="p-4 space-y-2">
                                            <p className="font-black text-sm text-base-content">{c.title}</p>
                                            <p className="text-lg font-black text-primary">{Number(c.reward_amount).toLocaleString("fr-FR")} F</p>
                                            {c.already_claimed ? (
                                                <span className="block text-center py-2 text-xs font-black text-base-content/30">Déjà réclamée</span>
                                            ) : (
                                                <button onClick={() => handleClaim(c.id)} className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90">Participer</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My submissions */}
                    <div className="space-y-3">
                        <h3 className="font-black text-base-content">Mes soumissions</h3>
                        {submissions.length === 0 ? (
                            <div className="py-10 text-center text-base-content/30 text-sm bg-base-100 rounded-3xl border border-base-200">Aucune soumission pour le moment.</div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map(s => {
                                    const meta = STATUS_META[s.status] || STATUS_META.pending;
                                    const Icon = meta.icon;
                                    const needsEarly = s.status === "pending";
                                    const needsLate = s.status === "awaiting_late";
                                    const needsLive = s.status === "live_check";
                                    const isUploading = uploadingFor === s.id;
                                    return (
                                        <div key={s.id} className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 space-y-3">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <p className="font-black text-sm text-base-content">{s.campaign?.title}</p>
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${meta.cls}`}>
                                                    <Icon size={11} /> {meta.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-base-content/40">
                                                {Number(s.reward_amount).toLocaleString("fr-FR")} F
                                                {s.status === "verified" && s.payout_eligible_at && ` · Payable à partir du ${new Date(s.payout_eligible_at).toLocaleString("fr-FR")}`}
                                                {s.status === "rejected" && s.rejection_reason && ` · ${s.rejection_reason}`}
                                            </p>

                                            {(needsEarly || needsLate || needsLive) && (
                                                <div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        capture="environment"
                                                        className="hidden"
                                                        ref={el => (fileInputRefs.current[s.id] = el)}
                                                        onChange={e => handleFileUpload(s, needsEarly ? "early" : needsLate ? "late" : "live", e.target.files[0])}
                                                    />
                                                    <button
                                                        onClick={() => fileInputRefs.current[s.id]?.click()}
                                                        disabled={isUploading}
                                                        className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary/20 disabled:opacity-50"
                                                    >
                                                        <Camera size={14} />
                                                        {isUploading ? "Envoi…" : needsEarly ? "Envoyer la capture précoce" : needsLate ? "Envoyer la capture tardive" : "Envoyer la capture demandée"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

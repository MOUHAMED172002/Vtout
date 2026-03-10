import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could log the error to a service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 border border-slate-100">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <AlertCircle size={40} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Oups ! Quelque chose s'est mal passé.</h1>
                            <p className="text-slate-500 font-bold leading-relaxed">
                                Une erreur inattendue est survenue. Nos ingénieurs ont été prévenus.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary rounded-2xl h-14 font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                            >
                                <RefreshCw size={20} /> Réessayer
                            </button>
                            <a
                                href="/"
                                className="btn bg-slate-100 hover:bg-slate-200 border-none text-slate-700 rounded-2xl h-14 font-black flex items-center justify-center gap-3"
                            >
                                <Home size={20} /> Retour à l'accueil
                            </a>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-2xl text-left overflow-auto max-h-40">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Détails de l'erreur (Dev uniquement)</p>
                                <pre className="text-xs text-rose-600 font-mono whitespace-pre-wrap">
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

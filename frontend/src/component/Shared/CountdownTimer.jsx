import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, variant = "simple" }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft.d && !timeLeft.h && !timeLeft.m && !timeLeft.s) return null;

    if (variant === "premium") {
        return (
            <div className="flex gap-3">
                {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="flex flex-col items-center">
                        <div className="bg-base-100/10 backdrop-blur-md border border-white/20 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl tabular-nums">
                            {value < 10 ? `0${value}` : value}
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 text-base-content/50">{unit === 'd' ? 'Jours' : unit === 'h' ? 'Heures' : unit === 'm' ? 'Mins' : 'Secs'}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                    <div className="bg-neutral text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-900/20 tabular-nums">
                        {value < 10 ? `0${value}` : value}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-base-content/40">{unit === 'd' ? 'Jours' : unit === 'h' ? 'Heures' : unit === 'm' ? 'Mins' : 'Secs'}</span>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;

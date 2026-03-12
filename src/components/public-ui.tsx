"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronRight, CheckCircle2, Gift, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getCountFromServer } from "firebase/firestore";

export function SightingHero() {
    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-6 pt-12 pb-8 px-4">
            {/* Hero Image Container */}
            <motion.div
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2rem] bg-surface-dim overflow-hidden border-4 border-zinc-800 shadow-xl"
                initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <Image
                    src="/snickers.jpg"
                    alt="Snickers the Cat"
                    fill
                    sizes="(max-width: 768px) 160px, 192px"
                    className="object-cover"
                    priority
                />
            </motion.div>

            {/* Header Text */}
            <div className="space-y-2">
                <motion.h1
                    className="text-4xl md:text-5xl font-extrabold text-brand-pink tracking-tight"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Snickers Tracker
                </motion.h1>
                <motion.p
                    className="text-lg md:text-xl font-medium text-text-muted max-w-md mx-auto leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Did you spot our favorite neighborhood cat? Log her location to earn her some crunchies!
                </motion.p>
            </div>

            {/* The Rules Bento Box */}
            <motion.div
                className="grid grid-cols-2 gap-3 w-full max-w-md mt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="bg-zinc-800/50 backdrop-blur-lg p-4 rounded-[var(--radius-bento)] shadow-sm border border-brand-pink/20 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-pink/20 text-brand-pink flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-text-main">1 Log = 1 Treat</p>
                </div>
                <div className="bg-brand-yellow/10 backdrop-blur-lg p-4 rounded-[var(--radius-bento)] shadow-sm border border-brand-yellow/30 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center">
                        <Gift className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-brand-yellow">10 Logs = Wet Food!</p>
                </div>
            </motion.div>
        </div>
    );
}

export function SightingForm() {
    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim() || !db) return;

        setIsSubmitting(true);
        try {
            // Check current count to determine if it's a milestone (every 10 logs)
            const coll = collection(db, "sightings");
            const snapshot = await getCountFromServer(coll);
            const count = snapshot.data().count;
            const isMilestone = (count + 1) % 10 === 0;

            await addDoc(coll, {
                location,
                email: email.trim() || null,
                timestamp: serverTimestamp(),
                milestone: isMilestone,
                videoUrl: null
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setLocation("");
                setEmail("");
            }, 3000);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to record sighting. Make sure Firebase is configured!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto px-4 pb-12">
            <motion.div
                className="bg-zinc-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[var(--radius-bento)] shadow-2xl shadow-black/50 border border-zinc-700/50"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-[1rem] bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main">I saw Snickers!</h2>
                        <p className="text-sm font-medium text-text-muted">Where was she?</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="location" className="text-sm font-bold text-text-main px-1">
                            Cross Streets or Address <span className="text-brand-pink">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="location"
                                type="text"
                                placeholder="e.g. Main St & Oak Ave"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-900/50 border-2 border-transparent focus:border-brand-pink focus:bg-zinc-900 focus:outline-none transition-all font-medium text-text-main placeholder:text-text-muted/60"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/60" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-bold text-text-main px-1">
                            Email Address <span className="text-text-muted font-medium">(Optional)</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Get notified when she gets her treat!"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 px-4 rounded-2xl bg-zinc-900/50 border-2 border-transparent focus:border-brand-blue focus:bg-zinc-900 focus:outline-none transition-all font-medium text-text-main placeholder:text-text-muted/60"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting || isSuccess || !location.trim()}
                        className={cn(
                            "w-full h-14 rounded-2xl font-bold text-lg text-white shadow-md flex items-center justify-center gap-2 transition-all mt-6",
                            isSuccess ? "bg-green-500" : "bg-brand-pink hover:bg-brand-pink/90",
                            (!location.trim() || isSubmitting) && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Logged! Treat incoming!
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="default"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? "Sending..." : "Log Sighting"}
                                    {!isSubmitting && <Send className="w-5 h-5 ml-1" />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

export function SightingsFeed() {
    const [sightings, setSightings] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "sightings"), orderBy("timestamp", "desc"), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Format timestamp nicely or fallback to "Just now" if pending
                timestamp: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleString() : "Just now",
            }));
            setSightings(data);
        });

        // Determine the total count for the Logs counter.
        // For a true reverse chronological counter based on 50 documents, we need the total count.
        const getTotal = async () => {
            const snapshot = await getCountFromServer(collection(db!, "sightings"));
            setTotalCount(snapshot.data().count);
        }
        getTotal();

        return () => unsubscribe();
    }, []);

    if (!db) {
        return (
            <div className="w-full max-w-xl mx-auto px-4 pb-20 text-center text-text-muted">
                <p>Firebase is not connected. Provide .env.local variables to view sightings.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto px-4 pb-20">
            <h3 className="text-2xl font-extrabold text-brand-pink mb-6 flex items-center gap-2 px-2">
                <MapPin className="w-6 h-6" />
                Recent Sightings
            </h3>

            <div className="space-y-4">
                {sightings.map((sighting, index) => (
                    <SightingCard key={sighting.id} sighting={sighting} index={index} total={totalCount} />
                ))}
                {sightings.length === 0 && (
                    <p className="text-zinc-500 text-center py-8">No sightings yet. Be the first!</p>
                )}
            </div>
        </div>
    )
}

function SightingCard({ sighting, index, total }: { sighting: any, index: number, total: number }) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                    "relative p-5 rounded-[var(--radius-bento)] bg-zinc-800/50 backdrop-blur-md shadow-sm border",
                    sighting.milestone ? "border-brand-yellow/50 bg-brand-yellow/10" : "border-zinc-700/50"
                )}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-zinc-700/50 text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                                Log #{total - index}
                            </span>
                            <p className="text-sm font-medium text-text-muted">
                                {sighting.timestamp}
                            </p>
                        </div>
                        <p className="font-bold text-lg text-text-main leading-tight">
                            {sighting.location}
                        </p>
                    </div>

                    {sighting.milestone && (
                        <div className="flex-shrink-0 bg-brand-yellow/20 border border-brand-yellow/50 text-brand-yellow text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Gift className="w-3.5 h-3.5" />
                            Fancy Feast!
                        </div>
                    )}
                </div>

                {sighting.videoUrl && (
                    <button
                        onClick={() => setIsVideoOpen(true)}
                        className="mt-4 w-full h-12 bg-zinc-900 border border-zinc-700/50 hover:bg-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center transition-colors group"
                    >
                        <span className="text-brand-pink text-sm font-bold z-20 flex items-center gap-2 group-hover:scale-105 transition-transform">
                            Play Treat Video <ChevronRight className="w-5 h-5 text-text-muted" />
                        </span>
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {isVideoOpen && sighting.videoUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center text-zinc-100 font-bold">
                                Log #{total - index} Video
                            </div>
                            <div className="w-full bg-black flex items-center justify-center overflow-hidden">
                                <video
                                    src={sighting.videoUrl}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh] object-contain"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div className="p-4">
                                <button
                                    onClick={() => setIsVideoOpen(false)}
                                    className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

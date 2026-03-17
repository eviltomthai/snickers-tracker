"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, ChevronRight, Fish, Soup, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getCountFromServer } from "firebase/firestore";

// Utility for relative time formatting
const formatRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    
    // Calculate difference in days (ignoring time of day for "Today"/"Yesterday" logic)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = startOfTarget.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Format the time as HH:MM AM/PM
    const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (diffDays === 0) return `Today at ${timeString}`;
    if (diffDays === -1) return `Yesterday at ${timeString}`;
    if (diffDays === -2) return `2 days ago at ${timeString}`;
    
    // Older than 2 days
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${dateString} at ${timeString}`;
};

import img1 from "../../public/gallery/snickers_1.jpg";
import img2 from "../../public/gallery/snickers_2.jpg";
import img3 from "../../public/gallery/snickers_3.jpg";
import img4 from "../../public/gallery/snickers_4.jpg";
import img5 from "../../public/gallery/snickers_5.jpg";

const GALLERY_IMAGES = [img1, img2, img3, img4, img5];

export function SightingHero() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Track which image is currently in the center of the viewport for the pagination dots
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        if (!isNaN(index)) {
                            setActiveIndex(index);
                        }
                    }
                });
            },
            {
                root: document.getElementById('gallery-container'),
                threshold: 0.6, // Fire when 60% of the item is visible in the container
            }
        );

        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full mx-auto flex flex-col items-center justify-center text-center space-y-6 pt-8 pb-8">
            {/* Full-bleed Photo Gallery Container */}
            <div className="w-full relative">
                <div 
                    id="gallery-container"
                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbars w-full gap-4 px-[10vw] md:px-[30vw] py-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {GALLERY_IMAGES.map((imgData, idx) => (
                        <motion.div
                            key={`gallery-item-${idx}`}
                            data-index={idx}
                            className="gallery-item relative w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] shrink-0 snap-center rounded-[2rem] bg-surface-dim overflow-hidden shadow-2xl border-4 border-zinc-800"
                            initial={{ scale: 0.9, opacity: 0, x: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 20,
                                delay: idx * 0.1 
                            }}
                        >
                            <Image
                                src={imgData}
                                alt={`Snickers Gallery Photo ${idx + 1}`}
                                fill
                                sizes="(max-width: 768px) 80vw, 400px"
                                className="object-cover"
                                priority={idx === 0}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-2">
                    {GALLERY_IMAGES.map((_, idx) => (
                        <div 
                            key={`dot-${idx}`}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                activeIndex === idx ? "bg-brand-pink w-6" : "bg-zinc-600"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2 px-4 max-w-2xl">
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
                    Where in the world is Snickers today? Drop a pin to earn her some treats!
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
                        <Fish className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-text-main">Every log entry = 1 Treat</p>
                </div>
                <div className="bg-brand-yellow/10 backdrop-blur-lg p-4 rounded-[var(--radius-bento)] shadow-sm border border-brand-yellow/30 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center">
                        <Soup className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-brand-yellow">Every 10th log entry = Extra Fancy Feast with Dinner</p>
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
                            Where did you spot her? <span className="text-brand-pink">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="location"
                                type="text"
                                placeholder="e.g., Napping on the Johnson's porch or corner of Elm St."
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-900/50 border-2 border-zinc-700/50 focus:border-brand-pink focus:bg-zinc-900 focus:outline-none transition-all font-bold text-text-main placeholder:text-text-muted/80 shadow-inner shadow-black/30"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-bold text-text-main px-1">
                            Email Address <span className="text-text-muted font-medium">(TOTALLY OPTIONAL)</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Get notified when she gets her treat!"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 px-4 rounded-2xl bg-zinc-900/50 border-2 border-zinc-700/50 focus:border-brand-blue focus:bg-zinc-900 focus:outline-none transition-all font-bold text-text-main placeholder:text-text-muted/80 shadow-inner shadow-black/30"
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
                                    {isSubmitting ? "Sending..." : "Drop a Paw Print!"}
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
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        if (!db) return;
        // Initial fetch: get the first 15 records
        const q = query(collection(db, "sightings"), orderBy("timestamp", "desc"), limit(15));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? formatRelativeTime(doc.data().timestamp.toDate()) : "Just now",
            }));
            setSightings(data);
            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            if (snapshot.docs.length < 15) {
                setHasMore(false);
            }
        });

        // Determine the total count for the Logs counter.
        const getTotal = async () => {
            const snapshot = await getCountFromServer(collection(db!, "sightings"));
            setTotalCount(snapshot.data().count);
        }
        getTotal();

        return () => unsubscribe();
    }, []);

    const fetchMore = async () => {
        if (!db || !lastDoc || !hasMore || loadingMore) return;
        setLoadingMore(true);

        try {
            // we use getDocs for subsequent queries to avoid complex multi-listeners
            const { getDocs, startAfter } = await import("firebase/firestore");
            const nextQ = query(collection(db, "sightings"), orderBy("timestamp", "desc"), startAfter(lastDoc), limit(15));
            const snapshot = await getDocs(nextQ);
            
            if (snapshot.docs.length === 0) {
                setHasMore(false);
            } else {
                const newData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? formatRelativeTime(doc.data().timestamp.toDate()) : "Just now",
                }));
                // ensure we don't accidentally duplicate if the snapshot fired
                setSightings(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newData.filter(n => !existingIds.has(n.id));
                    return [...prev, ...uniqueNew];
                });
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
                if (snapshot.docs.length < 15) setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching more sightings:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Automatically trigger fetchMore when the bottom div comes into view
    useEffect(() => {
        if (inView && hasMore && !loadingMore) {
            fetchMore();
        }
    }, [inView, hasMore, loadingMore, fetchMore]);

    if (!db) {
        return (
            <div className="w-full max-w-xl mx-auto px-4 pb-20 text-center text-text-muted">
                <p>Firebase is not connected. Provide .env.local variables to view sightings.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto px-4 pb-20">
            <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-brand-pink flex items-center gap-2 px-2">
                    <MapPin className="w-6 h-6" />
                    The Snickers Trail
                </h3>
                <p className="text-sm font-medium text-text-muted px-2 mt-1">Logged by nice neighbors like you. Thank you!</p>
            </div>

            <div className="space-y-4">
                {sightings.map((sighting, index) => (
                    <SightingCard key={sighting.id} sighting={sighting} index={index} total={totalCount} />
                ))}
                {sightings.length === 0 && (
                    <p className="text-text-muted font-medium text-center py-8">Snickers is in stealth mode today. Be the first to spot her!</p>
                )}
                
                {hasMore && sightings.length > 0 && (
                    <div ref={loadMoreRef} className="flex justify-center pt-4 pb-8">
                        <button 
                            onClick={fetchMore}
                            disabled={loadingMore}
                            className="bg-zinc-800/50 hover:bg-zinc-800 text-text-muted text-sm font-bold py-2.5 px-6 rounded-full border border-zinc-700/50 transition-colors"
                        >
                            {loadingMore ? "Loading more..." : "Load more sightings"}
                        </button>
                    </div>
                )}
                
                {!hasMore && sightings.length > 0 && (
                    <p className="text-zinc-600 text-xs font-bold text-center pt-6 pb-2">End of the line. No more treats left to give! 🐈</p>
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
                    "relative p-3 rounded-[var(--radius-bento)] bg-zinc-800/50 backdrop-blur-md shadow-sm border",
                    sighting.milestone ? "border-brand-yellow/50 bg-brand-yellow/10" : "border-zinc-700/50"
                )}
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
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
                        <div className="flex-shrink-0 bg-brand-yellow/20 border border-brand-yellow/50 text-brand-yellow text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm mt-1">
                            <Soup className="w-3 h-3" />
                            Fancy Feast!
                        </div>
                    )}
                </div>

                {sighting.videoUrl && (
                    <button
                        onClick={() => setIsVideoOpen(true)}
                        className="mt-3 w-full h-10 bg-zinc-900 border border-zinc-700/50 hover:bg-zinc-800 rounded-xl overflow-hidden relative flex items-center justify-center transition-colors group"
                    >
                        <span className="text-brand-pink text-xs font-bold z-20 flex items-center gap-1 group-hover:scale-105 transition-transform">
                            Play Treat Video <ChevronRight className="w-4 h-4 text-text-muted" />
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center text-white text-lg font-extrabold tracking-wide">
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
                                    className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-lg transition-colors border border-zinc-700 shadow-sm"
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

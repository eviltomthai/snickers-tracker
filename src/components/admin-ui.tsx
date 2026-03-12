"use client";

import { useState, useEffect } from "react";
import { Lock, LogOut, Upload, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth, googleProvider, db, storage } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sightings, setSightings] = useState<any[]>([]);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser && firebaseUser.email !== "theman@gmail.com") {
                signOut(auth!);
                setError("Unauthorized access. Admin only.");
            } else {
                setUser(firebaseUser);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!db || !user) return;
        // Listen to sightings when logged in
        const q = query(collection(db, "sightings"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleString() : "Just now",
            }));
            setSightings(data);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogin = async () => {
        if (!auth) {
            alert("Firebase Auth is not initialized. Please check .env.local");
            return;
        }
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user.email !== "theman@gmail.com") {
                await signOut(auth);
                setError("Unauthorized access. Admin only.");
            }
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message);
        }
    };

    const handleUpload = async (sightingId: string, file: File | undefined) => {
        if (!file || !storage || !db) return;

        setIsUploading(sightingId);
        try {
            // Upload to Firebase Storage
            const videoRef = ref(storage, `treats/${sightingId}_${file.name}`);
            await uploadBytes(videoRef, file);
            const downloadUrl = await getDownloadURL(videoRef);

            // Update Firestore Document
            const sightingRef = doc(db, "sightings", sightingId);
            await updateDoc(sightingRef, { videoUrl: downloadUrl });

            // Trigger Email Notification
            const sighting = sightings.find(s => s.id === sightingId);
            if (sighting?.email) {
                await fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: sighting.email,
                        location: sighting.location,
                        videoUrl: downloadUrl
                    })
                });
            }

            alert("Video successfully attached!");
        } catch (err: any) {
            console.error("Upload failed", err);
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(null);
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-lg max-w-sm w-full space-y-6 text-center">
                    <div className="w-16 h-16 bg-brand-blue/20 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-50">Admin Access</h1>
                        <p className="text-sm text-zinc-500 mt-2">Restricted to authorized treat distributors only.</p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full h-12 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="font-bold text-xl flex items-center gap-2">
                        <span className="bg-brand-pink text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner shadow-black/20">S</span>
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => auth && signOut(auth)}
                        className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">
                <h2 className="text-2xl font-bold text-white">Recent Sightings</h2>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950/50 text-zinc-400 font-medium">
                            <tr>
                                <th className="p-4">Location</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">Notification Email</th>
                                <th className="p-4 border-l border-zinc-800">Treat Video</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {sightings.map((sighting) => (
                                <tr key={sighting.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4 font-medium text-white">{sighting.location}</td>
                                    <td className="p-4">{sighting.timestamp}</td>
                                    <td className="p-4">
                                        {sighting.email ? (
                                            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded text-xs font-semibold border border-brand-blue/20">
                                                {sighting.email}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500 italic">None</span>
                                        )}
                                    </td>
                                    <td className="p-4 border-l border-zinc-800">
                                        {sighting.videoUrl ? (
                                            <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded inline-flex border border-emerald-400/20 text-xs text-center">
                                                <Video className="w-4 h-4" /> Attached
                                            </span>
                                        ) : (
                                            <label
                                                className={cn(
                                                    "inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-medium transition-colors border border-zinc-700 cursor-pointer",
                                                    isUploading === sighting.id && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <Upload className="w-4 h-4" />
                                                {isUploading === sighting.id ? "Uploading..." : "Upload Treat Video"}
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    disabled={isUploading === sighting.id}
                                                    onChange={(e) => handleUpload(sighting.id, e.target.files?.[0])}
                                                />
                                            </label>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}

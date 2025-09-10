/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REMIX_IDEAS = [
    "to expand a single photo into a full album.",
    "to create a modeling portfolio.",
    "to get more pose variations from one picture.",
    "to generate new social media profile pictures.",
    "to create a character sheet for a story.",
    "to explore different angles of a great shot.",
];

const Footer = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % REMIX_IDEAS.length);
        }, 3500); // Change text every 3.5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3 z-50 text-muted-foreground text-xs sm:text-sm border-t border-border">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                {/* Left Side */}
                <div className="hidden md:flex items-center gap-4 text-muted-foreground whitespace-nowrap">
                    <p>Powered by Gemini 2.5 Flash Image Preview</p>
                    <span className="text-border" aria-hidden="true">|</span>
                    <p>
                        Created by{' '}
                        <a
                            href="https://x.com/ammaar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200"
                        >
                            @ammaar
                        </a>
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex-grow flex justify-end items-center gap-4 sm:gap-6">
                    <div className="hidden lg:flex items-center gap-2 text-muted-foreground text-right min-w-0">
                        <span className="flex-shrink-0">Remix this app...</span>
                        <div className="relative w-64 h-5">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0 font-medium text-foreground whitespace-nowrap text-left"
                                >
                                    {REMIX_IDEAS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <a
                            href="https://aistudio.google.com/apps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm sm:text-base text-center text-white bg-gradient-to-r from-accent-start to-accent-end py-2 px-4 rounded-full transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:shadow-accent-end/30 whitespace-nowrap"
                        >
                            Apps on AI Studio
                        </a>
                        <a
                            href="https://gemini.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm sm:text-base text-center text-foreground bg-secondary backdrop-blur-sm border border-border py-2 px-4 rounded-full transform transition-transform duration-200 hover:scale-105 hover:bg-accent hover:border-accent-start/50 whitespace-nowrap"
                        >
                            Chat with Gemini
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
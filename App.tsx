/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import Photoshoot from './components/Photoshoot';
import OutfitExtractor from './components/OutfitExtractor';
import PoseAnimator from './components/PoseAnimator';
import Inpainter from './components/Inpainter';
import { motion } from 'framer-motion';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import ObjectRemover from './components/ObjectRemover';
import BackgroundRemover from './components/BackgroundRemover';
import PortraitGenerator from './components/PortraitGenerator';
import ProfilePictureGenerator from './components/ProfilePictureGenerator';
import PhotoBooth from './components/PhotoBooth';
import CloneEffect from './components/CloneEffect';
import ConceptStudio from './components/ConceptStudio';
import StudioPhotoshoot from './components/StudioPhotoshoot';
import ThemeSwitcher from './components/ThemeSwitcher';
import IllustrationToFigure from './components/IllustrationToFigure';
import FaceSwap from './components/FaceSwap';
import TimeMachine from './components/TimeMachine';
import HairStyler from './components/HairStyler';

const tools = [
    {
        id: 'photoshoot',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M3 9C3 7.89543 3.89543 7 5 7H6.93009C7.38217 7 7.80365 6.78322 8.09038 6.41039L8.90962 5.21039C9.19635 4.78322 9.61783 4.5 10.0699 4.5H13.9301C14.3822 4.5 14.8036 4.78322 15.0904 5.21039L15.9096 6.41039C16.1964 6.78322 16.6178 7 17.0699 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 13C15 14.6569 13.6569 16 12 16C10.3431 16 9 14.6569 9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
        titleKey: 'app.photoshootTitle',
        descriptionKey: 'app.photoshootDesc',
    },
    {
        id: 'timeMachine',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.timeMachineTitle',
        descriptionKey: 'app.timeMachineDesc',
    },
    {
        id: 'photoBooth',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
        titleKey: 'app.photoBoothTitle',
        descriptionKey: 'app.photoBoothDesc',
    },
    {
        id: 'hairStyler',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M18 10C19.6569 10 21 8.65685 21 7C21 5.34315 19.6569 4 18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 10C4.34315 10 3 8.65685 3 7C3 5.34315 4.34315 4 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 13V15.5C5 18.5 8 21 12 21C16 21 19 18.5 19 15.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        titleKey: 'app.hairStylerTitle',
        descriptionKey: 'app.hairStylerDesc',
    },
    {
        id: 'cloneEffect',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z" fill="currentColor"/>
                <path d="M12 7C10.3431 7 9 8.34315 9 10V15H15V10C15 8.34315 13.6569 7 12 7Z" fill="currentColor"/>
                <path d="M6 12C7.10457 12 8 11.1046 8 10C8 8.89543 7.10457 8 6 8C4.89543 8 4 8.89543 4 10C4 11.1046 4.89543 12 6 12Z" fill="currentColor"/>
                <path d="M6 13C4.34315 13 3 14.3431 3 16V21H9V16C9 14.3431 7.65685 13 6 13Z" fill="currentColor"/>
                <path d="M18 12C19.1046 12 20 11.1046 20 10C20 8.89543 19.1046 8 18 8C16.8954 8 16 8.89543 16 10C16 11.1046 16.8954 12 18 12Z" fill="currentColor"/>
                <path d="M18 13C16.3431 13 15 14.3431 15 16V21H21V16C21 14.3431 19.6569 13 18 13Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.cloneEffectTitle',
        descriptionKey: 'app.cloneEffectDesc',
    },
    {
        id: 'outfitExtractor',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 2C11.45 2 11 2.45 11 3V4.58C8.1 5.42 6 7.95 6 11V12.09C4.38 12.55 3.03 13.93 2.56 15.59C2 17.57 3.14 19.44 5 19.93V20C5 20.55 5.45 21 6 21H8C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21H18C18.55 21 19 20.55 19 20V19.93C20.86 19.44 22 17.57 21.44 15.59C20.97 13.93 19.62 12.55 18 12.09V11C18 7.95 15.9 5.42 13 4.58V3C13 2.45 12.55 2 12 2Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.outfitExtractorTitle',
        descriptionKey: 'app.outfitExtractorDesc',
    },
    // {
    //     id: 'faceSwap',
    //     icon: (
    //          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
    //             <path d="M15 9.85714C15 12.1429 12.7614 14 10 14C7.23858 14 5 12.1429 5 9.85714C5 7.57143 7.23858 5.71429 10 5.71429C12.7614 5.71429 15 7.57143 15 9.85714Z" stroke="currentColor" strokeWidth="2"/>
    //             <path d="M19 14.1429C19 16.4286 16.7614 18.2857 14 18.2857C11.2386 18.2857 9 16.4286 9 14.1429C9 11.8571 11.2386 10 14 10C16.7614 10 19 11.8571 19 14.1429Z" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
    //             <path d="M8 10.5C8 10.5 8.5 11.5 10 11.5C11.5 11.5 12 10.5 12 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    //             <path d="M12 15C12 15 12.5 16 14 16C15.5 16 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
    //         </svg>
    //     ),
    //     titleKey: 'app.faceSwapTitle',
    //     descriptionKey: 'app.faceSwapDesc',
    // },
    {
        id: 'illustrationToFigure',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        titleKey: 'app.illustrationToFigureTitle',
        descriptionKey: 'app.illustrationToFigureDesc',
    },
    {
        id: 'conceptStudio',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.kidsStudioTitle',
        descriptionKey: 'app.kidsStudioDesc',
    },
    {
        id: 'studioPhotoshoot',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M9 3H7C5.89543 3 5 3.89543 5 5V10C5 11.1046 5.89543 12 7 12H17C18.1046 12 19 11.1046 19 10V5C19 3.89543 18.1046 3 17 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        titleKey: 'app.studioPhotoshootTitle',
        descriptionKey: 'app.studioPhotoshootDesc',
    },
    {
        id: 'portraitGenerator',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM9.5 6C10.88 6 12 7.12 12 8.5C12 9.88 10.88 11 9.5 11C8.12 11 7 9.88 7 8.5C7 7.12 8.12 6 9.5 6ZM17 18H7V17C7 15.67 9.67 15 12 15C14.33 15 17 15.67 17 17V18Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.portraitGeneratorTitle',
        descriptionKey: 'app.portraitGeneratorDesc',
    },
    {
        id: 'profilePictureGenerator',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.profilePictureGeneratorTitle',
        descriptionKey: 'app.profilePictureGeneratorDesc',
    },
    {
        id: 'poseAnimator',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6L12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 13L7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 13L17 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 11H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 11L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 11L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        titleKey: 'app.poseAnimatorTitle',
        descriptionKey: 'app.poseAnimatorDesc',
    },
    {
        id: 'inpainter',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.inpainterTitle',
        descriptionKey: 'app.inpainterDesc',
    },
    {
        id: 'objectRemover',
        icon: (
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <path d="M16.24 3.56c-.39-.39-1.02-.39-1.41 0L8 10.41l-1.83 1.83c-.39.39-.39 1.02 0 1.41l2.83 2.83c.39.39 1.02.39 1.41 0L17 9.83l1.83-1.83c.39-.39.39-1.02 0-1.41l-2.59-2.59zM19.31 9.24l-3.54 3.54-4.24-4.24 3.54-3.54 4.24 4.24zM4 21h12v-2H4v2z" fill="currentColor"/>
            </svg>
        ),
        titleKey: 'app.objectRemoverTitle',
        descriptionKey: 'app.objectRemoverDesc',
    },
    {
        id: 'backgroundRemover',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground group-hover:text-accent-start transition-colors">
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M17 19C17 16.2386 14.7614 14 12 14C9.23858 14 7 16.2386 7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
            </svg>
        ),
        titleKey: 'app.backgroundRemoverTitle',
        descriptionKey: 'app.backgroundRemoverDesc',
    }
];

type ToolId = 'selection' | 'photoshoot' | 'outfitExtractor' | 'poseAnimator' | 'inpainter' | 'objectRemover' | 'backgroundRemover' | 'portraitGenerator' | 'profilePictureGenerator' | 'photoBooth' | 'cloneEffect' | 'conceptStudio' | 'studioPhotoshoot' | 'illustrationToFigure' | 'faceSwap' | 'timeMachine' | 'hairStyler';

function App() {
    const [activeTool, setActiveTool] = useState<ToolId>('selection');
    const { t } = useLanguage();

    const handleSelectTool = (toolId: ToolId) => {
        setActiveTool(toolId);
    };

    const handleBack = () => {
        setActiveTool('selection');
    };

    if (activeTool === 'photoshoot') {
        return <Photoshoot onBack={handleBack} />;
    }
    
    if (activeTool === 'timeMachine') {
        return <TimeMachine onBack={handleBack} />;
    }

    if (activeTool === 'photoBooth') {
        return <PhotoBooth onBack={handleBack} />;
    }

    if (activeTool === 'hairStyler') {
        return <HairStyler onBack={handleBack} />;
    }

    if (activeTool === 'cloneEffect') {
        return <CloneEffect onBack={handleBack} />;
    }

    if (activeTool === 'outfitExtractor') {
        return <OutfitExtractor onBack={handleBack} />;
    }

    // if (activeTool === 'faceSwap') {
    //     return <FaceSwap onBack={handleBack} />;
    // }

    if (activeTool === 'illustrationToFigure') {
        return <IllustrationToFigure onBack={handleBack} />;
    }

    if (activeTool === 'conceptStudio') {
        return <ConceptStudio onBack={handleBack} />;
    }

    if (activeTool === 'studioPhotoshoot') {
        return <StudioPhotoshoot onBack={handleBack} />;
    }

    if (activeTool === 'portraitGenerator') {
        return <PortraitGenerator onBack={handleBack} />;
    }
    
    if (activeTool === 'profilePictureGenerator') {
        return <ProfilePictureGenerator onBack={handleBack} />;
    }
    
    if (activeTool === 'poseAnimator') {
        return <PoseAnimator onBack={handleBack} />;
    }

    if (activeTool === 'inpainter') {
        return <Inpainter onBack={handleBack} />;
    }

    if (activeTool === 'objectRemover') {
        return <ObjectRemover onBack={handleBack} />;
    }

    if (activeTool === 'backgroundRemover') {
        return <BackgroundRemover onBack={handleBack} />;
    }

    return (
        <main className="bg-background text-foreground min-h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-4xl max-h-4xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-accent-start/20 to-accent-end/20 opacity-50 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center w-full max-w-5xl"
            >
                <h1 className="font-title text-6xl md:text-7xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-br from-primary to-muted-foreground tracking-tight pb-2">{t('app.title')}</h1>
                <h2 className="text-2xl md:text-3xl text-muted-foreground mt-4 mb-12 md:mb-16 text-center">{t('app.subtitle')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            className="bg-secondary/30 backdrop-blur-md border border-border rounded-2xl p-8 flex flex-col items-start hover:bg-secondary/60 hover:border-accent-start/50 transition-all duration-300 transform hover:-translate-y-1 group hover:shadow-2xl hover:shadow-accent-end/10"
                        >
                            <div className="p-3 bg-secondary/50 rounded-lg mb-4 border border-border">{tool.icon}</div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">{t(tool.titleKey)}</h3>
                            <p className="text-muted-foreground flex-grow mb-6">{t(tool.descriptionKey)}</p>
                            <button onClick={() => handleSelectTool(tool.id as ToolId)} className="font-semibold text-muted-foreground mt-auto group-hover:text-foreground transition-colors duration-300 text-lg">
                                {t('app.start')} <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </main>
    );
}

export default App;
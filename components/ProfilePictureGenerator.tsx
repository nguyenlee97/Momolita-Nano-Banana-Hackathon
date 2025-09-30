/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateStyledImage } from '../services/geminiService';
import { cn, resizeImageToAspectRatio } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import PolaroidCard from './PolaroidCard';

const getPrompts = (gender: 'male' | 'female') => {
    const basePrompts = [
        {
            id: 'prompt1',
            prompt: 'Vertical portrait, 1080x1920. Keep the same facial features. Subject wearing a black blazer. Dramatic cinematic lighting - a narrow beam of warm sunlight passes through a window slit or blinds, casting a diagonal band of light across the subject’s face while the rest remains in deep shadow. Approximately one-third of the face and upper body are illuminated, the rest fading into darkness, creating a mysterious and elegant chiaroscuro effect. Background: deep, saturated crimson red, softly textured, with subtle falloff of light. Camera angle: slightly low and centered, emphasizing jawline and neck for quiet dominance and sculptural elegance. The mood is moody and sophisticated, evoking a timeless cinematic portrait - interplay of sunlight and shadow forming a natural frame on the face. Ultra-realistic skin texture, soft transitions between light and shadow, no harsh reflections, no text.',
        },
        {
            id: 'prompt2',
            prompt: 'Vertical portrait, 1080x1920. Keep the same facial features. Subject wearing a black blazer. Stark cinematic lighting with strong contrast. Shot from a slightly low, upward angle to emphasize jawline and neck, evoking quiet dominance and sculptural elegance. Deep, saturated crimson red background for bold contrast against luminous skin and dark wardrobe.',
        },
        {
            id: 'prompt3',
            prompt: 'Stylish fashion editorial photo of this model wearing an oversized white sweatshirt and white sweatpants, paired with white sneakers. A soft red studio backdrop with soft cinematic lighting, highlighting textures, futuristic editorial style, model sitting elegantly, head slightly tilted, relaxed posture.',
        },
    ];

    if (gender === 'female') {
        return [
            ...basePrompts,
            {
                id: 'prompt4',
                prompt: "A hyper-realistic black-white studio portrait of the same woman in the uploaded personal photo. Keep her actual face and features exactly the same without any changes. She is sitting on a simple round stool, leaning slightly forward with her elbow resting on her knee, her head tilted and supported gently by her hand. She has a calm, soft expression. She is wearing a fitted sleeveless white ribbed tank top and high-waist denim jeans with stitched lettering detail.",
            },
            {
                id: 'prompt5',
                prompt: 'Transform the reference image into a vertical portrait shot in 1080×1920 format, maintaining the exact same facial features (do not alter the face). Convert the photo to black and white with dramatic studio lighting and deep shadows to create a bold, fashion editorial look. The subject is wearing a sleek black suit, with natural-style makeup tones that enhance facial details subtly. Hair is styled in a loose, low updo for a chic and modern feel. Shot with an 85mm portrait lens, shallow depth of field, ultra sharp facial details, smooth skin texture, soft gradient background blur.\n\nLighting should mimic high-end studio photography with contrast and mood, evoking a magazine editorial aesthetic.\n\nClean, stylish, elegant, and powerful.',
            }
        ];
    } else { // 'male'
        return [
            ...basePrompts,
            {
                id: 'prompt4',
                prompt: "A hyper-realistic black-white studio portrait of the same man in the uploaded personal photo. Keep his actual face and features exactly the same without any changes. He is sitting on a simple round stool, leaning slightly forward with his elbow resting on his knee, his head tilted and supported gently by his hand. He has a calm, thoughtful expression. He is wearing a classic, well-fitted plain white crew-neck t-shirt and dark denim jeans.",
            },
            {
                id: 'prompt5',
                prompt: 'Transform the reference image into a vertical portrait shot in 1080×1920 format, maintaining the exact same facial features (do not alter the face). Convert the photo to black and white with dramatic studio lighting and deep shadows to create a bold, fashion editorial look. The subject is wearing a sleek black suit, with no makeup and natural skin texture. Hair is styled neatly for a sharp and modern feel. Shot with an 85mm portrait lens, shallow depth of field, ultra sharp facial details, smooth skin texture, soft gradient background blur.\n\nLighting should mimic high-end studio photography with contrast and mood, evoking a magazine editorial aesthetic.\n\nClean, stylish, elegant, and powerful.',
            }
        ];
    }
};

type GeneratedImage = {
    id: string;
    status: 'pending' | 'done' | 'error';
    url?: string;
    error?: string;
};

const Uploader = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
    const { t } = useLanguage();
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDragEvents = (e: DragEvent<HTMLElement>, enter: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(enter);
    };

    return (
        <label
            htmlFor="profile-pic-upload"
            className={cn(
                "cursor-pointer aspect-[4/5] w-full max-w-md flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors",
                isDragOver ? "border-neutral-500 bg-black/40" : "border-neutral-700 bg-black/20 hover:border-neutral-600"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-400 font-semibold">{t('profilePictureGenerator.dropImage')}</span>
            <span className="text-slate-500 text-sm mt-1">{t('profilePictureGenerator.clickToUpload')}</span>
            <input id="profile-pic-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
    );
};


export default function ProfilePictureGenerator({ onBack }: { onBack: () => void }) {
    const { t } = useLanguage();
    const [view, setView] = useState<'config' | 'result'>('config');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const dragAreaRef = useRef<HTMLDivElement>(null);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            setUploadedImage(imageDataUrl);
            setGeneratedImages({});
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = (id: string, url?: string) => {
        const imageUrl = url || generatedImages[id]?.url;
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `momolita-ai-profile-${id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const processSinglePrompt = async (promptItem: { id: string, prompt: string }, image: string) => {
        try {
            const resultUrl = await generateStyledImage(promptItem.prompt, [image]);
            setGeneratedImages(prev => ({
                ...prev,
                [promptItem.id]: { status: 'done', url: resultUrl, id: promptItem.id },
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => ({
                ...prev,
                [promptItem.id]: { status: 'error', error: errorMessage, id: promptItem.id },
            }));
            console.error(`Failed to generate image for ${promptItem.id}:`, err);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsLoading(true);
        setView('result');

        const resizedImage = await resizeImageToAspectRatio(uploadedImage, '9:16');
        const promptsToUse = getPrompts(gender);

        const initialImages: Record<string, GeneratedImage> = {};
        promptsToUse.forEach(p => {
            initialImages[p.id] = { status: 'pending', id: p.id };
        });
        setGeneratedImages(initialImages);

        const concurrencyLimit = 3;
        const queue = [...promptsToUse];

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (queue.length > 0) {
                const promptItem = queue.shift();
                if (promptItem) {
                    await processSinglePrompt(promptItem, resizedImage);
                }
            }
        });

        await Promise.all(workers);
        setIsLoading(false);
    };

    const handleRegenerate = async (promptId: string) => {
        if (!uploadedImage) return;
        
        const promptsToUse = getPrompts(gender);
        const promptItem = promptsToUse.find(p => p.id === promptId);
        if (!promptItem) return;

        setGeneratedImages(prev => ({
            ...prev,
            [promptId]: { status: 'pending', id: promptId },
        }));

        const resizedImage = await resizeImageToAspectRatio(uploadedImage, '9:16');
        await processSinglePrompt(promptItem, resizedImage);
    };
    
    const handleStartOver = () => {
        setUploadedImage(null);
        setGeneratedImages({});
        setView('config');
    }

    const renderConfigView = () => (
        <div className="w-full max-w-md flex flex-col items-center gap-8">
             <div className="bg-black/20 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-lg flex flex-col items-center">
                <h3 className="font-bold text-2xl text-neutral-200 mb-1">{t('profilePictureGenerator.uploadTitle')}</h3>
                <p className="text-neutral-300 text-sm mb-4">{t('profilePictureGenerator.uploadDesc')}</p>
                {uploadedImage ? (
                    <div className="relative group aspect-[4/5] w-full max-w-sm rounded-md overflow-hidden">
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                            onClick={() => setUploadedImage(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <Uploader onImageUpload={handleImageUpload} />
                )}
            </div>
            <div className="w-full bg-black/20 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-neutral-300 mb-2">{t('profilePictureGenerator.gender')}</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setGender('female')}
                        className={cn(
                            'px-3 py-2 text-sm rounded-md transition-colors w-full',
                            gender === 'female' ? 'bg-neutral-200 text-black font-bold' : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
                        )}
                    >
                        {t('profilePictureGenerator.female')}
                    </button>
                    <button
                        onClick={() => setGender('male')}
                        className={cn(
                            'px-3 py-2 text-sm rounded-md transition-colors w-full',
                            gender === 'male' ? 'bg-neutral-200 text-black font-bold' : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
                        )}
                    >
                        {t('profilePictureGenerator.male')}
                    </button>
                </div>
            </div>
             <button
                onClick={handleGenerate}
                disabled={!uploadedImage || isLoading}
                className="w-full max-w-sm flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-lg bg-neutral-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
                {isLoading ? t('profilePictureGenerator.generatingButton') : t('profilePictureGenerator.generateButton')}
            </button>
        </div>
    );

    const renderResultView = () => {
        const promptsToUse = getPrompts(gender);
        return (
            <div className="w-full flex flex-col items-center gap-8">
                <h3 className="font-bold text-3xl md:text-4xl text-neutral-200 mb-4 text-center">{t('profilePictureGenerator.resultTitle')}</h3>
                <div ref={dragAreaRef} className="w-full max-w-7xl flex-1 mt-4 p-4 relative">
                    <div className="flex flex-wrap justify-center items-start gap-8">
                        {promptsToUse.map((prompt, index) => (
                            <motion.div
                                key={prompt.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.1 }}
                            >
                                <PolaroidCard
                                    id={prompt.id}
                                    dragConstraintsRef={dragAreaRef}
                                    caption={t('profilePictureGenerator.style', (index + 1).toString())}
                                    status={generatedImages[prompt.id]?.status || 'pending'}
                                    imageUrl={generatedImages[prompt.id]?.url}
                                    error={generatedImages[prompt.id]?.error}
                                    onRegenerate={handleRegenerate}
                                    onDownload={handleDownload}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handleStartOver} 
                    className="font-bold text-center text-neutral-300 bg-black/20 backdrop-blur-sm border-2 border-neutral-700 py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:text-white"
                >
                    {t('common.startOver')}
                </button>
            </div>
        );
    }

    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center p-4 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-4xl max-h-4xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-neutral-600 to-black opacity-20 rounded-full blur-3xl" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-7xl mx-auto flex flex-col items-center z-10"
            >
                <header className="w-full flex justify-between items-center py-4 mb-6">
                    <button onClick={view === 'config' ? onBack : handleStartOver} className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {view === 'config' ? t('common.backToTools') : t('common.startOver')}
                    </button>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-neutral-400 hidden sm:block">{t('common.poweredByGemini')}</p>
                        <LanguageSwitcher />
                    </div>
                </header>

                <div className="text-center mb-10">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-2 flex items-center justify-center gap-4 tracking-tight">
                        <span className="text-neutral-300">
                           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                           </svg>
                        </span>
                        {t('app.profilePictureGeneratorTitle')}
                    </h2>
                    <p className="text-xl md:text-2xl text-neutral-400 mt-2">{t('profilePictureGenerator.subtitle')}</p>
                </div>
                
                {view === 'config' ? renderConfigView() : renderResultView()}

            </motion.div>
        </main>
    );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateStyledImage } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

// Mở rộng 'Decade' thành 'Era' để bao gồm nhiều thời kỳ hơn
type Era = 'ancient-rome' | 'medieval-europe' | 'feudal-japan' | 'victorian-era' | 'roaring-20s' | '1970s' | '1980s' | 'cyberpunk-future' | 'solarpunk-future';
type Gender = 'male' | 'female';
type View = 'config' | 'result';

// Danh sách các thời đại mới
const ERA_OPTIONS: { id: Era, labelKey: string }[] = [
    { id: 'ancient-rome', labelKey: 'timeMachine.presets.ancient-rome' },
    { id: 'medieval-europe', labelKey: 'timeMachine.presets.medieval-europe' },
    { id: 'feudal-japan', labelKey: 'timeMachine.presets.feudal-japan' },
    { id: 'victorian-era', labelKey: 'timeMachine.presets.victorian-era' },
    { id: 'roaring-20s', labelKey: 'timeMachine.presets.roaring-20s' },
    { id: '1970s', labelKey: 'timeMachine.presets.1970s' },
    { id: '1980s', labelKey: 'timeMachine.presets.1980s' },
    { id: 'cyberpunk-future', labelKey: 'timeMachine.presets.cyberpunk-future' },
    { id: 'solarpunk-future', labelKey: 'timeMachine.presets.solarpunk-future' },
];

// Cấu trúc PRESETS được mở rộng rất nhiều, thêm mục 'clothing'
const PRESETS: Record<Era, Record<Gender, { 
    hair: {id: string, labelKey: string}[], 
    clothing: {id: string, labelKey: string}[],
    facial?: {id: string, labelKey: string}[] 
}>> = {
    'ancient-rome': {
        female: {
            hair: [ { id: 'roman-intricate-updo', labelKey: 'timeMachine.presets.roman-intricate-updo' }, { id: 'roman-vitta-headband', labelKey: 'timeMachine.presets.roman-vitta-headband' } ],
            clothing: [ { id: 'roman-stola-palla', labelKey: 'timeMachine.presets.roman-stola-palla' }, { id: 'roman-tunica', labelKey: 'timeMachine.presets.roman-tunica' } ],
        },
        male: {
            hair: [ { id: 'roman-caesar-hair', labelKey: 'timeMachine.presets.roman-caesar-hair' }, { id: 'roman-short-curly', labelKey: 'timeMachine.presets.roman-short-curly' } ],
            clothing: [ { id: 'roman-toga-tunic', labelKey: 'timeMachine.presets.roman-toga-tunic' }, { id: 'roman-armor', labelKey: 'timeMachine.presets.roman-armor' } ],
            facial: [ { id: 'roman-clean-shaven', labelKey: 'timeMachine.presets.roman-clean-shaven' } ],
        },
    },
    'medieval-europe': {
        female: {
            hair: [ { id: 'medieval-long-braids', labelKey: 'timeMachine.presets.medieval-long-braids' }, { id: 'medieval-wimple-headdress', labelKey: 'timeMachine.presets.medieval-wimple-headdress' } ],
            clothing: [ { id: 'medieval-kirtle-gown', labelKey: 'timeMachine.presets.medieval-kirtle-gown' }, { id: 'medieval-noble-dress', labelKey: 'timeMachine.presets.medieval-noble-dress' } ],
        },
        male: {
            hair: [ { id: 'medieval-tonsure-monk', labelKey: 'timeMachine.presets.medieval-tonsure-monk' }, { id: 'medieval-shoulder-length', labelKey: 'timeMachine.presets.medieval-shoulder-length' } ],
            clothing: [ { id: 'medieval-chainmail-tunic', labelKey: 'timeMachine.presets.medieval-chainmail-tunic' }, { id: 'medieval-peasant-clothes', labelKey: 'timeMachine.presets.medieval-peasant-clothes' } ],
            facial: [ { id: 'medieval-full-beard', labelKey: 'timeMachine.presets.medieval-full-beard' }, { id: 'medieval-stubble', labelKey: 'timeMachine.presets.medieval-stubble' } ],
        },
    },
    'feudal-japan': {
        female: {
            hair: [ { id: 'japan-shimada-mage', labelKey: 'timeMachine.presets.japan-shimada-mage' }, { id: 'japan-kanzashi-pins', labelKey: 'timeMachine.presets.japan-kanzashi-pins' } ],
            clothing: [ { id: 'japan-ornate-kimono', labelKey: 'timeMachine.presets.japan-ornate-kimono' }, { id: 'japan-miko-outfit', labelKey: 'timeMachine.presets.japan-miko-outfit' } ],
        },
        male: {
            hair: [ { id: 'japan-chonmage-topknot', labelKey: 'timeMachine.presets.japan-chonmage-topknot' } ],
            clothing: [ { id: 'japan-samurai-armor', labelKey: 'timeMachine.presets.japan-samurai-armor' }, { id: 'japan-simple-kimono', labelKey: 'timeMachine.presets.japan-simple-kimono' } ],
            facial: [ { id: 'japan-samurai-mustache', labelKey: 'timeMachine.presets.japan-samurai-mustache' }, { id: 'japan-clean-shaven', labelKey: 'timeMachine.presets.japan-clean-shaven' } ],
        },
    },
    'victorian-era': {
        female: {
            hair: [ { id: 'victorian-updo', labelKey: 'timeMachine.presets.victorian-updo' }, { id: 'victorian-ringlet-curls', labelKey: 'timeMachine.presets.victorian-ringlet-curls' } ],
            clothing: [ { id: 'victorian-high-collar-dress', labelKey: 'timeMachine.presets.victorian-high-collar-dress' }, { id: 'victorian-bustle-gown', labelKey: 'timeMachine.presets.victorian-bustle-gown' } ],
        },
        male: {
            hair: [ { id: 'victorian-slicked-back', labelKey: 'timeMachine.presets.victorian-slicked-back' } ],
            clothing: [ { id: 'victorian-suit-waistcoat', labelKey: 'timeMachine.presets.victorian-suit-waistcoat' }, { id: 'victorian-top-hat-coat', labelKey: 'timeMachine.presets.victorian-top-hat-coat' } ],
            facial: [ { id: 'victorian-handlebar-mustache', labelKey: 'timeMachine.presets.victorian-handlebar-mustache' }, { id: 'victorian-mutton-chops', labelKey: 'timeMachine.presets.victorian-mutton-chops' } ],
        },
    },
    'roaring-20s': {
        female: {
            hair: [ { id: '20s-flapper-bob', labelKey: 'timeMachine.presets.20s-flapper-bob' }, { id: '20s-finger-waves', labelKey: 'timeMachine.presets.20s-finger-waves' } ],
            clothing: [ { id: '20s-flapper-dress', labelKey: 'timeMachine.presets.20s-flapper-dress' }, { id: '20s-cloche-hat', labelKey: 'timeMachine.presets.20s-cloche-hat' } ],
        },
        male: {
            hair: [ { id: '20s-slicked-side-part', labelKey: 'timeMachine.presets.20s-slicked-side-part' } ],
            clothing: [ { id: '20s-pinstripe-suit', labelKey: 'timeMachine.presets.20s-pinstripe-suit' }, { id: '20s-fedora-hat', labelKey: 'timeMachine.presets.20s-fedora-hat' } ],
            facial: [ { id: '20s-pencil-mustache', labelKey: 'timeMachine.presets.20s-pencil-mustache' }, { id: '20s-clean-shaven', labelKey: 'timeMachine.presets.20s-clean-shaven' } ],
        },
    },
    '1970s': {
        female: {
            hair: [ { id: '70s-farrah-fawcett', labelKey: 'timeMachine.presets.70s-farrah-fawcett' }, { id: '70s-female-shag', labelKey: 'timeMachine.presets.70s-female-shag' }, { id: '70s-female-afro', labelKey: 'timeMachine.presets.70s-female-afro' } ],
            clothing: [ { id: '70s-bell-bottoms', labelKey: 'timeMachine.presets.70s-bell-bottoms' }, { id: '70s-bohemian-dress', labelKey: 'timeMachine.presets.70s-bohemian-dress' } ],
        },
        male: {
            hair: [ { id: '70s-long-straight', labelKey: 'timeMachine.presets.70s-long-straight' }, { id: '70s-male-shag', labelKey: 'timeMachine.presets.70s-male-shag' } ],
            clothing: [ { id: '70s-disco-suit', labelKey: 'timeMachine.presets.70s-disco-suit' }, { id: '70s-denim-jacket', labelKey: 'timeMachine.presets.70s-denim-jacket' } ],
            facial: [ { id: '70s-long-mustache', labelKey: 'timeMachine.presets.70s-long-mustache' }, { id: '70s-mutton-chops', labelKey: 'timeMachine.presets.70s-mutton-chops' } ],
        },
    },
    '1980s': {
        female: {
            hair: [ { id: '80s-big-permed', labelKey: 'timeMachine.presets.80s-big-permed' }, { id: '80s-side-ponytail', labelKey: 'timeMachine.presets.80s-side-ponytail' } ],
            clothing: [ { id: '80s-power-suit-shoulders', labelKey: 'timeMachine.presets.80s-power-suit-shoulders' }, { id: '80s-neon-workout', labelKey: 'timeMachine.presets.80s-neon-workout' } ],
        },
        male: {
            hair: [ { id: '80s-mullet', labelKey: 'timeMachine.presets.80s-mullet' }, { id: '80s-high-top-fade', labelKey: 'timeMachine.presets.80s-high-top-fade' } ],
            clothing: [ { id: '80s-members-only-jacket', labelKey: 'timeMachine.presets.80s-members-only-jacket' }, { id: '80s-acid-wash-jeans', labelKey: 'timeMachine.presets.80s-acid-wash-jeans' } ],
            facial: [ { id: '80s-stubble', labelKey: 'timeMachine.presets.80s-stubble' }, { id: '80s-chevron-mustache', labelKey: 'timeMachine.presets.80s-chevron-mustache' } ],
        },
    },
    'cyberpunk-future': {
        female: {
            hair: [ { id: 'cyber-neon-undercut', labelKey: 'timeMachine.presets.cyber-neon-undercut' }, { id: 'cyber-dreads', labelKey: 'timeMachine.presets.cyber-dreads' } ],
            clothing: [ { id: 'cyber-techwear-jacket', labelKey: 'timeMachine.presets.cyber-techwear-jacket' }, { id: 'cyber-glowing-armor', labelKey: 'timeMachine.presets.cyber-glowing-armor' } ],
        },
        male: {
            hair: [ { id: 'cyber-glowing-mohawk', labelKey: 'timeMachine.presets.cyber-glowing-mohawk' }, { id: 'cyber-short-circuits', labelKey: 'timeMachine.presets.cyber-short-circuits' } ],
            clothing: [ { id: 'cyber-high-collar-coat', labelKey: 'timeMachine.presets.cyber-high-collar-coat' }, { id: 'cyber-duster-jacket', labelKey: 'timeMachine.presets.cyber-duster-jacket' } ],
            facial: [ { id: 'cyber-glowing-stubble', labelKey: 'timeMachine.presets.cyber-glowing-stubble' } ],
        },
    },
    'solarpunk-future': {
        female: {
            hair: [ { id: 'solar-hair-with-flowers', labelKey: 'timeMachine.presets.solar-hair-with-flowers' }, { id: 'solar-intricate-braids', labelKey: 'timeMachine.presets.solar-intricate-braids' } ],
            clothing: [ { id: 'solar-flowing-fabric', labelKey: 'timeMachine.presets.solar-flowing-fabric' }, { id: 'solar-artisan-clothes', labelKey: 'timeMachine.presets.solar-artisan-clothes' } ],
        },
        male: {
            hair: [ { id: 'solar-medium-windswept', labelKey: 'timeMachine.presets.solar-medium-windswept' } ],
            clothing: [ { id: 'solar-utilitarian-overalls', labelKey: 'timeMachine.presets.solar-utilitarian-overalls' }, { id: 'solar-linen-shirt', labelKey: 'timeMachine.presets.solar-linen-shirt' } ],
            facial: [ { id: 'solar-short-neat-beard', labelKey: 'timeMachine.presets.solar-short-neat-beard' } ],
        },
    },
};

const BACKGROUND_PRESETS: Record<Era, {id: string, labelKey: string}[]> = {
    'ancient-rome': [ { id: 'bg-roman-forum', labelKey: 'timeMachine.presets.bg-roman-forum' }, { id: 'bg-roman-villa', labelKey: 'timeMachine.presets.bg-roman-villa' } ],
    'medieval-europe': [ { id: 'bg-castle-courtyard', labelKey: 'timeMachine.presets.bg-castle-courtyard' }, { id: 'bg-medieval-village', labelKey: 'timeMachine.presets.bg-medieval-village' } ],
    'feudal-japan': [ { id: 'bg-bamboo-forest', labelKey: 'timeMachine.presets.bg-bamboo-forest' }, { id: 'bg-edo-castle', labelKey: 'timeMachine.presets.bg-edo-castle' } ],
    'victorian-era': [ { id: 'bg-victorian-parlor', labelKey: 'timeMachine.presets.bg-victorian-parlor' }, { id: 'bg-london-gaslit-street', labelKey: 'timeMachine.presets.bg-london-gaslit-street' } ],
    'roaring-20s': [ { id: 'bg-art-deco-speakeasy', labelKey: 'timeMachine.presets.bg-art-deco-speakeasy' }, { id: 'bg-jazz-club-stage', labelKey: 'timeMachine.presets.bg-jazz-club-stage' } ],
    '1970s': [ { id: 'bg-disco-floor', labelKey: 'timeMachine.presets.bg-disco-floor' }, { id: 'bg-california-summer', labelKey: 'timeMachine.presets.bg-california-summer' } ],
    '1980s': [ { id: 'bg-neon-city', labelKey: 'timeMachine.presets.bg-neon-city' }, { id: 'bg-arcade', labelKey: 'timeMachine.presets.bg-arcade' } ],
    'cyberpunk-future': [ { id: 'bg-neon-megacity', labelKey: 'timeMachine.presets.bg-neon-megacity' }, { id: 'bg-hacker-den', labelKey: 'timeMachine.presets.bg-hacker-den' } ],
    'solarpunk-future': [ { id: 'bg-green-rooftops', labelKey: 'timeMachine.presets.bg-green-rooftops' }, { id: 'bg-community-garden', labelKey: 'timeMachine.presets.bg-community-garden' } ],
};

// ... (Các component Uploader, ImageViewer, PresetOption, OptionsGroup, CustomInput không thay đổi)
const Uploader = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
    const { t } = useLanguage();
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { onImageUpload(file); }
    };
    const handleDrop = (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) { onImageUpload(file); }
    };
    const handleDragEvents = (e: DragEvent<HTMLElement>, enter: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(enter);
    };

    return (
        <label
            htmlFor="time-machine-upload"
            className={cn("cursor-pointer aspect-[4/5] w-full max-w-md flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors p-4", isDragOver ? "border-neutral-500 bg-black/40" : "border-neutral-700 bg-black/20 hover:border-neutral-600")}
            onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-slate-400 font-semibold">{t('timeMachine.dropImage')}</span>
            <span className="text-slate-500 text-sm mt-1">{t('timeMachine.clickToUpload')}</span>
            <input id="time-machine-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
    );
};

const ImageViewer = ({ title, imageUrl, children }: { title: string, imageUrl: string | null, children?: React.ReactNode }) => (
    <div className="bg-black/20 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-lg flex flex-col w-full">
        <h3 className="font-bold text-2xl text-neutral-200 mb-4">{title}</h3>
        <div className="aspect-[4/5] w-full bg-black/20 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-500 text-center relative overflow-hidden">
            {imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : null}
            {children}
        </div>
    </div>
);

const PresetOption = ({ label, isSelected, onClick }: { label: string, isSelected: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={cn('px-3 py-1.5 text-xs rounded-md transition-colors', isSelected ? 'bg-neutral-200 text-black font-semibold' : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50')}>
        {label}
    </button>
);

const OptionsGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <h4 className="font-bold text-neutral-300 mb-2">{label}</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const CustomInput = ({ value, onChange, onFocus, placeholder }: { value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, onFocus: () => void, placeholder: string }) => (
     <input type="text" value={value} onChange={onChange} onFocus={onFocus} placeholder={placeholder} className="w-full bg-neutral-800/50 border border-neutral-700 rounded-md p-2 text-sm text-neutral-200 focus:ring-1 focus:ring-neutral-500 transition mt-2" />
);

export default function TimeMachine({ onBack }: { onBack: () => void }) {
    const { t } = useLanguage();
    const [view, setView] = useState<View>('config');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Options state
    const [era, setEra] = useState<Era>('1980s');
    const [gender, setGender] = useState<Gender>('female');
    const [hair, setHair] = useState('');
    const [clothing, setClothing] = useState('');
    const [facial, setFacial] = useState('');
    const [background, setBackground] = useState('');
    const [customHair, setCustomHair] = useState('');
    const [customClothing, setCustomClothing] = useState('');
    const [customFacial, setCustomFacial] = useState('');
    const [customBackground, setCustomBackground] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');

    // Reset options when era or gender changes to avoid mismatches
    useEffect(() => {
        setHair('');
        setClothing('');
        setFacial('');
        setBackground('');
        setCustomHair('');
        setCustomClothing('');
        setCustomFacial('');
        setCustomBackground('');
    }, [era, gender]);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
            setGeneratedImage(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleStartOver = () => {
        setUploadedImage(null);
        setGeneratedImage(null);
        setError(null);
        setView('config');
    };
    
    const handleGoBackToConfig = () => {
        setGeneratedImage(null);
        setError(null);
        setView('config');
    };

    const handleGenerate = async (instructions?: string) => {
        if (!uploadedImage) return;
        setIsLoading(true);
        setError(null);
        setView('result');

        const finalHair = customHair || hair;
        const finalClothing = customClothing || clothing;
        const finalFacial = customFacial || facial;
        const finalBackground = customBackground || background;

        let prompt = `Transform the person in the image into a classic ${gender} from the ${t(`timeMachine.presets.${era}`)} era.\n`;
        if (finalClothing) prompt += `They should be wearing ${finalClothing}.\n`;
        if (finalHair) prompt += `Give them ${finalHair} hair.\n`;
        if (gender === 'male' && finalFacial) prompt += `Add ${finalFacial}.\n`;
        if (finalBackground) prompt += `Change the background to an iconic ${finalBackground} setting.\n`;
        prompt += "It is crucial to maintain the original person's facial features and identity.";

        try {
            const resultUrl = await generateStyledImage(prompt, [uploadedImage], instructions || refinePrompt);
            setGeneratedImage(resultUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `momolita-ai-timemachine.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderConfigView = () => (
        <div className="w-full grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
                <h3 className="font-bold text-2xl text-neutral-200 mb-1">{t('timeMachine.uploadTitle')}</h3>
                {uploadedImage ? (
                    <div className="relative group aspect-[4/5] w-full max-w-sm rounded-md overflow-hidden">
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                ) : <Uploader onImageUpload={handleImageUpload} />}
            </div>
            <div className="bg-black/20 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                <h3 className="font-bold text-2xl text-neutral-200 mb-2">{t('timeMachine.optionsTitle')}</h3>
                <OptionsGroup label={t('timeMachine.era')}>
                    {ERA_OPTIONS.map(opt => <PresetOption key={opt.id} label={t(opt.labelKey)} isSelected={era === opt.id} onClick={() => setEra(opt.id)} />)}
                </OptionsGroup>
                 <OptionsGroup label={t('timeMachine.gender')}>
                    <PresetOption label={t('timeMachine.female')} isSelected={gender === 'female'} onClick={() => setGender('female')} />
                    <PresetOption label={t('timeMachine.male')} isSelected={gender === 'male'} onClick={() => setGender('male')} />
                </OptionsGroup>
                
                {/* Các tùy chọn động dựa trên 'era' và 'gender' */}
                <OptionsGroup label={t('timeMachine.clothing')}>
                    {PRESETS[era][gender].clothing.map(opt => <PresetOption key={opt.id} label={t(opt.labelKey)} isSelected={clothing === t(opt.labelKey)} onClick={() => { setClothing(t(opt.labelKey)); setCustomClothing(''); }} />)}
                </OptionsGroup>
                <CustomInput value={customClothing} onChange={e => setCustomClothing(e.target.value)} onFocus={() => setClothing('')} placeholder={t('timeMachine.customPrompt')} />

                <OptionsGroup label={t('timeMachine.hair')}>
                    {PRESETS[era][gender].hair.map(opt => <PresetOption key={opt.id} label={t(opt.labelKey)} isSelected={hair === t(opt.labelKey)} onClick={() => { setHair(t(opt.labelKey)); setCustomHair(''); }} />)}
                </OptionsGroup>
                <CustomInput value={customHair} onChange={e => setCustomHair(e.target.value)} onFocus={() => setHair('')} placeholder={t('timeMachine.customPrompt')} />

                {gender === 'male' && PRESETS[era][gender].facial && (
                    <>
                        <OptionsGroup label={t('timeMachine.facialFeature')}>
                            {PRESETS[era][gender].facial!.map(opt => <PresetOption key={opt.id} label={t(opt.labelKey)} isSelected={facial === t(opt.labelKey)} onClick={() => { setFacial(t(opt.labelKey)); setCustomFacial(''); }} />)}
                        </OptionsGroup>
                        <CustomInput value={customFacial} onChange={e => setCustomFacial(e.target.value)} onFocus={() => setFacial('')} placeholder={t('timeMachine.customPrompt')} />
                    </>
                )}

                <OptionsGroup label={t('timeMachine.background')}>
                     {BACKGROUND_PRESETS[era].map(opt => <PresetOption key={opt.id} label={t(opt.labelKey)} isSelected={background === t(opt.labelKey)} onClick={() => { setBackground(t(opt.labelKey)); setCustomBackground(''); }} />)}
                </OptionsGroup>
                <CustomInput value={customBackground} onChange={e => setCustomBackground(e.target.value)} onFocus={() => setBackground('')} placeholder={t('timeMachine.customPrompt')} />

                 <div>
                    <h4 className="font-bold text-neutral-300 mb-2 mt-4">{t('timeMachine.refineTitle')}</h4>
                    <textarea value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} placeholder={t('common.refinePlaceholder')} rows={2} className="w-full bg-neutral-800/50 border border-neutral-700 rounded-md p-2 text-sm text-neutral-200 focus:ring-1 focus:ring-neutral-500 transition"/>
                </div>
                <button onClick={() => handleGenerate()} disabled={!uploadedImage || isLoading} className="w-full mt-4 flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-lg bg-neutral-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                    {isLoading ? t('timeMachine.generatingButton') : t('timeMachine.generateButton')}
                </button>
            </div>
        </div>
    );

    const renderResultView = () => (
        <div className="w-full flex flex-col items-center gap-8">
            <div className="w-full grid md:grid-cols-2 gap-8">
                <ImageViewer title={t('timeMachine.originalImage')} imageUrl={uploadedImage} />
                <ImageViewer title={t('timeMachine.eraPortrait')} imageUrl={generatedImage}>
                    {isLoading && <div className="w-full h-full flex items-center justify-center absolute bg-black/50"><svg className="animate-spin h-10 w-10 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
                    {error && !isLoading && <div className="p-4 text-red-400"><p className="font-semibold mb-2">{t('timeMachine.generationFailed')}</p><p className="text-xs text-slate-400 mb-4">{error}</p><button onClick={() => handleGenerate()} className="text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-md hover:bg-red-500/40">{t('common.retry')}</button></div>}
                </ImageViewer>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <button onClick={handleDownload} disabled={!generatedImage || isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 text-black font-bold py-3 px-6 rounded-lg bg-neutral-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{t('common.download')}</button>
                <button onClick={handleStartOver} className="font-bold text-center text-neutral-300 bg-black/20 backdrop-blur-sm border-2 border-neutral-700 py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-800 hover:text-white">{t('common.startOver')}</button>
            </div>
        </div>
    );

    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center p-4 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-4xl max-h-4xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-neutral-600 to-black opacity-20 rounded-full blur-3xl" /></div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-7xl mx-auto flex flex-col items-center z-10">
                <header className="w-full flex justify-between items-center py-4 mb-6">
                    <button onClick={view === 'config' ? onBack : handleGoBackToConfig} className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>{view === 'config' ? t('common.backToTools') : t('common.goBack')}</button>
                    <div className="flex items-center gap-4"><p className="text-sm text-neutral-400 hidden sm:block">{t('common.poweredByGemini')}</p><LanguageSwitcher /></div>
                </header>
                <div className="text-center mb-10">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-2 flex items-center justify-center gap-4 tracking-tight">
                        <span className="text-neutral-300"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/><path d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/></svg></span>
                        {t('app.timeMachineTitle')}
                    </h2>
                    <p className="text-xl md:text-2xl text-neutral-400 mt-2">{t('timeMachine.subtitle')}</p>
                </div>
                {view === 'config' ? renderConfigView() : renderResultView()}
            </motion.div>
        </main>
    );
}
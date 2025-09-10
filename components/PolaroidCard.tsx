/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { DraggableCardContainer, DraggableCardBody } from './ui/draggable-card';
import { cn } from '../lib/utils';
import type { PanInfo } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

type ImageStatus = 'pending' | 'done' | 'error';

interface PolaroidCardProps {
    id: string;
    imageUrl?: string;
    caption: string;
    status: ImageStatus;
    error?: string;
    dragConstraintsRef?: React.RefObject<HTMLElement>;
    onRegenerate?: (id: string) => void;
    onDownload?: (id: string, url?: string) => void;
    isMobile?: boolean;
    isHighlighted?: boolean;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-8 w-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ErrorDisplay = ({ onRetry, id, error }: { onRetry: (id: string) => void; id: string; error?: string }) => {
    const { t } = useLanguage();
    return (
        <div className="p-4 text-center text-red-500 dark:text-red-400">
            <h4 className="font-bold mb-2">{t('polaroid.generationFailed')}</h4>
            <p className="text-xs text-foreground/70 mb-4">{error}</p>
            <button
                onClick={() => onRetry(id)}
                className="text-sm bg-red-500/20 text-red-500 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-500/40 transition-colors"
            >
                {t('common.retry')}
            </button>
        </div>
    );
};


const PolaroidCard: React.FC<PolaroidCardProps> = ({
    id,
    imageUrl,
    caption,
    status,
    error,
    dragConstraintsRef,
    onRegenerate,
    onDownload,
    isMobile = false,
    isHighlighted = false,
}) => {
    const { t } = useLanguage();

    const PolaroidContent = (
        <div className="relative w-full h-full flex flex-col">
            <div className="relative w-full aspect-square bg-secondary/50 border-4 border-background dark:border-secondary/20 flex items-center justify-center">
                {status === 'pending' && <LoadingSpinner />}
                {status === 'error' && onRegenerate && <ErrorDisplay onRetry={onRegenerate} id={id} error={error} />}
                {status === 'done' && imageUrl && (
                    <img src={imageUrl} alt={caption} className="w-full h-full object-cover" />
                )}
                {!imageUrl && status === 'done' && (
                    <div className="text-center p-4 text-muted-foreground">
                        <p>{t('polaroid.uploadPhoto')}</p>
                    </div>
                )}

                {status === 'done' && imageUrl && onDownload && onRegenerate && (
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={() => onRegenerate(id)}
                            className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                            aria-label={t('common.regenerate')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110-2h6a1 1 0 011 1v6a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                        </button>
                        <button
                            onClick={() => onDownload(id, imageUrl)}
                            className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                            aria-label={t('common.download')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-grow w-full pt-4 pb-2 px-2">
                <p className="text-center font-bold text-lg text-foreground/80">{caption}</p>
            </div>
        </div>
    );

    if (isMobile) {
        return (
             <div className={cn(
                "group relative h-96 w-80 overflow-hidden rounded-md bg-card p-4 shadow-lg transition-all duration-300",
                isHighlighted && "border-2 border-accent-start shadow-accent-start/20",
                status === 'pending' && 'animate-pulse'
             )}>
                {PolaroidContent}
            </div>
        )
    }

    return (
        <DraggableCardContainer>
            <DraggableCardBody 
                dragConstraintsRef={dragConstraintsRef} 
                className={cn(
                    "h-96 w-80 p-4 bg-card group",
                    isHighlighted && "ring-2 ring-accent-start",
                    status === 'pending' && 'animate-pulse'
                )}
            >
                {PolaroidContent}
            </DraggableCardBody>
        </DraggableCardContainer>
    );
};

export default PolaroidCard;

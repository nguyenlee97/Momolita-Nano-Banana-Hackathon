/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


// --- Helper Functions ---

/**
 * Processes the Gemini API response, extracting the image or throwing an error if none is found.
 * @param response The response from the generateContent call.
 * @returns A data URL string for the generated image.
 */
function processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`The AI model responded with text instead of an image: "${textResponse || 'No text response received.'}"`);
}

/**
 * A wrapper for the Gemini image model API call that includes a retry mechanism for internal server errors.
 * @param parts The array of parts for the request payload.
 * @returns The GenerateContentResponse from the API.
 */
async function callImageModelWithRetry(parts: Part[]): Promise<GenerateContentResponse> {
    const maxRetries = 3;
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
        } catch (error) {
            console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            const isInternalError = errorMessage.includes('"code":500') || errorMessage.includes('INTERNAL');

            if (isInternalError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`Internal error detected. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error; // Re-throw if not a retriable error or if max retries are reached.
        }
    }
    // This should be unreachable due to the loop and throw logic above.
    throw new Error("Gemini API call failed after all retries.");
}


/**
 * Generates a styled image from a source image and a prompt.
 * @param prompt The prompt to guide the image generation.
 * @param imageDataUrls An array of data URL strings for the images (e.g., ['data:image/png;base64,...']).
 * @param additionalInstructions Optional text for refining a previous generation.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateStyledImage(prompt: string, imageDataUrls: string[], additionalInstructions?: string): Promise<string> {
    if (imageDataUrls.length === 0) {
        throw new Error("At least one image data URL is required.");
    }

    const imageParts: Part[] = imageDataUrls.map(dataUrl => {
        const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
        if (!match) {
            throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
        }
        const [, mimeType, base64Data] = match;
        return {
            inlineData: { mimeType, data: base64Data },
        };
    });

    let finalPrompt = prompt;
    if (additionalInstructions && additionalInstructions.trim() !== '') {
        finalPrompt += `\n\n**REGENERATION INSTRUCTIONS:**\n${additionalInstructions}`;
    }

    const textPart: Part = { text: finalPrompt };
    
    const allParts = [...imageParts, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during image generation.", error);
        throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
    }
}

/**
 * Extracts an outfit from an image of a person.
 * @param imageDataUrl The data URL string for the source image.
 * @param additionalInstructions Optional text for refining a previous generation.
 * @returns A promise that resolves to a data URL of the generated outfit image.
 */
export async function extractOutfitFromImage(imageDataUrl: string, additionalInstructions?: string): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };

    let promptText = `Your single, most important task is to perform a perfect extraction of the entire outfit from the person in the image and create a professional 'flat lay' or 'ghost mannequin' style product photograph.

**MANDATORY PROCESS:**

1.  **IDENTIFY THE FULL OUTFIT:** Carefully identify every single piece of apparel and accessory worn by the person. This includes, but is not limited to:
    - Top (shirt, blouse, t-shirt, etc.)
    - Bottoms (pants, jeans, skirt, shorts, etc.)
    - Dresses or jumpsuits
    - Outerwear (jacket, coat, blazer, etc.)
    - Footwear (shoes, boots, sandals, etc.)
    - Accessories (hat, scarf, belt, bag, jewelry, glasses, etc.)

2.  **PERFORM COMPLETE EXTRACTION:** You must extract all identified items. The extraction must be clean and precise, following the exact contours of the clothing.

3.  **ABSOLUTE HUMAN REMOVAL:** It is **critically important** that you remove **100%** of the person from the final image. There must be **ZERO** human elements present. This includes:
    - NO skin, hair, face, or any body parts.
    - NO hands, fingers, feet, or toes.
    - The final image should look as if the clothes are floating or laid out, with no person inside them.

4.  **CREATE THE PRODUCT SHOT:**
    - Arrange the extracted clothing and accessories neatly and logically on a completely plain, solid, light grey background (hex code: #f0f0f0).
    - The final image must look like a high-end e-commerce product photo. It must be clean, professional, and focused solely on the apparel.`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
        promptText += `\n\n**REGENERATION INSTRUCTIONS:**\n${additionalInstructions}`;
    }

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during outfit extraction.", error);
        throw new Error(`The AI model failed to extract the outfit. Details: ${errorMessage}`);
    }
}

/**
 * Fills the transparent area of an image based on a prompt.
 * @param prompt The prompt to guide the image generation.
 * @param maskedImageDataUrl The data URL for the image with a transparent area to be filled.
 * @param additionalInstructions Optional text for refining a previous generation.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function fillMaskedImage(prompt: string, maskedImageDataUrl: string, additionalInstructions?: string): Promise<string> {
    const match = maskedImageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };
    
    let promptText = `Your task is to perform photorealistic inpainting. You will be given an image with a transparent area. Your goal is to fill in this transparent region based on the user's prompt.

**CRITICAL INSTRUCTIONS:**
1.  Identify the transparent region in the provided image. This is the only area you should modify.
2.  Fill this transparent area with content that matches the user's prompt.
3.  **Seamless Integration:** The newly generated content must blend perfectly with the surrounding, non-transparent parts of the image. You must accurately match the existing lighting, shadows, perspective, color grading, and textures.
4.  The final result must be a complete, opaque, and realistic image.

**PROMPT:** "${prompt}"`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
        promptText += `\n\n**REGENERATION INSTRUCTIONS:**\n${additionalInstructions}`;
    }

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during image inpainting.", error);
        throw new Error(`The AI model failed to generate an image. Details: ${errorMessage}`);
    }
}

/**
 * Removes the masked object from an image, filling the space with a realistic background.
 * @param maskedImageDataUrl The data URL for the image with a transparent area where the object was.
 * @returns A promise that resolves to a base64-encoded image data URL of the edited image.
 */
export async function removeObjectFromImage(maskedImageDataUrl: string): Promise<string> {
    const match = maskedImageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };

    const promptText = `You are an expert photorealistic inpainting model. You will be given an image with a transparent area that marks an object to be removed.

**CRITICAL TASK:**
Your primary task is to seamlessly and realistically fill this transparent region. Reconstruct the background and any elements that would logically be behind the removed object.

**CONTEXT-AWARE RECONSTRUCTION:**
- The final result MUST be a plausible and coherent image.
- If the transparent area slightly overlaps a person or a foreground object that should be kept, prioritize the logical reconstruction of that person or object. For example, if a user masks an object a person is holding, and the mask slightly covers their hand, you should remove the object and reconstruct the hand naturally.
- You MUST perfectly match the original image's lighting, shadows, perspective, color grading, and texture for a seamless blend.
- The final output should be a complete, opaque image with no trace of the removed object or any visual artifacts.`;

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during object removal.", error);
        throw new Error(`The AI model failed to remove the object. Details: ${errorMessage}`);
    }
}

/**
 * Generates a background image by removing the main person from a concept image.
 * @param conceptImageDataUrl The data URL for the source concept image.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated background.
 */
export async function generateBackgroundFromConcept(conceptImageDataUrl: string): Promise<string> {
    const match = conceptImageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };

    const promptText = `You are an expert photorealistic inpainting model. Your task is to identify the primary person in the provided image, completely remove them, and seamlessly reconstruct the background that was behind them.

**CRITICAL TASK:**
- The final image must **only** contain the background scene.
- There should be **no trace** of the removed person.
- The reconstruction must be context-aware and perfectly match the original image's lighting, shadows, perspective, color grading, and texture for a seamless blend.
- The final output should be a complete, plausible, and coherent image of the environment.`;

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during background generation.", error);
        throw new Error(`The AI model failed to generate the background. Details: ${errorMessage}`);
    }
}


/**
 * Draws an image with a marker at a specified point.
 * @param imageDataUrl The base64 URL of the image.
 * @param x The x-coordinate for the marker.
 * @param y The y-coordinate for the marker.
 * @returns A promise resolving to the base64 URL of the image with the marker.
 */
async function drawMarkerOnImage(imageDataUrl: string, x: number, y: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Draw a prominent marker
            const radius = Math.max(10, Math.min(img.naturalWidth, img.naturalHeight) * 0.01);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = radius * 0.2;
            ctx.stroke();

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image for drawing marker.'));
        img.src = imageDataUrl;
    });
}

/**
 * Removes the background from an image, keeping the object at a specified point, and placing it on a white background.
 * @param imageDataUrl The data URL of the source image.
 * @param x The x-coordinate of the point on the original image.
 * @param y The y-coordinate of the point on the original image.
 * @returns A promise that resolves to a data URL of the image with a white background.
 */
export async function removeBackgroundFromImageAtPoint(imageDataUrl: string, x: number, y: number): Promise<string> {
    const imageWithMarkerDataUrl = await drawMarkerOnImage(imageDataUrl, x, y);

    const match = imageWithMarkerDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL after drawing marker.");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };
    
    const promptText = `You are a world-class background removal AI. Your task is to perfectly isolate an object or person from an image based on a visual cue.

**INPUT:**
You will receive an image containing a red circular marker. This marker points to the subject you need to isolate.

**CORE TASK:**
1.  **Subject Identification:** Locate the red marker. The primary object or person that the marker is on top of is the "subject".
2.  **Precise Segmentation:** Create a pixel-perfect segmentation mask for the *entire* subject. For example, if the marker is on a person's shirt, you must segment the entire person (head, hair, clothes, limbs, etc.). If it's on a flower in a vase, segment all the flowers and the vase as a single subject.
3.  **Output Generation:** Create a new PNG image with the same dimensions as the input.
    - The segmented subject must be perfectly preserved.
    - Everything that is NOT the subject (i.e., the background) must be replaced with a solid, pure white color (#FFFFFF).
    - The red marker must NOT be in the final output image.

**QUALITY REQUIREMENTS:**
- The edges of the subject must be clean and sharp. No blurry or jagged edges.
- Hair and other fine details must be handled with extreme precision.
- The final image must contain only the isolated subject on a pure white background.`;

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during background removal.", error);
        throw new Error(`The AI model failed to remove the background. Details: ${errorMessage}`);
    }
}

/**
 * Generates a photo booth style collage from a single image.
 * @param imageDataUrl The data URL string for the source image.
 * @param count The number of photos in the collage (4, 6, 8, 9, or 12).
 * @returns A promise that resolves to a base64-encoded image data URL of the generated collage.
 */
export async function generatePhotoBoothImage(imageDataUrl: string, count: 4 | 6 | 8 | 9 | 12): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };

    const gridLayout = {
        4: '2x2',
        6: '2x3',
        8: '2x4',
        9: '3x3',
        12: '3x4',
    }[count];

    const promptText = `
**MISSION: Create a "Purikura" Style Photo Booth Collage**

Your task is to create a single, cohesive image that looks like a photo strip or collage from a Japanese-style "Purikura" photo booth.

**INPUT:**
You will receive a single image of a person. This person is the subject for the entire collage.

**CRITICAL REQUIREMENTS:**

1.  **SINGLE IMAGE OUTPUT:** The final output MUST be a single image file containing a grid of photos.
2.  **GRID LAYOUT:** Arrange the photos in a ${gridLayout} grid.
3.  **IDENTITY PRESERVATION:** The person in EVERY photo within the grid must be the **exact same person** from the input image. Their identity, facial features, and general appearance must be perfectly consistent.
4.  **POSE & EXPRESSION VARIETY:** Each photo in the grid must feature the person in a **different, cute, and playful pose or expression**. Think "aegyo" or "kawaii" styles:
    - Winking, peace signs, finger hearts, puffed cheeks, surprised looks, joyful laughter, etc.
5.  **AESTHETIC & DECORATION:** This is NOT a simple grid. You must apply a heavy "Purikura" aesthetic:
    - **Doodles & Stickers:** Overlay the image with cute, hand-drawn-style doodles. Examples: sparkles, stars, hearts, rainbows, funny animals, etc.
    - **Text:** Add short, cute, hand-written style text like "Hi!", "LOOK!", "Hello", ":)", etc.
    - **Background:** The overall background of the collage should be bright and cheerful, often a simple sky blue or a soft pastel color, consistent with the reference images provided by the user.
    - **Cohesive Style:** The person's clothing and the immediate background within each small photo should be consistent with the original input image, but the overall collage is a new, decorated creation.
6.  **FINAL IMAGE:** The result should be a fun, vibrant, and charming image that perfectly captures the playful spirit of a photo booth.
`;

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during photo booth generation.", error);
        throw new Error(`The AI model failed to generate the photo booth image. Details: ${errorMessage}`);
    }
}

/**
 * Generates a "clone effect" or "multiplicity" photograph from a single image.
 * @param imageDataUrl The data URL string for the source image.
 * @param additionalInstructions Optional text for refining a previous generation.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateCloneEffectImage(imageDataUrl: string, additionalInstructions?: string): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart: Part = {
        inlineData: { mimeType, data: base64Data },
    };

    let promptText = `
**MISSION: Create a "Clone Effect" or "Multiplicity" photograph.**

Your task is to take a single person from the provided image and duplicate them multiple times within the same scene, creating a surreal and artistic photograph.

**INPUT:**
You will receive a single image containing one person.

**CRITICAL REQUIREMENTS:**

1.  **IDENTIFY & PRESERVE:** Identify the primary person in the image. The person in EVERY clone within the final photo must be the **exact same person**. Their identity, facial features, and clothing must be perfectly consistent.

2.  **DUPLICATE & POSE:** Create between 5 and 7 clones of this person. Each clone MUST be in a **different, dynamic, and interesting pose**. The poses should interact with the environment naturally. Avoid repetitive or static poses.

3.  **COHESIVE SCENE:**
    - The background and environment must be an extension or re-imagination of the original photo's scene. It should feel like a single, unified location.
    - All clones must be logically placed within this scene, as if they were all photographed together at the same time.
    - The lighting, shadows, color grading, and overall photographic style must be consistent across the entire image, including all clones and the background, to create a believable and seamless composition.

4.  **FINAL IMAGE:** The output must be a single, high-quality, photorealistic image. It should look like a professional and creative photoshoot.`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
        promptText += `\n\n**REGENERATION INSTRUCTIONS:**\n${additionalInstructions}`;
    }

    const textPart: Part = { text: promptText };
    const allParts = [imagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during clone effect generation.", error);
        throw new Error(`The AI model failed to generate the clone effect image. Details: ${errorMessage}`);
    }
}

/**
 * Swaps a face from a source image onto a target image.
 * @param sourceImageDataUrl The data URL of the image to modify (the one receiving the new face).
 * @param targetFaceDataUrl The data URL of the image containing the face to use.
 * @param _unused This parameter is not used.
 * @param additionalInstructions Optional text for refining a previous generation.
 * @returns A promise that resolves to a data URL of the generated image.
 */
export async function swapFacesInImage(sourceImageDataUrl: string, targetFaceDataUrl: string, _unused?: any, additionalInstructions?: string): Promise<string> {
    const sourceMatch = sourceImageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    const faceMatch = targetFaceDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);

    if (!sourceMatch) {
        throw new Error("Invalid source image data URL format.");
    }
    if (!faceMatch) {
        throw new Error("Invalid face source data URL format.");
    }

    const [, sourceMimeType, sourceBase64Data] = sourceMatch;
    const [, faceMimeType, faceBase64Data] = faceMatch;

    const sourceImagePart: Part = {
        inlineData: { mimeType: sourceMimeType, data: sourceBase64Data },
    };
    const faceImagePart: Part = {
        inlineData: { mimeType: faceMimeType, data: faceBase64Data },
    };

    let promptText = `
**CRITICAL MISSION: Photorealistic Face Swap**

You will be given two images.
-   **Image 1 (Source Image):** This is the main image. It contains the person, body, pose, clothing, and background that MUST be preserved.
-   **Image 2 (Face Source):** This image contains the face that you MUST transfer onto the person in Image 1.

**UNBREAKABLE RULES:**
1.  **Identity Transfer:** You must extract the face from Image 2 and perfectly blend it onto the person in Image 1. The final image must have the body/pose/clothing/background of Image 1, but the face from Image 2.
2.  **Seamless Integration:** The swapped face must be seamlessly integrated. This means you must perfectly match the lighting, skin tone, shadows, perspective, and color grading of the original Source Image (Image 1).
3.  **Preserve Everything Else:** Everything in Image 1 EXCEPT for the face must remain unchanged. This includes hair (as much as possible), clothing, background, and overall composition.
4.  **No Watermarks/Artifacts:** The final output must be a clean, high-quality photograph with no visual artifacts.
`;

    if (additionalInstructions && additionalInstructions.trim() !== '') {
        promptText += `\n\n**REGENERATION INSTRUCTIONS:**\n${additionalInstructions}`;
    }

    const textPart: Part = { text: promptText };
    // The order of images matters for the prompt. Image 1 is source, Image 2 is face.
    const allParts = [sourceImagePart, faceImagePart, textPart];

    try {
        const response = await callImageModelWithRetry(allParts);
        return processGeminiResponse(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("An unrecoverable error occurred during face swap.", error);
        throw new Error(`The AI model failed to swap the face. Details: ${errorMessage}`);
    }
}
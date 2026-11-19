import * as THREE from 'three';

/**
 * The palette and the star shader were tuned on three r128, which did no colour management:
 * hex colours went to the GPU as they are and the output was not converted to sRGB.
 * Since r152 three converts colours to linear and the output back to sRGB by default,
 * which would wash out the gold. Keep the old behaviour: no conversion either way.
 * Imported first by the scene, before any THREE.Color is created.
 */
THREE.ColorManagement.enabled = false;

export const OUTPUT_COLOR_SPACE = THREE.LinearSRGBColorSpace;

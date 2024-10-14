import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface ModelProps {
    modelUrl: string;
    shadows?: boolean;
    contactShadow?: boolean;
    autoRotate?: boolean;
    environment?: string;
    preset?: string;
    intensity?: number;
}

export function Model({
                          modelUrl,
                          shadows = true,
                          contactShadow = true,
                          autoRotate = false,
                          environment = 'city',
                          preset = 'rembrandt',
                          intensity = 1,
                      }: ModelProps) {
    const gltf = useGLTF("/unrpa/34bfd578-523a-4bd5-a172-04dce6d87a0b_raw.glb") as any; // Load the entire GLTF object
    const ref = useRef<Group>(null);

    useEffect(() => {
        if (gltf) {
            console.log(gltf);

            // Traverse the GLTF scene to enable shadows and adjust material properties
            gltf.scene.traverse((obj: any) => {
                if (obj.isMesh) {
                    obj.castShadow = obj.receiveShadow = shadows;
                    if (obj.material) {
                        obj.material.envMapIntensity = 0.8;
                    }
                }
            });
        }
    }, [gltf, shadows]);

    return (
        <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]} camera={{ position: [0, 0, 150], fov: 50 }}>
            <ambientLight intensity={0.25} />
            <Suspense fallback={null}>
                <Stage
                    controls={ref}
                    preset={preset}
                    intensity={intensity}
                    contactShadow={contactShadow}
                    shadows
                    adjustCamera
                    environment={environment}
                >
                    <primitive object={gltf.scene} castShadow receiveShadow position={[0, 0.189, -0.043]} />
                </Stage>
            </Suspense>
            <OrbitControls ref={ref} autoRotate={autoRotate} />
        </Canvas>
    );
}

export default Model;

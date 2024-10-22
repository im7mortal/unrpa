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
    height?: string;  // Allow custom height to be passed as a prop
}

export function Model({
                          modelUrl,
                          shadows = true,
                          contactShadow = true,
                          autoRotate = false,
                          environment = 'city',
                          preset = 'rembrandt',
                          intensity = 1,
                          height = '500px',  // Default height set to 500px
                      }: ModelProps) {
    const gltf = useGLTF(modelUrl) as any; // Dynamically load the model from props
    const ref = useRef<Group>(null);

    useEffect(() => {
        if (gltf) {
            console.log(gltf);

            // Traverse the GLTF scene to enable shadows and adjust material properties
            gltf.scene.traverse((obj: any) => {
                if (obj.isMesh) {
                    obj.castShadow = obj.receiveShadow = shadows;
                    if (obj.material && obj.material.isMeshStandardMaterial) {
                        obj.material.envMapIntensity = 0.8;
                    }
                }
            });
        }
    }, [gltf, shadows]);

    return (
        <div style={{ height, width: '100%' }}> {/* Wrapping div with dynamic height */}
            <Canvas
                gl={{ preserveDrawingBuffer: true }}
                shadows
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 150], fov: 50 }}
                style={{ border: '2px solid blue' }}  // Border added directly to the Canvas
            >

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
        </div>
    );
}

export default Model;

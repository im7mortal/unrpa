import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import CircularJSON from 'circular-json';

export function ModelViewer({ modelUrl }) {
    const gltf = useGLTF(modelUrl);

    // Log the GLTF object to inspect its structure
    console.log('GLTF Object:', gltf);

    const downloadJsonData = () => {
        const dataStr = CircularJSON.stringify(
            gltf,
            null,
            2
        );
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'model-data.json';
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <button onClick={downloadJsonData}>Download JSON Data</button>
            <Canvas>
                <ambientLight intensity={0.5}/>
                <OrbitControls/>
                {/*<primitive object={gltf} />*/}
                <mesh
                    castShadow
                    receiveShadow
                    geometry={gltf.nodes.geometry_0.geometry}
                    material={gltf.nodes.geometry_0.material}
                />
            </Canvas>
        </>
    );
}

export default ModelViewer;

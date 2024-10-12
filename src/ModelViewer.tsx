import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

export function ModelViewer({ modelUrl }: { modelUrl: string }) {
    const { nodes, materials } = useGLTF(modelUrl);

    return (
        <Canvas>
            <ambientLight intensity={0.5} />
            <OrbitControls />
            <group dispose={null}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Scene.geometry}
                    material={materials.default}
                />
            </group>
        </Canvas>
    );
}

// useGLTF('https://digitaltwin-satellite.s3.amazonaws.com/hd/781c2417-2420-4c2c-bd42-142e606a0302/scans/588c8c60-8aab-4d08-b889-75cd5cdcb0c6_raw.glb?X-Amz-Security-Token=IQoJb3JpZ2luX2VjECoaCXVzLWVhc3QtMSJIMEYCIQDcxwk4h8%2F5wapkigrWhov9jDQ%2Fl9MlPMrHCj9UlMcXIQIhAORBJ7Pdxj8PSPUE2hIee2u20VJMjv%2BHv9SUYfxSMD8kKpkFCIP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQBBoMNTk5NTYwMDMwNzAxIgx0z1eS0N1X9OHlQV0q7QRFtRveqYYFt4XP3SzoB3ljGCVoMtzAH9VeReV7aw8xq4bdM0M0l0WbSnQ5iCIOnlkruYvkJ6tOkln3EzJj4q1xUDLzj8nI0ifDW%2FfF31NOvy8qfOPKT4pfy0UdpZco7ttuNjXVtCpkg4zQjY7EtOTO2xMgWCAkuG%2BTNxfSDYhrcd%2FHqPjooBcKQL885StJLKfcIuj6WQDCLEI6cxuH51fphAJvt0AEdA%2FsH65ZzUL8GhPG56rJcUOWLhOxdJx8eJFLIHUHCKM3GvIGgwnm14um4cXWZhOtVDs7nklpAkZKjdnzsaotMyJ3jMhenCUf5RKdjU9gOKoyqO89u%2ByfEtsplr%2BOjZtfuCs9EMyv9xhycqSb2uc8DP7eJlDWLCLVvu%2FMXpYqLkar5EpC%2Fwz3WYy2lqq6lWtkTfkD%2FD0wGwr7WhuT%2FKNyQJtUycxJ6ff1aEspJ5s5VBH9MuZZhq1EVH6sNpB4qVA%2B3007tkJk9jyfGCUK%2FgTWu9JjYGTq%2FGtIdl0apPVtido4ypUIAS2nbS7iZJXRXTmY9TJEN8YhTBjn8GoLC7aKFV%2FeheAM856J%2FKzkVd6j3jdcXni7%2B1un8anp5xASfUjtrmOjgs5Du5aYPsT5ibc26JPf77LlIYLitAP1tZjFyIvNp1MmaxX5M%2Fj4ISJtWBNDu1TX1tyqd8ikN3vh%2FZrhYLpD3SCCshatNIBDo%2BxQeSE228H1TXzhXFvp8NNC5jcShYE22oeY7gVBRFQMj2eiK489dEnEXgI0oSsxcV6W8v%2BL0lRr5wAPiY%2F82s7s8%2FsBcRTnN6bTAYsn89yGbuZMqA53USk405kwkoiiuAY6mgHBS22IXB738iOsVptC3mkfD%2F8cXbHn1c0Nh4kXtGJNM%2Fg9SQCMBrVizRp95rpkNI0bCWeiyqoLYKQ2luvDNmsVPaELvVgRmGJRnS3%2BkcrsdxR9nN6QyzW1BNgzbfDkAdxDZrQKkrOKUZ%2BSVyoWr3G7s67fTcBAbbWuwSGRYyeXO%2FgLSsajn5W2KgHrkrqdpHwByQlbHlnEkwF9&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241011T015919Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIAYXGEQBHWUDN3X52D%2F20241011%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d169101498cb0b479cf48dc114a4db6e4ef5f4b6213321c8f78eb6114dd19eda'); // Preloading is optional

export default ModelViewer;

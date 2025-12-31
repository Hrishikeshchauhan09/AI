import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AvatarProps {
    url: string;
    animationState: 'Idle' | 'Talking';
}

export function Avatar({ url, animationState }: AvatarProps) {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(url);
    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        // Default model might not have animations built-in if using raw RPM GLB without anims
        // For MVP, we'll try to play whatever is available or just load the model
        if (actions) {
            // Placeholder: In a real app we'd load separate animation files (FBX/GLB) and retarget them
            // For this MVP, we assume the GLB includes basic animations or we just render static first
            console.log("Available animations:", Object.keys(actions));
            const action = actions[Object.keys(actions)[0]]; // Play first found animation
            if (action) action.play();
        }
    }, [actions, animationState]);

    return (
        <group ref={group} dispose={null}>
            <primitive object={scene} scale={2} position={[0, -2, 0]} />
        </group>
    );
}

// Preload to avoid loading delays
useGLTF.preload('https://models.readyplayer.me/64b73e5d3c8d3d5b0a3c2a1d.glb'); 

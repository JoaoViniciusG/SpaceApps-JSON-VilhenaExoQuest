"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Planet, PlanetarySystem } from "@/types/planet";

// =============================
// Starfield (igual ao seu, só tipado)
// =============================
interface StarfieldProps {
  count?: number;
  pulseSpeed?: number; // cycles per second for the pulsing
  pulseAmplitude?: number; // how strong the pulse is (0-1)
  baseSize?: number; // base size of points
  baseOpacity?: number; // base opacity of points
}

const Starfield = ({ count = 1000, pulseSpeed = 1, pulseAmplitude = 0.5, baseSize = 0.05, baseOpacity = 0.8 }: StarfieldProps) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, [count]);

  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  useFrame((state) => {
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      const pulse = Math.sin(t * pulseSpeed * Math.PI * 2);
      const opacity = THREE.MathUtils.clamp(baseOpacity + pulseAmplitude * pulse, 0, 1);
      materialRef.current.opacity = opacity;
      const sizeFactor = Math.max(0.001, 1 + 0.5 * pulseAmplitude * pulse);
      materialRef.current.size = baseSize * sizeFactor;
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={baseSize} color="#ffffff" transparent opacity={baseOpacity} sizeAttenuation />
    </points>
  );
};

// =============================
// Helpers de escala/derivações (API-only)
// =============================
function normalize(values: (number | null | undefined)[], minOut: number, maxOut: number) {
  const nums = values.filter((v): v is number => typeof v === "number" && isFinite(v));
  const mid = (minOut + maxOut) / 2;
  if (nums.length === 0) return () => mid;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return () => mid;
  return (v?: number | null) => {
    if (v == null || !isFinite(v)) return mid;
    const t = (v - min) / (max - min);
    return minOut + t * (maxOut - minOut);
  };
}

function omegaFromPeriodDays(periodDays?: number | null, fallbackRadius?: number | null) {
  if (typeof periodDays === "number" && periodDays > 0) {
    return (2 * Math.PI) / periodDays; // rad/dia virtual
  }
  // Fallback: inverso do raio orbital (em unidades arbitrárias)
  const r = typeof fallbackRadius === "number" && isFinite(fallbackRadius) ? fallbackRadius : 1;
  return (2 * Math.PI) / (10 + r);
}

// Mapeia temperatura de equilíbrio para uma cor simples (frio→azul, quente→vermelho)
function colorFromTempK(temp?: number | null) {
  if (typeof temp !== "number" || !isFinite(temp)) return new THREE.Color("#9aa4ad");
  const t = THREE.MathUtils.clamp((temp - 200) / 1800, 0, 1); // ~200K..2000K
  const cold = new THREE.Color("#6ea8ff");
  const hot = new THREE.Color("#ff6b6b");
  return cold.lerp(hot, t);
}

// =============================
// PlanetMesh (deriva todos os visuais a partir da API)
// =============================
interface PlanetMeshProps {
  planet: Planet;
  scaleOrbit: (v?: number | null) => number;
  scaleRadius: (v?: number | null) => number;
  speedMultiplier: number; // multiplicador global
  isPaused: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: () => void;
  isDimmed?: boolean;
  isSelected?: boolean;
}

const PlanetMesh = ({
  planet,
  scaleOrbit,
  scaleRadius,
  speedMultiplier,
  isPaused,
  showOrbits,
  showLabels,
  onSelect,
  isDimmed = false,
  isSelected = false,
}: PlanetMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);

  const rOrbit = scaleOrbit(planet.semi_major_axis);
  const rPlanet = scaleRadius(planet.radius_earth);
  const omega = omegaFromPeriodDays(planet.orbital_period_days, planet.semi_major_axis);

  const baseColor = colorFromTempK(planet.equilibrium_tempk);
  const dimmedColor = baseColor.clone().lerp(new THREE.Color("#222222"), 0.6);
  const materialColor = isDimmed ? dimmedColor : baseColor;
  const emissiveIntensity = isDimmed ? 0.05 : 0.3;
  const opacity = isDimmed ? 0.35 : 1.0;
  const orbitOpacity = isDimmed ? 0.12 : 0.3;
  const labelOpacity = isDimmed ? 0.6 : 1.0;

  useFrame((_, delta) => {
    if (!isPaused) {
      angleRef.current += omega * delta * speedMultiplier * 2; // fator 2 para dar mais "vida"
    }
    if (groupRef.current) {
      const x = rOrbit * Math.cos(angleRef.current);
      const z = rOrbit * Math.sin(angleRef.current);
      // Mantemos o grupo posicionado na órbita; o planeta fica no centro do group
      groupRef.current.position.set(x, 0, z);
    }
  });

  return (
    <group>
      {/* Órbita fixa no plano XY */}
      {showOrbits && (
        <mesh rotation={[Math.PI / 2, 0, 0]}> 
          <ringGeometry args={[rOrbit - 0.02, rOrbit + 0.02, 64]} />
          <meshBasicMaterial color="#444444" side={THREE.DoubleSide} transparent opacity={orbitOpacity} />
        </mesh>
      )}

      {/* Grupo que percorre a órbita */}
      <group ref={groupRef}>
        <mesh onClick={onSelect}>
          <sphereGeometry args={[Math.max(0.05, rPlanet), 32, 32]} />
          <meshStandardMaterial
            color={materialColor}
            emissive={materialColor}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={opacity}
            depthWrite={!isDimmed}
          />
        </mesh>

        {showLabels && (
          <Text position={[0, Math.max(0.05, rPlanet) + 0.3, 0]} fontSize={0.15} color={`rgba(255,255,255,${labelOpacity})`} anchorX="center" anchorY="middle">
            {planet.name ?? `Planet ${planet.id}`}
          </Text>
        )}
      </group>
    </group>
  );
};

// =============================
// PlanetCanvas (API-only)
// =============================
interface PlanetCanvasProps {
  system: PlanetarySystem | null;
  animationSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  isPaused: boolean;
  onSelectPlanet: (planet: Planet) => void;
  selectedPlanet: Planet | null;
}

export const PlanetCanvas = ({
  system,
  animationSpeed,
  showOrbits,
  showLabels,
  isPaused,
  onSelectPlanet,
  selectedPlanet,
}: PlanetCanvasProps) => {
  const planets = system?.planets ?? [];

  // Escalas a partir da API
  const scaleOrbit = useMemo(() => normalize(planets.map((p) => p.semi_major_axis), 1.2, 6.5), [planets]);
  const scaleRadius = useMemo(() => normalize(planets.map((p) => p.radius_earth), 0.08, 0.35), [planets]);

  return (
    <div className="w-full h-full bg-background">
      <Canvas camera={{ position: [0, 8, 9], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffd700" />

        <Starfield count={1500} pulseSpeed={0.25} pulseAmplitude={0.35} baseSize={0.06} baseOpacity={0.85} />

        {/* Estrela Central */}
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={2} />
        </mesh>

        {planets.map((planet) => {
          const isSelected = !!selectedPlanet && planet.id === selectedPlanet.id;
          const isDimmed = !!selectedPlanet && planet.id !== selectedPlanet.id;

          return (
            <PlanetMesh
              key={planet.id}
              planet={planet}
              scaleOrbit={scaleOrbit}
              scaleRadius={scaleRadius}
              speedMultiplier={isPaused ? 0 : animationSpeed}
              isPaused={isPaused}
              showOrbits={showOrbits}
              showLabels={showLabels}
              onSelect={() => onSelectPlanet(planet)}
              isDimmed={isDimmed}
              isSelected={isSelected}
            />
          );
        })}

        <OrbitControls enablePan={false} minDistance={5} maxDistance={20} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
};

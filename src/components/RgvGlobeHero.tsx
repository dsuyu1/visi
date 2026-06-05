"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export function RgvGlobeHero({
  lat = 26.2034,
  lng = -98.2300,
  label = "Rio Grande Valley",
}: {
  lat?: number;
  lng?: number;
  label?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.DirectionalLight(0x60a5fa, 1.1);
    key.position.set(6, 3, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x22c55e, 0.35);
    rim.position.set(-6, -2, -8);
    scene.add(rim);

    const radius = 2.45;
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 56, 56),
      new THREE.MeshStandardMaterial({
        color: 0x070a11,
        roughness: 0.92,
        metalness: 0.08,
        emissive: 0x05070c,
        emissiveIntensity: 0.65,
      })
    );
    group.add(globe);

    const atmos = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.03, 56, 56),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    group.add(atmos);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 22 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({
        color: 0xe2e8f0,
        size: 0.022,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    scene.add(stars);

    const markerPos = latLngToVec3(lat, lng, radius * 1.005);
    const marker = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.07, 0),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    marker.position.copy(markerPos);
    group.add(marker);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.10, 0.17, 48),
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.position.copy(markerPos.clone().multiplyScalar(1.001));
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(ring);

    const beamHeight = 0.55;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, beamHeight, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    const beamDir = markerPos.clone().normalize();
    beam.position.copy(markerPos.clone().add(beamDir.clone().multiplyScalar(beamHeight / 2)));
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamDir);
    group.add(beam);

    const baseQuat = new THREE.Quaternion().setFromUnitVectors(
      markerPos.clone().normalize(),
      new THREE.Vector3(0, 0, 1)
    );
    group.quaternion.copy(baseQuat);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = performance.now();

      group.quaternion.copy(baseQuat);
      group.quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(t * 0.00022) * 0.14)
      );
      group.quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin(t * 0.00018) * 0.06)
      );

      stars.rotation.y += 0.00025;
      stars.rotation.x += 0.00005;

      const pulse = 0.45 + Math.sin(t * 0.004) * 0.08;
      (ring.material as THREE.MeshBasicMaterial).opacity = pulse;
      (beam.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      starsGeo.dispose();
      (stars.material as THREE.Material).dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh.material ?? null) as THREE.Material | THREE.Material[] | null;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [lat, lng]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute left-4 bottom-4 rounded-full border border-border bg-background/55 px-3 py-1 text-xs font-mono text-muted backdrop-blur">
        {label}
      </div>
    </div>
  );
}


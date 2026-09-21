'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Sparkles, RotateCw, ZoomIn, ZoomOut, Check, ArrowRight, Camera, Smartphone, QrCode } from 'lucide-react';
import { ProductDto } from '@/types/menu';

interface ArModelViewerProps {
  product: ProductDto;
  onClose: () => void;
  onProceedToCustomize: () => void;
}

export default function ArModelViewer({
  product,
  onClose,
  onProceedToCustomize,
}: ArModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchAr = () => {
    if (!product.arModelUrl) return;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    const fullModelUrl = product.arModelUrl.startsWith('http')
      ? product.arModelUrl
      : `${window.location.origin}${product.arModelUrl}`;

    // Track AR interaction telemetry
    fetch('/api/public/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'AR_INTERACT',
        productId: product.id,
        metadata: { platform: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop' },
      }),
    }).catch(() => {});

    if (isAndroid) {
      // Launch Google Scene Viewer native AR on Android with ARCore
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
        fullModelUrl
      )}&mode=ar_preferred&title=${encodeURIComponent(
        product.name
      )}&resizable=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
        window.location.href
      )};end;`;

      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      // Launch Apple QuickLook on iOS
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', fullModelUrl);
      const img = document.createElement('img');
      anchor.appendChild(img);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    // On Desktop or unsupported devices, show QR code modal to scan with phone
    setShowQrModal(true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Three.js Scene, Camera, Renderer
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF9F6F0); // Warm porcelain background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
    } catch (e: any) {
      console.warn('WebGL init error', e);
      setError('3D hardware acceleration is unavailable on this device.');
      setLoading(false);
      return;
    }

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFAF0, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE0D0C0, 0.8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // Load or generate 3D Food Geometry
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const isCoffee = product.name.toLowerCase().includes('espresso') || product.name.toLowerCase().includes('white') || product.name.toLowerCase().includes('brew');

    if (isCoffee) {
      // 1. Ceramic Cup
      const cupGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.0, 32, 1, true);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xFAF7F2,
        roughness: 0.15,
        metalness: 0.05,
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      modelGroup.add(cup);

      // Base
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
      const base = new THREE.Mesh(baseGeo, cupMat);
      base.position.y = -0.5;
      modelGroup.add(base);

      // Coffee Liquid
      const liquidGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.02, 32);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: 0x2A1810,
        roughness: 0.1,
        metalness: 0.15,
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = 0.35;
      modelGroup.add(liquid);

      // Latte Foam Heart/Ring
      const foamGeo = new THREE.RingGeometry(0.15, 0.45, 32);
      const foamMat = new THREE.MeshStandardMaterial({
        color: 0xE8D7C3,
        roughness: 0.7,
      });
      const foam = new THREE.Mesh(foamGeo, foamMat);
      foam.rotation.x = -Math.PI / 2;
      foam.position.y = 0.365;
      modelGroup.add(foam);

      // Handle
      const handleGeo = new THREE.TorusGeometry(0.3, 0.07, 16, 32, Math.PI);
      const handle = new THREE.Mesh(handleGeo, cupMat);
      handle.position.set(0.7, 0, 0);
      handle.rotation.z = -Math.PI / 2;
      modelGroup.add(handle);

      // Saucer
      const saucerGeo = new THREE.CylinderGeometry(1.15, 0.9, 0.08, 32);
      const saucer = new THREE.Mesh(saucerGeo, cupMat);
      saucer.position.y = -0.55;
      modelGroup.add(saucer);
    } else {
      // Golden Croissant / Pastry
      const pastryMat = new THREE.MeshStandardMaterial({
        color: 0xC88334,
        roughness: 0.55,
        metalness: 0.05,
      });

      const centerGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.1, 24);
      centerGeo.rotateZ(Math.PI / 2);
      const center = new THREE.Mesh(centerGeo, pastryMat);
      modelGroup.add(center);

      const leftGeo = new THREE.ConeGeometry(0.4, 0.8, 20);
      leftGeo.rotateZ(Math.PI / 2.3);
      const leftTip = new THREE.Mesh(leftGeo, pastryMat);
      leftTip.position.set(-0.75, -0.1, 0.25);
      modelGroup.add(leftTip);

      const rightGeo = new THREE.ConeGeometry(0.4, 0.8, 20);
      rightGeo.rotateZ(-Math.PI / 2.3);
      const rightTip = new THREE.Mesh(rightGeo, pastryMat);
      rightTip.position.set(0.75, -0.1, 0.25);
      modelGroup.add(rightTip);
    }

    setLoading(false);

    // Orbit Controls via Mouse / Touch
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x = Math.max(-0.6, Math.min(0.8, modelGroup.rotation.x + deltaY * 0.01));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    domElement.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      domElement.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [product, autoRotate]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 17, 12, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FAF7F2',
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary-terracotta)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-espresso)', display: 'block' }}>
                3D Interactive View
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Drag to rotate 360° • Pinch to zoom
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D Canvas Viewport */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '340px',
            position: 'relative',
            backgroundColor: '#F9F6F0',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
              }}
            >
              Loading 3D asset...
            </div>
          )}

          {error && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Canvas Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              gap: '0.4rem',
            }}
          >
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
              }}
            >
              <RotateCw size={12} />
              <span>{autoRotate ? 'Pause Rotation' : 'Auto Rotate'}</span>
            </button>
          </div>
        </div>

        {/* Footer: Product summary & Next Action */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-espresso)' }}>
                {product.name}
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Base Price: ₹{product.price.toFixed(2)}
              </span>
            </div>

            {/* Launch Native AR Camera on Mobile */}
            <button
              type="button"
              onClick={handleLaunchAr}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'var(--primary-espresso)',
                color: '#FAF7F2',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Camera size={15} color="#EBB682" />
              <span>Place on Table (AR)</span>
            </button>
          </div>

          {/* Action button preserving flow: QR -> Menu -> Product -> View in AR -> Customize -> Add to Cart -> Order */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onProceedToCustomize();
            }}
            style={{ width: '100%', padding: '0.8rem' }}
          >
            <span>Customize Recipe &amp; Add to Cart</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop / Laptop Fallback QR Modal */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '380px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary-espresso)',
              }}
            >
              <Smartphone size={24} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-espresso)', marginBottom: '0.5rem' }}>
              View in AR on Your Phone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Live Camera Augmented Reality requires a mobile device with ARCore (Android) or ARKit (iPhone).
            </p>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                color: 'var(--primary-espresso)',
                wordBreak: 'break-all',
              }}
            >
              Open this menu on your phone:
              <br />
              <strong>{typeof window !== 'undefined' ? window.location.href : ''}</strong>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowQrModal(false)}
              style={{ width: '100%' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

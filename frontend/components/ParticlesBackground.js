// components/ParticlesBackground.js
import React from 'react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

const ParticlesBackground = () => {
  const particlesInit = async (main) => {
    // 初始化 tsParticles 实例
    await loadFull(main);
  };

  const particlesLoaded = (container) => {
    // 可选：在粒子加载完成后执行
    // console.log(container);
  };

  return (
    <Particles
      id="particles-js"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: '#041633',
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: true, mode: 'push' },
            onHover: { enable: true, mode: 'repulse' },
            resize: true,
          },
          modes: {
            push: { quantity: 4 },
            repulse: { distance: 200, duration: 0.4 },
          },
        },
        particles: {
          color: { value: '#ffffff' },
          links: {
            color: '#00a8ff',
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          collisions: { enable: false },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'out' },
            random: false,
            speed: 2,
            straight: false,
          },
          number: { density: { enable: true, area: 800 }, value: 80 },
          opacity: { value: 0.5 },
          shape: { type: 'circle' },
          size: { value: { min: 1, max: 3 }, random: true },
        },
        detectRetina: true,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default ParticlesBackground;

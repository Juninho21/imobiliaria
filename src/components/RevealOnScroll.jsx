import React, { useEffect, useRef, useState } from 'react';

const RevealOnScroll = ({ children, className = '', direction = 'up', delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        // Large elements on mobile need a smaller threshold to trigger
        const threshold = isMobile ? 0.1 : 0.3;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Trigger once
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const getTransform = (dir) => {
        switch (dir) {
            case 'up': return 'translate3d(0, 60px, 0)';
            case 'down': return 'translate3d(0, -60px, 0)';
            case 'left': return 'translate3d(-60px, 0, 0)';
            case 'right': return 'translate3d(60px, 0, 0)';
            default: return 'translate3d(0, 60px, 0)';
        }
    };

    const style = {
        transitionDuration: '2500ms',
        transitionDelay: `${delay}ms`,
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.5, 0, 0, 1)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : getTransform(direction),
        willChange: 'opacity, transform'
    };

    return (
        <div
            ref={ref}
            className={className}
            style={style}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;

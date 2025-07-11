"use client";

import { useEffect, useRef } from "react";

const TrailContainer = () => {
    const trailContainerRef = useRef(null);

    const trailContainerRefLocal = useRef(null);

    const animationStateRef = useRef(null);
    const trailRef = useRef([]);
    const currentImageIndexRef = useRef(0);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const interpolatedMousePosRef = useRef({ x: 0, y: 0 });
    const isDesktopRef = useRef(false);

    useEffect(() => {
        trailContainerRefLocal.current = trailContainerRef.current;

        const config = {
            imageLifespan: 1000,
            mouseThreshold: 100,
            inDuration: 750,
            outDuration: 1000,
            staggerIn: 100,
            staggerOut: 25,
            slideDuration: 1000,
            slideEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            easing: "cubic-bezier(0.87, 0, 0.13, 1)",
        };

        const trialImageCount = 20;
        const images = Array.from({ length: trialImageCount }, (_, i) => `/images/items/img${i + 1}.jpg`);

        //console.log(images);

        trailContainerRefLocal.current = trailContainerRef.current;
        if (!trailContainerRefLocal.current) return;

        isDesktopRef.current = window.innerWidth > 1000;

        const MathUtils = {
            lerp: (a, b, n) => (1 - n) * a + n * b,
            distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        };

        const getMouseDistance = () =>
            MathUtils.distance(
                mousePosRef.current.x,
                mousePosRef.current.y,
                lastMousePosRef.current.x,
                lastMousePosRef.current.y
            );

        const isInTrailContainer = (x, y) => {
            const rect = trailContainerRefLocal.current.getBoundingClientRect();

            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        };

        const createTrailImage = () => {
            //console.log("Creating trail image...");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("trail-img");

            const index = currentImageIndexRef.current || 0;
            const imgSrc = images[index] || images[0]; // fallback
            console.log(images[0]);
            currentImageIndexRef.current = (index + 1) % trialImageCount;

            const rect = trailContainerRefLocal.current.getBoundingClientRect();
            const startX = interpolatedMousePosRef.current.x - rect.left - 87.5;
            const startY = interpolatedMousePosRef.current.y - rect.top - 87.5;
            const targetX = mousePosRef.current.x - rect.left - 87.5;
            const targetY = mousePosRef.current.y - rect.top - 87.5;

            imgContainer.style.left = `${startX}px`;
            imgContainer.style.top = `${startY}px`;
            imgContainer.style.transition = `
              left ${config.slideDuration}ms ${config.slideEasing},
              top ${config.slideDuration}ms ${config.slideEasing}
            `;

            const maskLayers = [];
            const imageLayers = [];

            for (let i = 0; i < 10; i++) {
                const layer = document.createElement("div");
                layer.classList.add("mask-layer");

                const imageLayer = document.createElement("div");
                imageLayer.classList.add("image-layer");
                imageLayer.style.backgroundImage = `url(${imgSrc})`;

                const startY = i * 10;
                const endY = (i + 1) * 10;

                layer.style.clipPath = `polygon(50% ${startY}%, 50% ${startY}%, 50% ${endY}%, 50% ${endY}%)`;
                layer.style.transition = `clip-path ${config.inDuration}ms ${config.easing}`;
                layer.style.transform = "translateZ(0)";
                layer.style.backfaceVisibility = "hidden";

                layer.appendChild(imageLayer);
                imgContainer.appendChild(layer);
                maskLayers.push(layer);
                imageLayers.push(imageLayer);
            }

            trailContainerRefLocal.current.appendChild(imgContainer);

            requestAnimationFrame(() => {
                imgContainer.style.left = `${targetX}px`;
                imgContainer.style.top = `${targetY}px`;

                maskLayers.forEach((layer, i) => {
                    const startY = i * 10;
                    const endY = (i + 1) * 10;
                    const distanceFromMiddle = Math.abs(i - 4.5);
                    const delay = distanceFromMiddle * config.staggerIn;

                    setTimeout(() => {
                        layer.style.clipPath = `
                            polygon(0% ${startY}%, 100% ${startY}%, 100% ${endY}%, 0% ${endY}%)
                        `;
                    }, delay);
                });
            });

            trailRef.current.push({
                element: imgContainer,
                maskLayers: maskLayers,
                imageLayers: imageLayers,
                removeTime: Date.now() + config.imageLifespan,
            });
        };

        const removeOldImages = () => {
            const now = Date.now();
            if (trailRef.current.length === 0) return;

            const oldestImage = trailRef.current[0];
            if (now >= oldestImage.removeTime) {
                const imgToRemove = trailRef.current.shift();

                imgToRemove.maskLayers.forEach((layer, i) => {
                    const startY = i * 10;
                    const endY = (i + 1) * 10;
                    const distanceFromEdge = 4.5 - Math.abs(i - 4.5);
                    const delay = distanceFromEdge * config.staggerOut;

                    layer.style.transition = `clip-path ${config.outDuration}ms ${config.easing}`;

                    setTimeout(() => {
                        layer.style.clipPath = `
                            polygon(50% ${startY}%, 50% ${startY}%, 50% ${endY}%, 50% ${endY}%)
                        `;
                    }, delay);
                });

                imgToRemove.imageLayers.forEach((imageLayer) => {
                    imageLayer.style.transition = `
                        opacity ${config.outDuration}ms ${config.easing}
                    `;

                    imageLayer.style.opacity = "0.25";
                });

                setTimeout(() => {
                    if (imgToRemove.element.parentNode) {
                        imgToRemove.element.parentNode.removeChild(imgToRemove.element);
                    }
                }, config.outDuration + 100);
            }
        };

        const render = () => {
            if (!isDesktopRef.current) {
                //console.log("Not desktop");
                return;
            }

            const distance = getMouseDistance();
            //console.log("Mouse distance:", distance);

            if (!interpolatedMousePosRef.current.x) {
                interpolatedMousePosRef.current.x = mousePosRef.current.x;
                interpolatedMousePosRef.current.y = mousePosRef.current.y;
            }

            interpolatedMousePosRef.current.x = MathUtils.lerp(
                interpolatedMousePosRef.current.x,
                mousePosRef.current.x,
                0.1
            );

            interpolatedMousePosRef.current.y = MathUtils.lerp(
                interpolatedMousePosRef.current.y,
                mousePosRef.current.y,
                0.1
            );

            //console.log("Interpolated mouse:", interpolatedMousePosRef.current);
            //console.log("Last mouse:", lastMousePosRef.current);

            const inside = isInTrailContainer(mousePosRef.current.x, mousePosRef.current.y);
            //console.log("Inside trailContainer?", inside);

            if (distance > config.mouseThreshold && inside) {
                //console.log(">> Creating trail image!");
                createTrailImage();
                lastMousePosRef.current = { ...mousePosRef.current };
            }

            removeOldImages();
            animationStateRef.current = requestAnimationFrame(render);
        };

        const startAnimation = () => {
            if (!isDesktopRef.current) return;

            const handleMouseMove = (e) => {
                mousePosRef.current = { x: e.clientX, y: e.clientY };
            };

            document.addEventListener("mousemove", handleMouseMove);
            animationStateRef.current = requestAnimationFrame(render);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
            };
        };

        const stopAnimation = () => {
            if (animationStateRef.current) {
                cancelAnimationFrame(animationStateRef.current);
                animationStateRef.current = null;
            }

            trailRef.current.forEach((item) => {
                if (item.element.parentNode) {
                    item.element.parentNode.removeChild(item.element);
                }
            });
            trailRef.current.length = 0;
        };

        const handleResize = () => {
            const wasDesktop = isDesktopRef.current;
            isDesktopRef.current = window.innerWidth > 1000;

            if (isDesktopRef.current && !wasDesktop) {
                cleanupMouseListener = startAnimation();
            } else if (!isDesktopRef.current && wasDesktop) {
                stopAnimation();

                if (cleanupMouseListener) {
                    cleanupMouseListener();
                }
            }
        };

        let cleanupMouseListener = null;

        window.addEventListener("resize", handleResize);

        if (isDesktopRef.current) {
            cleanupMouseListener = startAnimation();
        }

        return () => {
            stopAnimation();

            if (cleanupMouseListener) {
                cleanupMouseListener();
            }

            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <div className="trail-container" ref={trailContainerRef}></div>;
};

export default TrailContainer;

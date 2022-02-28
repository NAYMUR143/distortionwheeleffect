// import curtain cdn
import {
  Curtains,
  Plane,
  ShaderPass,
  Vec3,
} from "https://cdn.jsdelivr.net/npm/curtainsjs@7.2.0/src/index.mjs";
window.addEventListener("load", () => {
  // add curtains ,rotation and touch
  const curtains = new Curtains({
    container: "canvas",
    antialias: false,
    premultipliedAlpha: true,
    pixelRatio: Math.min(1.5, window.devicePixelRatio),
  });

  let rotationEffect = 0;

  let touch = {
    y: 0,
    lastY: 0,
  };

  // handle wheel event
  window.addEventListener("wheel", (e) => {
    // normalize wheel event
    const delta =
      window.navigator.userAgent.indexOf("Firefox") !== -1
        ? e.deltaY
        : e.deltaY / 100;

    rotationEffect += delta;
  });
  // move the wheel when you move your cursor
  window.addEventListener("mousemove", (e) => {
    touch.lastY = touch.y;

    if (e.targetTouches) {
      touch.y = e.targetTouches[0].clientY;
    } else {
      touch.y = e.clientY;
    }

    rotationEffect += touch.lastY - touch.y;
  });
  // add the wheel and cursor move animation here
  curtains.onRender(() => {
    rotationEffect = curtains.lerp(rotationEffect, 0.5, 0.8);
    // rotationeffect can wheel the image and also control the wheel speed
  });

  // create planeElements
  const planes = [];

  const planeElements = document.getElementsByClassName("plane");

  for (let i = 0; i < planeElements.length; i++) {
    const plane = new Plane(curtains, planeElements[i], {
      vertexShader: vs,
      fragmentShader: fs,
    });

    if (plane) {
      planes.push(plane);

      handlePlanes(i);
    }
  }
  // Transform plan and add it to the handlePlane function
  function setPlaneTransformOrigin(plane) {
    const curtainsBoundingRect = curtains.getBoundingRect();
    if (curtainsBoundingRect.width >= curtainsBoundingRect.height) {
      plane.setTransformOrigin(new Vec3(-0.4, 0.5, 1)); //wheel changer to slider
    } else {
      plane.setTransformOrigin(new Vec3(-0.5, 1, 0));
    }
  }
  // handle all the planes
  function handlePlanes(index) {
    const plane = planes[index];
    setPlaneTransformOrigin(plane);
    plane.setRotation(
      new Vec3(0, 0, (index / planeElements.length) * Math.PI * 2)
    );

    plane
      .onReady(() => {})
      .onRender(() => {
        plane.setRotation(
          new Vec3(0, 0, plane.rotation.z + rotationEffect / 250)
          // control the rotaion speed
        );
      })
      .onAfterResize(() => {
        setPlaneTransformOrigin(plane);
      });
  }

  // create shader
  const shaderPassParams = {
    fragmentShader: rotationFs,
    uniforms: {
      rotationEffect: {
        name: "uRotationEffect",
        type: "1f",
        value: 0,
      },
    },
  };

  const shaderPass = new ShaderPass(curtains, shaderPassParams);
  shaderPass.onRender(() => {
    shaderPass.uniforms.rotationEffect.value = rotationEffect;
  });
});

/**
 * 박희주 포트폴리오 스크립트
 * - Works 슬라이더 제어 (이전/다음, 인디케이터, 카운터, 터치 스와이프)
 * - 전체 화면 영상형 모션 뷰어 제어:
 *   1) 3D 모델링: 대형 맞춤 뷰 + 눈내리는 효과 (Snow Canvas)
 *   2) UX 디자인: 5개 화면을 천천히 훑어보는 시네마틱 트래킹 샷 모션
 * - 네비게이션 활성 상태 동기화
 */

document.addEventListener('DOMContentLoaded', () => {
  // 작품 데이터 목록
  const worksData = [
    {
      index: 0,
      title: '3D 모델링',
      src: 'model-3d.png',
      motion: 'vertical',
      number: '작품 01',
      snow: true // 3D 모델링 감상 시 눈내리는 효과 활성화
    },
    {
      index: 1,
      title: 'UX 디자인',
      src: 'ux-design.png',
      motion: 'horizontal',
      number: '작품 02',
      snow: false
    }
  ];

  let currentSlideIndex = 0;
  let isModalOpen = false;
  let isMotionPaused = false;

  // DOM 요소 참조 - 슬라이더
  const sliderTrack = document.getElementById('sliderTrack');
  const slideItems = document.querySelectorAll('.slide-item');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicatorDots = document.querySelectorAll('.indicator-dot');
  const workTriggers = document.querySelectorAll('.work-view-trigger');
  const sliderContainer = document.getElementById('sliderContainer');

  // DOM 요소 참조 - 모달
  const motionModal = document.getElementById('motionModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalImage = document.getElementById('modalImage');
  const motionViewport = document.getElementById('motionViewport');
  const modalToggleMotion = document.getElementById('modalToggleMotion');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');
  const modalClose = document.getElementById('modalClose');
  const snowCanvas = document.getElementById('snowCanvas');

  // 네비게이션 링크
  const navLinks = document.querySelectorAll('.nav-link');

  /* --------------------------------------------------------------------------
     1. 눈내리는 효과 (Snow Canvas - 3D 모델링용)
     -------------------------------------------------------------------------- */
  const snowCtx = snowCanvas ? snowCanvas.getContext('2d') : null;
  let snowAnimationId = null;
  let snowflakes = [];
  const SNOWFLAKE_COUNT = 80;

  function resizeSnowCanvas() {
    if (!snowCanvas) return;
    snowCanvas.width = snowCanvas.offsetWidth;
    snowCanvas.height = snowCanvas.offsetHeight;
  }

  function initSnowflakes() {
    snowflakes = [];
    const width = snowCanvas.width || window.innerWidth;
    const height = snowCanvas.height || window.innerHeight;
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        density: Math.random() * SNOWFLAKE_COUNT,
        speedY: Math.random() * 0.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.45 + 0.4
      });
    }
  }

  function renderSnow() {
    if (!snowCtx || !isModalOpen) return;
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    const width = snowCanvas.width;
    const height = snowCanvas.height;

    for (let i = 0; i < snowflakes.length; i++) {
      const flake = snowflakes[i];

      snowCtx.beginPath();
      snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      snowCtx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
      snowCtx.fill();

      if (!isMotionPaused) {
        flake.y += flake.speedY;
        flake.x += Math.sin(flake.density) * 0.35 + flake.speedX;
        flake.density += 0.015;

        if (flake.y > height) {
          flake.y = -6;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 6) {
          flake.x = -6;
        } else if (flake.x < -6) {
          flake.x = width + 6;
        }
      }
    }

    snowAnimationId = requestAnimationFrame(renderSnow);
  }

  function startSnow() {
    if (!snowCanvas) return;
    snowCanvas.classList.add('active');
    resizeSnowCanvas();
    if (snowflakes.length === 0) {
      initSnowflakes();
    }
    if (!snowAnimationId) {
      snowAnimationId = requestAnimationFrame(renderSnow);
    }
  }

  function stopSnow() {
    if (!snowCanvas) return;
    snowCanvas.classList.remove('active');
    if (snowAnimationId) {
      cancelAnimationFrame(snowAnimationId);
      snowAnimationId = null;
    }
    if (snowCtx) {
      snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    }
  }

  /* --------------------------------------------------------------------------
     2. 슬라이더 기능
     -------------------------------------------------------------------------- */
  function updateSlider(index) {
    if (index < 0) {
      currentSlideIndex = worksData.length - 1;
    } else if (index >= worksData.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    const translateOffset = -(currentSlideIndex * 50);
    sliderTrack.style.transform = `translateX(${translateOffset}%)`;

    slideItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === currentSlideIndex);
    });

    slideCounter.textContent = `0${currentSlideIndex + 1} / 0${worksData.length}`;

    indicatorDots.forEach((dot, idx) => {
      const isActive = idx === currentSlideIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateSlider(currentSlideIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateSlider(currentSlideIndex + 1);
    });
  }

  indicatorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-slide'), 10);
      updateSlider(targetIndex);
    });
  });

  let touchStartX = 0;
  let touchEndX = 0;
  if (sliderContainer) {
    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          updateSlider(currentSlideIndex + 1);
        } else {
          updateSlider(currentSlideIndex - 1);
        }
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     3. 전체 화면 영상형 모션 뷰어 모달 제어
     -------------------------------------------------------------------------- */
  function openMotionModal(index) {
    const work = worksData[index];
    if (!work) return;

    currentSlideIndex = index;
    updateSlider(index);

    modalTitle.textContent = `${work.number} - ${work.title}`;
    modalImage.src = work.src;
    modalImage.alt = `${work.title} 전체 화면 영상형 모션 뷰`;

    // 모션 클래스 적용 (3D 모델링: vertical 대형 플로팅 / UX 디자인: horizontal 시네마틱 트래킹)
    motionViewport.className = `motion-viewport motion-${work.motion}`;

    // 눈내리는 효과 설정 (3D 모델링일 때만 활성화)
    if (work.snow) {
      startSnow();
    } else {
      stopSnow();
    }

    // 모션 초기 재생 상태
    isMotionPaused = false;
    modalToggleMotion.textContent = '일시정지';
    modalToggleMotion.setAttribute('aria-label', '모션 일시정지');

    motionModal.classList.add('open');
    motionModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;

    modalClose.focus();
  }

  function closeMotionModal() {
    motionModal.classList.remove('open');
    motionModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    isModalOpen = false;

    stopSnow();
    motionViewport.classList.remove('paused');
    isMotionPaused = false;

    const currentTrigger = slideItems[currentSlideIndex]?.querySelector('.work-view-trigger');
    if (currentTrigger) {
      currentTrigger.focus();
    }
  }

  function toggleMotionPlay() {
    isMotionPaused = !isMotionPaused;
    motionViewport.classList.toggle('paused', isMotionPaused);

    if (isMotionPaused) {
      modalToggleMotion.textContent = '재생';
      modalToggleMotion.setAttribute('aria-label', '모션 재생');
    } else {
      modalToggleMotion.textContent = '일시정지';
      modalToggleMotion.setAttribute('aria-label', '모션 일시정지');
    }
  }

  workTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const slideItem = e.currentTarget.closest('.slide-item');
      const index = parseInt(slideItem.getAttribute('data-index'), 10);
      openMotionModal(index);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeMotionModal);
  }

  if (modalToggleMotion) {
    modalToggleMotion.addEventListener('click', toggleMotionPlay);
  }

  if (modalPrev) {
    modalPrev.addEventListener('click', () => {
      const prevIndex = (currentSlideIndex - 1 + worksData.length) % worksData.length;
      openMotionModal(prevIndex);
    });
  }

  if (modalNext) {
    modalNext.addEventListener('click', () => {
      const nextIndex = (currentSlideIndex + 1) % worksData.length;
      openMotionModal(nextIndex);
    });
  }

  /* --------------------------------------------------------------------------
     4. 키보드 단축키 지원
     -------------------------------------------------------------------------- */
  window.addEventListener('keydown', (e) => {
    if (isModalOpen) {
      if (e.key === 'Escape') {
        closeMotionModal();
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (currentSlideIndex - 1 + worksData.length) % worksData.length;
        openMotionModal(prevIndex);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentSlideIndex + 1) % worksData.length;
        openMotionModal(nextIndex);
      } else if (e.key === ' ' || e.code === 'Space') {
        if (e.target.tagName !== 'BUTTON') {
          e.preventDefault();
          toggleMotionPlay();
        }
      }
    } else {
      if (document.activeElement.closest('#works')) {
        if (e.key === 'ArrowLeft') {
          updateSlider(currentSlideIndex - 1);
        } else if (e.key === 'ArrowRight') {
          updateSlider(currentSlideIndex + 1);
        }
      }
    }
  });

  /* --------------------------------------------------------------------------
     5. 창 크기 조절 및 네비게이션 동기화
     -------------------------------------------------------------------------- */
  window.addEventListener('resize', () => {
    if (isModalOpen && worksData[currentSlideIndex]?.snow) {
      resizeSnowCanvas();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // 초기 슬라이더 설정
  updateSlider(0);
});

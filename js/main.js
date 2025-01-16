document.addEventListener('DOMContentLoaded', function() {
    // Scroll to Top Function
    window.scrollToTop = function(event) {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Mobile Menu Handling
    const setupMobileMenu = () => {
        const nav = document.querySelector('.nav-links');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const menuIcon = menuBtn.querySelector('img');
        const body = document.body;
        let isMenuOpen = false;

        const toggleMenu = () => {
            isMenuOpen = !isMenuOpen;
            nav.classList.toggle('active');
            menuIcon.src = `assets/icons/${isMenuOpen ? 'close' : 'menu'}.svg`;
            menuBtn.setAttribute('aria-expanded', isMenuOpen);
            body.style.overflow = isMenuOpen ? 'hidden' : '';
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (isMenuOpen && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu();
            }
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMenuOpen) toggleMenu();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                toggleMenu();
            }
        });
    };

    // Download Handling with Fallback
    const setupDownloads = () => {
        const downloadBtn = document.querySelector('.download-btn');
        const progress = document.querySelector('.download-progress');

        if (!downloadBtn) return;

        const handleSimpleDownload = () => {
            const link = document.createElement('a');
            link.href = 'releases/mac/shizen.dmg';
            link.download = 'SHIZEN.dmg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const handleProgressDownload = async () => {
            try {
                downloadBtn.textContent = 'Starting download...';
                downloadBtn.disabled = true;

                const response = await fetch('releases/mac/shizen.dmg');
                if (!response.ok) throw new Error('Download failed');

                const contentLength = response.headers.get('Content-Length');
                if (!contentLength) throw new Error('Content length not available');

                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    const percentComplete = (receivedLength / contentLength) * 100;
                    progress.style.width = `${percentComplete}%`;
                }

                const blob = new Blob(chunks);
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'SHIZEN.dmg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(downloadUrl);
                return true;
            } catch (error) {
                console.error('Progress download failed:', error);
                return false;
            }
        };

        downloadBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                const progressSuccess = await handleProgressDownload();
                if (!progressSuccess) {
                    handleSimpleDownload();
                }
            } catch (error) {
                console.error('Download failed:', error);
                handleSimpleDownload();
            } finally {
                progress.style.width = '0';
                downloadBtn.textContent = 'Download for Mac';
                downloadBtn.disabled = false;
            }
        });
    };

    // Smooth Scroll
    const setupSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // Header Scroll Behavior
    const setupHeaderScroll = () => {
        const header = document.querySelector('.header');
        let lastScroll = 0;
        const scrollThreshold = 5;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            header.classList.toggle('scrolled', currentScroll > 0);
            
            if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;
            
            if (currentScroll <= 0) {
                header.classList.remove('scrolled-up', 'scrolled-down');
            } else if (currentScroll > lastScroll && !header.classList.contains('scrolled-down')) {
                header.classList.remove('scrolled-up');
                header.classList.add('scrolled-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scrolled-down')) {
                header.classList.remove('scrolled-down');
                header.classList.add('scrolled-up');
            }
            
            lastScroll = currentScroll;
        });
    };

    // Intersection Observer for Animations
    const setupIntersectionObserver = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.features-card, .roadmap-card, .tech-items span, .support-card')
            .forEach(el => observer.observe(el));
    };

    // Video Handling
    const setupVideo = () => {
        const video = document.querySelector('#demoVideo');
        if (video) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            video.parentElement.appendChild(spinner);

            const toggleSpinner = (show) => {
                spinner.style.display = show ? 'block' : 'none';
            };

            video.addEventListener('loadstart', () => toggleSpinner(true));
            video.addEventListener('canplay', () => toggleSpinner(false));
            video.addEventListener('waiting', () => toggleSpinner(true));
            video.addEventListener('playing', () => toggleSpinner(false));
            video.addEventListener('error', () => {
                toggleSpinner(false);
                video.parentElement.innerHTML = '<p class="video-error">Video failed to load</p>';
            });
        }
    };

    // Resize Handler
    const setupResizeHandler = () => {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    const nav = document.querySelector('.nav-links');
                    const menuBtn = document.querySelector('.mobile-menu-btn');
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        menuBtn.querySelector('img').src = 'assets/icons/menu.svg';
                        menuBtn.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }
            }, 250);
        });
    };

    // Initialize all functionality
    setupMobileMenu();
    setupDownloads();
    setupSmoothScroll();
    setupHeaderScroll();
    setupIntersectionObserver();
    setupVideo();
    setupResizeHandler();
});
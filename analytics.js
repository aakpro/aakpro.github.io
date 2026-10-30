/**
 * Amir Kashani — Portfolio & Resume Analytics
 * Unified tracking for Google Analytics 4 (GA4) and PostHog
 */

(function () {
    'use strict';

    // Global Event Dispatcher
    function trackEvent(eventName, properties) {
        properties = properties || {};
        try {
            // 1. Google Analytics 4
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, properties);
            }
            // 2. PostHog (when initialized)
            if (window.posthog && typeof window.posthog.capture === 'function') {
                window.posthog.capture(eventName, properties);
            }
        } catch (err) {
            // Silently fail to never disrupt user experience
        }
    }

    // Expose helper globally
    window.trackResumeEvent = trackEvent;

    // Helper: Determine location of an element in the DOM
    function getElementLocation(element) {
        if (!element) return 'unknown';
        if (element.closest('header.site-header') || element.closest('nav')) return 'nav';
        if (element.closest('header.resume-top') || element.closest('.contact-row')) return 'header_contact';
        if (element.closest('.resume-actions')) return 'action_bar';
        if (element.closest('section.hero')) return 'hero';
        if (element.closest('footer.site-footer')) return 'footer';
        if (element.closest('#experience')) return 'experience_section';
        if (element.closest('#projects-recognition') || element.closest('#work') || element.closest('#ai')) return 'projects_section';
        return 'body';
    }

    // Helper: Simple throttle
    function throttle(fn, wait) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    // Initialize DOM tracking on load
    document.addEventListener('DOMContentLoaded', function () {
        var pagePath = window.location.pathname;

        // 1. Click Tracking (Delegated)
        document.addEventListener('click', function (e) {
            var target = e.target;

            // Check for link clicks
            var link = target.closest('a');
            if (link) {
                var href = link.getAttribute('href') || '';
                var locationName = getElementLocation(link);

                // A. PDF Resume Downloads
                if (href.endsWith('.pdf') || link.hasAttribute('download')) {
                    trackEvent('resume_pdf_download', {
                        file_name: href.split('/').pop() || 'Amir_Kashani_Resume.pdf',
                        page_source: pagePath,
                        link_location: locationName,
                        link_text: link.textContent.trim()
                    });
                    return;
                }

                // B. Contact Clicks (Email)
                if (href.startsWith('mailto:')) {
                    trackEvent('contact_initiated', {
                        link_type: 'email',
                        email: href.replace('mailto:', ''),
                        link_location: locationName,
                        page_source: pagePath
                    });
                    return;
                }

                // C. Outbound Social/Profile Clicks (LinkedIn, GitHub)
                if (href.indexOf('linkedin.com') !== -1) {
                    trackEvent('outbound_profile_click', {
                        destination: 'linkedin',
                        target_url: href,
                        link_location: locationName,
                        page_source: pagePath
                    });
                    return;
                }

                if (href.indexOf('github.com') !== -1) {
                    trackEvent('outbound_profile_click', {
                        destination: 'github',
                        target_url: href,
                        link_location: locationName,
                        page_source: pagePath
                    });
                    return;
                }

                // D. Navigation from Portfolio to Resume
                if (href.indexOf('resume.html') !== -1 && pagePath.indexOf('resume.html') === -1) {
                    trackEvent('portfolio_to_resume_click', {
                        link_location: locationName,
                        link_text: link.textContent.trim()
                    });
                    return;
                }
            }

            // Check for button clicks (Print)
            var button = target.closest('button');
            if (button) {
                var btnText = (button.textContent || '').toLowerCase();
                if (btnText.indexOf('print') !== -1) {
                    trackEvent('resume_print_triggered', {
                        trigger: 'print_button',
                        page_source: pagePath
                    });
                }
            }
        });

        // 2. Browser Print Event (e.g. Cmd+P or File > Print)
        window.addEventListener('beforeprint', function () {
            trackEvent('resume_print_triggered', {
                trigger: 'browser_beforeprint',
                page_source: pagePath
            });
        });

        // 3. Recruiter Dwell Time Milestones (30s, 60s, 120s, 180s)
        var dwellMilestones = [30, 60, 120, 180];
        dwellMilestones.forEach(function (seconds) {
            setTimeout(function () {
                if (!document.hidden) {
                    trackEvent('recruiter_dwell_milestone', {
                        seconds_on_page: seconds,
                        page_source: pagePath
                    });
                    if (seconds === 60) {
                        trackEvent('recruiter_deep_read', {
                            duration: '60s_plus',
                            page_source: pagePath
                        });
                    }
                }
            }, seconds * 1000);
        });

        // 4. Scroll Depth Milestones (25%, 50%, 75%, 100%)
        var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
        function checkScrollDepth() {
            var docElem = document.documentElement;
            var scrollHeight = docElem.scrollHeight - window.innerHeight;
            if (scrollHeight <= 0) return;
            var scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

            [25, 50, 75, 100].forEach(function (milestone) {
                if (scrollPercent >= milestone && !scrollMilestones[milestone]) {
                    scrollMilestones[milestone] = true;
                    trackEvent('scroll_depth_milestone', {
                        percent: milestone,
                        page_source: pagePath
                    });
                }
            });
        }
        window.addEventListener('scroll', throttle(checkScrollDepth, 250), { passive: true });

        // 5. Technical Section Viewport Focus (IntersectionObserver)
        if ('IntersectionObserver' in window) {
            var trackedElements = document.querySelectorAll(
                '#profile, #core-stack, #experience, #experience article, #projects-recognition, #education-academic-languages, #expertise, #work, #ai'
            );

            var viewedSections = new Set();
            var visibilityTimers = new Map();

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var el = entry.target;
                    var sectionId = el.id;

                    // If it's an experience article, get the company name
                    if (el.tagName === 'ARTICLE' && el.closest('#experience')) {
                        var companyEl = el.querySelector('.company');
                        sectionId = companyEl ? 'experience_' + companyEl.textContent.trim().toLowerCase().replace(/\s+/g, '_') : 'experience_entry';
                    }

                    if (!sectionId || viewedSections.has(sectionId)) return;

                    if (entry.isIntersecting) {
                        // Must stay in view for 2 full seconds to count as focused reading
                        var timer = setTimeout(function () {
                            viewedSections.add(sectionId);
                            trackEvent('section_focused', {
                                section: sectionId,
                                page_source: pagePath
                            });
                        }, 2000);
                        visibilityTimers.set(el, timer);
                    } else {
                        if (visibilityTimers.has(el)) {
                            clearTimeout(visibilityTimers.get(el));
                            visibilityTimers.delete(el);
                        }
                    }
                });
            }, { threshold: 0.4 });

            trackedElements.forEach(function (el) {
                observer.observe(el);
            });
        }
    });
})();

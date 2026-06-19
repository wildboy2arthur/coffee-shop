/**
 * AURA CAFÉ - Client-side Interactive Scripts
 */

// 請在此處填入您部署 Google Apps Script 後取得的網頁應用程式 URL
const GAS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. NAVBAR SCROLL EFFECT (導覽列滾動漸變)
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       2. MOBILE NAVIGATION MENU (行動版漢堡選單)
       ========================================================================== */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMobileMenu = () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // 防止選單開啟時，底層網頁還能滾動
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    mobileToggle.addEventListener('click', toggleMobileMenu);

    // 點擊連結時自動關閉行動選單
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    /* ==========================================================================
       3. BOOKING & ORDER TABS (線上訂位與訂購表單切換)
       ========================================================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.booking-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有 active 狀態
            tabBtns.forEach(b => b.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active-form'));

            // 加入當前點擊 active 狀態
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            
            if (targetTab === 'reserve') {
                document.getElementById('reserveForm').classList.add('active-form');
            } else if (targetTab === 'order') {
                document.getElementById('orderForm').classList.add('active-form');
            }
        });
    });

    /* ==========================================================================
       4. QUICK ORDER CONNECTIVITY (單品豆訂購連動)
       ========================================================================== */
    const orderBeanSelect = document.getElementById('orderBean');
    const orderButtons = document.querySelectorAll('.btn-order-bean');

    // 建立一個咖啡豆英文名與 select value 的映射
    const beanValueMap = {
        '巴拿馬翡翠莊園 瑰夏': 'panama-geisha',
        '巴拿馬翡翠莊園 瑰夏 (Geisha)': 'panama-geisha',
        '衣索比亞 耶加雪菲': 'ethiopia-yirgacheffe',
        '牙買加 藍山 No.1': 'jamaica-blue-mountain',
        '印尼 黃金曼特寧': 'indonesia-mandheling'
    };

    orderButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const beanName = btn.getAttribute('data-bean');
            const mappedValue = beanValueMap[beanName];

            // 1. 切換至訂購表單分頁
            tabBtns.forEach(b => {
                if (b.getAttribute('data-tab') === 'order') {
                    b.click();
                }
            });

            // 2. 自動選擇對應咖啡豆項目
            if (mappedValue && orderBeanSelect) {
                orderBeanSelect.value = mappedValue;
            }

            // 3. 滾動至表單區塊
            const bookingSection = document.getElementById('booking');
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ==========================================================================
       5. SPACE GALLERY LIGHTBOX (空間藝廊燈箱)
       ========================================================================== */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-src');
            const imgAlt = item.querySelector('img').getAttribute('alt');
            
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = imgAlt;
            lightboxModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        });
    });

    const closeLightbox = () => {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // 點擊燈箱背景時關閉
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    // ESC 鍵關閉燈箱
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.style.display === 'block') {
            closeLightbox();
        }
    });

    /* ==========================================================================
       6. FORM SUBMISSION & TOAST NOTIFICATION (表單提交與通知)
       ========================================================================== */
    const reserveForm = document.getElementById('reserveForm');
    const orderForm = document.getElementById('orderForm');
    const toast = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    // 設定訂位日期的最小值為今天，避免過去日期預約
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }

    const showToast = (title, message) => {
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    };

    if (reserveForm) {
        reserveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('resName').value;
            const date = document.getElementById('resDate').value;
            const guests = document.getElementById('resGuests');
            const guestsText = guests.options[guests.selectedIndex].text;
            
            const formData = {
                resName: name,
                resPhone: document.getElementById('resPhone').value,
                resGuests: guests.value,
                resDate: date,
                resTime: document.getElementById('resTime').value,
                resPreference: document.getElementById('resPreference').value,
                resNote: document.getElementById('resNote').value
            };
            
            // 提交按鈕 Loading 狀態處理
            const submitBtn = reserveForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            const setSubmitting = (submitting) => {
                if (submitting) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '預約資料傳送中...';
                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            };
            
            if (GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
                // 模擬提交模式
                setSubmitting(true);
                setTimeout(() => {
                    setSubmitting(false);
                    showToast(
                        '預約完成 (模擬)',
                        `尊榮的 ${name} 貴賓您好，已為您模擬保留 ${date} 的 ${guestsText} 席位。設定 GAS_API_URL 可連線至 Google Sheets。`
                    );
                    reserveForm.reset();
                    if (dateInput) {
                        dateInput.value = new Date().toISOString().split('T')[0];
                    }
                }, 1000);
            } else {
                // 真實 POST 提交
                setSubmitting(true);
                
                fetch(GAS_API_URL, {
                    method: 'POST',
                    mode: 'no-cors', // 避免 CORS 發送 preflight，GAS 也能收件
                    body: JSON.stringify(formData),
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                })
                .then(() => {
                    // no-cors 下 fetch 不會報 CORS 錯，直接當成功處理
                    showToast(
                        '預約完成',
                        `尊榮的 ${name} 貴賓您好，已為您保留 ${date} 的 ${guestsText} 席位。確認簡訊將送至您的手機！`
                    );
                    reserveForm.reset();
                    if (dateInput) {
                        dateInput.value = new Date().toISOString().split('T')[0];
                    }
                })
                .catch(err => {
                    console.error('Submit Error:', err);
                    showToast('預約失敗', '傳送失敗，請檢查網路連線或 API 設定。');
                })
                .finally(() => {
                    setSubmitting(false);
                });
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('orderName').value;
            const beanSelect = document.getElementById('orderBean');
            const beanText = beanSelect.options[beanSelect.selectedIndex].text.split(' - ')[0];
            const qty = document.getElementById('orderQty').value;
            
            showToast(
                '訂單已受理',
                `感謝您的訂購！已為 ${name} 訂製 ${qty} 包【${beanText}】。我們將在烘焙密封後，儘速為您直送府上。`
            );
            orderForm.reset();
        });
    }

    /* ==========================================================================
       7. INTERSECTION OBSERVER FOR SCROLL REVEAL (滾動漸顯)
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-on-scroll');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // 顯現後就停止觀察該元件，以提升效能
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null, // viewport
        threshold: 0.15 // 當元件 15% 進入畫面時觸發
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

});

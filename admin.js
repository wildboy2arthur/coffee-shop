/**
 * AURA CAFÉ - Admin Dashboard Interactive Scripts
 */

// 請在此處填入您部署 Google Apps Script 後取得的網頁應用程式 URL
const GAS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. ADMIN LOGIN SYSTEM (安全狀態管理與模擬登入)
       ========================================================================== */
    const loginOverlay = document.getElementById('loginOverlay');
    const adminContent = document.getElementById('adminContent');
    const adminPassword = document.getElementById('adminPassword');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const loginError = document.getElementById('loginError');

    // 安全的狀態存取器，防止 file:// 協議下 localStorage 被瀏覽器禁用拋錯
    let isLoggedInInMemory = false;
    
    const setLoginState = (val) => {
        try {
            localStorage.setItem('aura_admin_logged_in', val ? 'true' : 'false');
        } catch (e) {
            isLoggedInInMemory = val;
            console.warn('localStorage is restricted in this environment. Falling back to in-memory state.');
        }
    };
    
    const getLoginState = () => {
        try {
            return localStorage.getItem('aura_admin_logged_in') === 'true';
        } catch (e) {
            return isLoggedInInMemory;
        }
    };
    
    const removeLoginState = () => {
        try {
            localStorage.removeItem('aura_admin_logged_in');
        } catch (e) {
            isLoggedInInMemory = false;
        }
    };

    // 檢查登入狀態
    const checkLoginStatus = () => {
        if (getLoginState()) {
            loginOverlay.style.display = 'none';
            adminContent.style.display = 'block';
            // 登入成功後直接查詢一次預設日期
            queryReservations();
        } else {
            loginOverlay.style.display = 'flex';
            adminContent.style.display = 'none';
        }
    };

    const handleLogin = () => {
        const password = adminPassword.value.trim();
        if (password === 'aura888') {
            setLoginState(true);
            loginError.style.display = 'none';
            adminPassword.value = '';
            checkLoginStatus();
        } else {
            loginError.style.display = 'block';
            adminPassword.focus();
        }
    };

    // 登入事件與初始化移至檔案底部以防止未定義變數錯誤


    /* ==========================================================================
       2. RESERVATION QUERY SYSTEM (預約資料查詢)
       ========================================================================== */
    const filterDateInput = document.getElementById('filterDate');
    const btnQuery = document.getElementById('btnQuery');
    const btnLoading = document.getElementById('btnLoading');
    const btnText = btnQuery.querySelector('.btn-text');
    const tableBody = document.getElementById('tableBody');
    const tableTitle = document.getElementById('tableTitle');

    // 數據概覽 DOM
    const statGroupCount = document.getElementById('statGroupCount');
    const statGuestCount = document.getElementById('statGuestCount');
    const statPopularTime = document.getElementById('statPopularTime');

    // 預設日期為今天
    const todayStr = new Date().toISOString().split('T')[0];
    filterDateInput.value = todayStr;

    // 模擬的預設展示資料 (當 GAS_API_URL 尚未設定時，隨機產生 2 到 6 筆資料)
    const getMockData = (dateStr) => {
        const lastNames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊'];
        const firstNames = ['冠宇', '雅婷', '俊傑', '美玲', '家豪', '淑芬', '建宏', '麗華', '哲宇', '欣妤'];
        const titles = [' 先生', ' 小姐'];
        const timeSlots = ['morning', 'noon', 'afternoon', 'evening'];
        const preferences = ['bar', 'window', 'sofa'];
        const notes = [
            '希望能近距離看職人沖煮咖啡。',
            '慶生聚會，需要安靜一點的角落。',
            '商務商談用，請安排靠窗安靜位子。',
            '有攜帶嬰兒車，希望能有足夠空間。',
            '今日為結婚紀念日，希望座位視野較佳。',
            '希望有插座可以使用。',
            '第一次慕名而來，期待精品瑰夏咖啡！'
        ];

        // 隨機決定產生 2 至 6 筆資料
        const count = Math.floor(Math.random() * 5) + 2;
        const mockList = [];

        // 為了讓時段排序好看，我們在產生後對時段進行排序
        const slotOrder = { 'morning': 1, 'noon': 2, 'afternoon': 3, 'evening': 4 };

        for (let i = 0; i < count; i++) {
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            
            // 隨機電話
            const randPhone = '09' + String(Math.floor(10000000 + Math.random() * 90000000)).replace(/(\d{4})(\d{4})/, '$1-$2');
            
            // 隨機時段
            const resTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            
            // 隨機人數
            const resGuests = String(Math.floor(Math.random() * 4) + 1); // 1 ~ 4 位
            
            // 隨機喜好
            const resPreference = preferences[Math.floor(Math.random() * preferences.length)];
            
            // 隨機備註 (40% 機率有備註)
            const hasNote = Math.random() < 0.4;
            const resNote = hasNote ? notes[Math.floor(Math.random() * notes.length)] : '';
            
            // 隨機建立時間 (今天之前幾小時)
            const tsDate = new Date();
            tsDate.setHours(tsDate.getHours() - Math.floor(Math.random() * 12) - 1);

            mockList.push({
                resDate: dateStr,
                resTime: resTime,
                resName: lastName + firstName + title,
                resPhone: randPhone,
                resGuests: resGuests,
                resPreference: resPreference,
                resNote: resNote,
                timestamp: tsDate.toISOString()
            });
        }

        // 根據時段順序對資料排序，讓後台看起來更專業
        mockList.sort((a, b) => slotOrder[a.resTime] - slotOrder[b.resTime]);

        return mockList;
    };

    // 格式化時段顯示
    const formatTimeSlot = (slot) => {
        const timeMap = {
            'morning': '上午 (10:00 - 12:00)',
            'noon': '中午 (12:00 - 14:00)',
            'afternoon': '下午 (14:00 - 17:00)',
            'evening': '晚上 (17:00 - 20:00)'
        };
        return timeMap[slot] || slot;
    };

    // 格式化座位顯示
    const formatPreference = (pref) => {
        const prefMap = {
            'bar': '吧台區',
            'window': '靠窗區',
            'sofa': '沙發區'
        };
        return prefMap[pref] || pref;
    };

    // 格式化登記日期時間
    const formatTimestamp = (ts) => {
        if (!ts) return '-';
        try {
            const date = new Date(ts);
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } catch (e) {
            return ts;
        }
    };

    // 核心查詢函數
    function queryReservations() {
        const selectedDate = filterDateInput.value;
        if (!selectedDate) return;

        // 設定 Loading 狀態
        btnQuery.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        tableTitle.textContent = `${selectedDate} 預約清單`;

        // 判斷是否已經填寫 GAS API URL
        if (GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            // 使用模擬資料進行展示
            setTimeout(() => {
                const mockData = getMockData(selectedDate);
                renderTableData(mockData);
                // 提示用戶設定 API
                statPopularTime.innerHTML = `<span style="font-size: 0.9rem; color: #8e7558;">模擬資料 (請部署 GAS API)</span>`;
                resetLoadingState();
            }, 1000);
        } else {
            // 真實 API 串接
            const requestUrl = `${GAS_API_URL}?date=${selectedDate}`;
            
            fetch(requestUrl)
                .then(response => response.json())
                .then(res => {
                    if (res.status === 'success') {
                        renderTableData(res.data);
                    } else {
                        showTableError(res.message || '無法讀取資料');
                    }
                })
                .catch(err => {
                    console.error('API Error:', err);
                    showTableError('網路連線失敗或 API URL 設定錯誤。');
                })
                .finally(() => {
                    resetLoadingState();
                });
        }
    }

    // 渲染資料到表格與統計卡片中
    function renderTableData(data) {
        tableBody.innerHTML = '';

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">本日暫無席位預約。</td>
                </tr>
            `;
            statGroupCount.innerHTML = `0 <small>組</small>`;
            statGuestCount.innerHTML = `0 <small>人</small>`;
            statPopularTime.textContent = '-';
            return;
        }

        // 1. 渲染表格列
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="td-time"><strong>${formatTimeSlot(item.resTime)}</strong></td>
                <td>${item.resName}</td>
                <td>${item.resPhone}</td>
                <td><span class="badge-guests">${item.resGuests} 位</span></td>
                <td>${formatPreference(item.resPreference)}</td>
                <td class="td-note" title="${item.resNote || ''}">${item.resNote || '-'}</td>
                <td class="td-ts">${formatTimestamp(item.timestamp)}</td>
            `;
            tableBody.appendChild(tr);
        });

        // 2. 計算統計數據
        const groupCount = data.length;
        const guestCount = data.reduce((acc, curr) => acc + parseInt(curr.resGuests || 0, 10), 0);
        
        // 計算最熱門時段
        const timeCount = { morning: 0, noon: 0, afternoon: 0, evening: 0 };
        data.forEach(item => {
            if (timeCount[item.resTime] !== undefined) {
                timeCount[item.resTime] += 1;
            }
        });
        
        let popularSlot = '-';
        let maxCount = 0;
        for (const [slot, count] of Object.entries(timeCount)) {
            if (count > maxCount) {
                maxCount = count;
                popularSlot = slot;
            }
        }

        // 3. 更新卡片
        statGroupCount.innerHTML = `${groupCount} <small>組</small>`;
        statGuestCount.innerHTML = `${guestCount} <small>人</small>`;
        statPopularTime.textContent = maxCount > 0 ? formatTimeSlot(popularSlot).split(' (')[0] : '-';
    }

    function showTableError(message) {
        tableBody.innerHTML = `
            <tr class="error-row">
                <td colspan="7" style="color: #ff6b6b; text-align: center; padding: 30px 0;">
                    ⚠️ 讀取失敗: ${message}
                </td>
            </tr>
        `;
        statGroupCount.innerHTML = `E <small>組</small>`;
        statGuestCount.innerHTML = `E <small>人</small>`;
        statPopularTime.textContent = 'ERROR';
    }

    function resetLoadingState() {
        btnQuery.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }

    btnQuery.addEventListener('click', queryReservations);

    // 登入相關事件綁定
    btnLogin.addEventListener('click', handleLogin);
    adminPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    btnLogout.addEventListener('click', () => {
        removeLoginState();
        checkLoginStatus();
    });

    // 初始化登入狀態檢查 (放在所有變數與事件宣告完成後，避免未定義錯誤)
    checkLoginStatus();

});

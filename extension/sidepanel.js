const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const emptyState = document.getElementById('emptyState');
const detectedProductDiv = document.getElementById('detectedProduct');

let detectedProduct = null;
let allProductsCache = [];
let currentDisplayCount = 10;
let pinnedProducts = [];

const FIXED_ICON =
  (typeof chrome !== 'undefined' && chrome.runtime?.getURL)
    ? chrome.runtime.getURL('icons/icon48.png')
    // option B: 파일이 없다면 data URI(샘플 1px 투명 PNG)로 fallback
    : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9bq7C1QAAAAASUVORK5CYII=';


// 페이지 로드 시 저장된 핀 목록 불러오기
loadPinnedProducts();

// 드래그 앤 드롭 이벤트 설정
setupDragAndDrop();

// 아코디언 토글 함수
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);
  
  content.classList.toggle('active');
  icon.classList.toggle('active');
}

// 필터 칩 토글 함수
function toggleChip(element) {
  element.classList.toggle('active');
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
  const pinnedSection = document.getElementById('pinnedSection');
  
  // dragover 이벤트 - 드래그 중일 때
  pinnedSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    pinnedSection.classList.add('drag-over');
  });
  
  // dragleave 이벤트 - 드래그가 영역을 벗어날 때
  pinnedSection.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 자식 요소로 이동하는 경우 제외
    if (e.target === pinnedSection) {
      pinnedSection.classList.remove('drag-over');
    }
  });
  
  // drop 이벤트 - 드롭했을 때
  pinnedSection.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    pinnedSection.classList.remove('drag-over');
    
    // 드래그된 데이터 가져오기
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    
    if (url) {
      await handleDroppedUrl(url);
    }
  });
}

// 드롭된 URL 처리
async function handleDroppedUrl(url) {
  try {
    // URL 유효성 검사
    const urlObj = new URL(
      url.startsWith('http') ? url : `https://${url}`
    );

    // 쇼핑몰인지 확인
    const supportedSites = [
      'shopping.naver.com',
      'coupang.com',
      'gmarket.co.kr',
      '11st.co.kr',
      'wemakeprice.com',
      'shopping.kakao.com',
      'taobao.com',
      'amazon.com',
      'aliexpress.com'
    ];
    
    const isSupportedSite = supportedSites.some(site => url.includes(site));
    
    if (!isSupportedSite) {
      alert('지원하지 않는 쇼핑몰입니다.\n지원 쇼핑몰: 네이버, 쿠팡, G마켓, 11번가, 위메프, 카카오, 타오바오, 아마존, 알리익스프레스');
      return;
    }
    
    // 플랫폼 감지
    let platform = 'Unknown';
    if (url.includes('shopping.naver.com')) platform = '네이버 쇼핑';
    else if (url.includes('coupang.com')) platform = '쿠팡';
    else if (url.includes('gmarket.co.kr')) platform = 'G마켓';
    else if (url.includes('11st.co.kr')) platform = '11번가';
    else if (url.includes('wemakeprice.com')) platform = '위메프';
    else if (url.includes('shopping.kakao.com')) platform = '카카오 쇼핑';
    else if (url.includes('taobao.com')) platform = '타오바오';
    else if (url.includes('amazon.com')) platform = '아마존';
    else if (url.includes('aliexpress.com')) platform = '알리익스프레스';
    
    // URL에서 키워드 추출 시도
    const keyword = extractKeywordFromUrl(url);

    // 새로운 상품 객체 생성
    const newProduct = {
      id: `dropped-${Date.now()}`,
      title: keyword || `${platform} 상품`,
      price: 0,
      image: FIXED_ICON, // generatePlaceholderImage(platform),
      rating: '0.0',
      reviews: 0,
      url: url,
      shipping: '정보 없음',
      platform: platform,
      score: 0
    };
    
    // 이미 같은 URL이 있는지 확인
    const exists = pinnedProducts.some(p => p.url === url);
    if (exists) {
      alert('이미 고정된 상품입니다.');
      return;
    }
    
    
    // 핀 추가
    pinnedProducts.push(newProduct);
    savePinnedProducts();
    displayPinnedSection();
    
    // 성공 메시지
    showSuccessMessage(`${platform} 상품이 고정되었습니다!`);
    
  } catch (e) {
    console.error('URL 처리 에러:', e);
    alert('올바른 URL이 아닙니다.');
    alert(e);
  }
}

// 플레이스홀더 이미지 생성
function generatePlaceholderImage(platform) {
  const colors = {
    '네이버 쇼핑': '#03C75A',
    '쿠팡': '#346AFF',
    'G마켓': '#EA0B0B',
    '11번가': '#FF0000',
    '위메프': '#FB0A5B',
    '카카오 쇼핑': '#FFE812',
    '타오바오': '#FF6A00',
    '아마존': '#FF9900',
    '알리익스프레스': '#E62E04'
  };
  
  const color = colors[platform] || '#cccccc';
  
  const svgImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="${color}" opacity="0.2"/>
      <text x="50%" y="40%" text-anchor="middle" fill="${color}" font-family="Arial" font-size="14" font-weight="bold">${platform}</text>
      <text x="50%" y="60%" text-anchor="middle" fill="#666" font-family="Arial" font-size="12">🔗 Link</text>
    </svg>
  `)}`;
  
  return svgImage;
}

// 성공 메시지 표시
function showSuccessMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: bold;
  `;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.transition = 'opacity 0.3s';
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.remove(), 300);
  }, 2000);
}

// 저장된 핀 상품 불러오기
function loadPinnedProducts() {
  chrome.storage.local.get(['pinnedProducts'], (result) => {
    if (result.pinnedProducts) {
      pinnedProducts = result.pinnedProducts;
    }
    displayPinnedSection();
  });
}

// 핀 상품 저장
function savePinnedProducts() {
  chrome.storage.local.set({ pinnedProducts: pinnedProducts });
}

// 핀 토글
function togglePin(product) {
  const index = pinnedProducts.findIndex(p => p.id === product.id);
  
  if (index > -1) {
    pinnedProducts.splice(index, 1);
  } else {
    pinnedProducts.push(product);
  }
  
  savePinnedProducts();
  displayPinnedSection();
  updatePinButtons();
}

// 핀 버튼 상태 업데이트
function updatePinButtons() {
  document.querySelectorAll('.pin-btn').forEach(btn => {
    const productId = btn.dataset.productId;
    const isPinned = pinnedProducts.some(p => p.id === productId);
    
    if (isPinned) {
      btn.classList.add('pinned');
      btn.innerHTML = '📌';
    } else {
      btn.classList.remove('pinned');
      btn.innerHTML = '📍';
    }
  });
}

// 핀 섹션 표시
function displayPinnedSection() {
  const pinnedList = document.getElementById('pinnedList');
  const pinnedCount = document.getElementById('pinnedCount');
  
  pinnedCount.textContent = pinnedProducts.length;
  
  if (pinnedProducts.length > 0) {
    pinnedList.innerHTML = '';
    
    pinnedProducts.forEach((product, index) => {
      const cardHTML = createProductCardHTML(product, index, true);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardHTML;
      const card = tempDiv.firstElementChild;
      
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('pin-btn')) {
          chrome.tabs.create({ url: product.url });
        }
      });
      
      const pinBtn = card.querySelector('.pin-btn');
      pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePin(product);
      });
      
      pinnedList.appendChild(card);
    });
  } else {
    pinnedList.innerHTML = `
      <div class="pinned-empty">
        No pinned products yet. Click the pin button on any product to save it here!<br>
        Or drag & drop a product link from any shopping site!
      </div>
    `;
  }
}

// 모든 핀 제거
function clearAllPinned() {
  if (pinnedProducts.length === 0) {
    return;
  }
  
  if (confirm('정말 모든 고정된 상품을 제거하시겠습니까?')) {
    pinnedProducts = [];
    savePinnedProducts();
    displayPinnedSection();
    updatePinButtons();
  }
}

// 상품 카드 HTML 생성
function createProductCardHTML(product, index, isPinnedSection = false) {
  const isPinned = pinnedProducts.some(p => p.id === product.id);
  
  return `
    <div class="product-card" data-url="${product.url}" data-product-id="${product.id}">
      <div class="image-wrapper">
        ${!isPinnedSection ? `<div class="rank-badge ${index < 3 ? 'top3' : ''}">${index + 1}</div>` : ''}
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="content">
        <div class="platform-badge">${product.platform}</div>
        <div class="title">${product.title}</div>
        <div class="price">${product.price > 0 ? formatPrice(product.price) + '원' : '가격 정보 없음'}</div>
        <div class="meta">
          <span class="rating">⭐ ${product.rating}</span>
          <span>리뷰 ${formatNumber(product.reviews)}</span>
          <span class="shipping">${product.shipping}</span>
        </div>
      </div>
      <button class="pin-btn ${isPinned ? 'pinned' : ''}" data-product-id="${product.id}">
        ${isPinned ? '📌' : '📍'}
      </button>
    </div>
  `;
}

// 페이지 로드 시 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accordion-header').forEach((header, index) => {
    header.addEventListener('click', () => {
      toggleAccordion('filter' + index);
    });
  });
  
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      toggleChip(e.target);
    });
  });
  
  document.getElementById('clearPinnedBtn').addEventListener('click', clearAllPinned);
  
  checkPendingActions();
});

// Pending 작업 확인 및 처리
function checkPendingActions() {
  chrome.storage.local.get(['pendingUrl', 'pendingSearch', 'action'], (result) => {
    if (result.action === 'compareUrl' && result.pendingUrl) {
      const keyword = extractKeywordFromUrl(result.pendingUrl);
      if (keyword) {
        searchInput.value = keyword;
        searchProducts(keyword);
      }
      chrome.storage.local.remove(['pendingUrl', 'action']);
    }
    
    if (result.action === 'compareText' && result.pendingSearch) {
      searchInput.value = result.pendingSearch;
      searchProducts(result.pendingSearch);
      chrome.storage.local.remove(['pendingSearch', 'action']);
    }
  });
}

// URL에서 키워드 추출
function extractKeywordFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    if (url.includes('shopping.naver.com')) {
      return params.get('query') || params.get('nvMid') || '';
    }
    if (url.includes('coupang.com')) {
      return params.get('q') || '';
    }
    if (url.includes('gmarket.co.kr')) {
      return params.get('keyword') || '';
    }
    if (url.includes('11st.co.kr')) {
      return params.get('kwd') || '';
    }
    
    const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
    return decodeURIComponent(pathParts[pathParts.length - 1] || '');
  } catch (e) {
    console.error('URL 파싱 에러:', e);
    return '';
  }
}

// 검색 버튼 클릭
searchBtn.addEventListener('click', () => {
  const keyword = searchInput.value.trim();
  if (keyword) {
    searchProducts(keyword);
  }
});

// Enter 키로 검색
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const keyword = searchInput.value.trim();
    if (keyword) {
      searchProducts(keyword);
    }
  }
});

// 상품 검색
async function searchProducts(keyword) {
  emptyState.style.display = 'none';
  loading.style.display = 'block';
  results.innerHTML = '';
  currentDisplayCount = 10;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'searchProducts',
      keyword: keyword
    });

    if (response.success) {
      displayResults(response.data, keyword);
    } else {
      showError('검색 중 오류가 발생했습니다.');
    }
  } catch (error) {
    showError('검색 중 오류가 발생했습니다: ' + error.message);
  } finally {
    loading.style.display = 'none';
  }
}

// 검색 결과 표시
function displayResults(data, keyword) {
  results.innerHTML = '';
  
  let allProducts = [];
  data.forEach(platformData => {
    platformData.products.forEach(product => {
      allProducts.push({
        ...product,
        platform: platformData.platform
      });
    });
  });
  
  allProductsCache = calculateScores(allProducts);
  
  const header = document.createElement('div');
  header.className = 'results-header';
  header.innerHTML = `
    <h2>Matched Products</h2>
    <p>Showing top ${Math.min(currentDisplayCount, allProductsCache.length)} of ${allProductsCache.length} products</p>
  `;
  results.appendChild(header);
  
  const productsContainer = document.createElement('div');
  productsContainer.id = 'productsContainer';
  results.appendChild(productsContainer);
  
  renderProducts();
  
  if (currentDisplayCount < allProductsCache.length) {
    addLoadMoreButton();
  }
  
  showScrollToTopButton();
}

// 상품 렌더링 함수
function renderProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  
  const startIndex = container.children.length;
  const endIndex = Math.min(currentDisplayCount, allProductsCache.length);
  const productsToAdd = allProductsCache.slice(startIndex, endIndex);
  
  productsToAdd.forEach((product, index) => {
    const actualIndex = startIndex + index;
    const cardHTML = createProductCardHTML(product, actualIndex, false);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML;
    const card = tempDiv.firstElementChild;
    
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('pin-btn')) {
        chrome.tabs.create({ url: product.url });
      }
    });
    
    const pinBtn = card.querySelector('.pin-btn');
    pinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePin(product);
    });
    
    container.appendChild(card);
  });
  
  updateHeader();
}

// 더보기 버튼 추가
function addLoadMoreButton() {
  const existingButton = results.querySelector('.load-more-btn');
  if (existingButton) {
    existingButton.remove();
  }
  
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'load-more-btn';
  const remaining = allProductsCache.length - currentDisplayCount;
  loadMoreBtn.textContent = `Load More (${remaining} more products)`;
  
  loadMoreBtn.addEventListener('click', () => {
    currentDisplayCount += 10;
    loadMoreBtn.remove();
    renderProducts();
    
    if (currentDisplayCount < allProductsCache.length) {
      addLoadMoreButton();
    }
  });
  
  results.appendChild(loadMoreBtn);
}

// 헤더 업데이트
function updateHeader() {
  const header = results.querySelector('.results-header');
  if (header) {
    const displayedCount = document.getElementById('productsContainer').children.length;
    header.innerHTML = `
      <h2>Matched Products</h2>
      <p>Showing top ${displayedCount} of ${allProductsCache.length} products</p>
    `;
  }
}

// 맨위로 버튼 표시
function showScrollToTopButton() {
  const existingBtn = document.getElementById('scrollToTopBtn');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  const scrollBtn = document.createElement('button');
  scrollBtn.id = 'scrollToTopBtn';
  scrollBtn.className = 'scroll-to-top-btn';
  scrollBtn.innerHTML = '↑';
  scrollBtn.style.display = 'none';
  
  scrollBtn.addEventListener('click', () => {
    document.querySelector('.container').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  document.body.appendChild(scrollBtn);
  
  const container = document.querySelector('.container');
  container.addEventListener('scroll', () => {
    if (container.scrollTop > 300) {
      scrollBtn.style.display = 'flex';
    } else {
      scrollBtn.style.display = 'none';
    }
  });
}

// ML/DL 기반 점수 계산
function calculateScores(products) {
  return products.map(product => {
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    const priceScore = Math.max(0, 30 - ((product.price - avgPrice) / avgPrice * 30));
    const ratingScore = (parseFloat(product.rating) / 5) * 30;
    const maxReviews = Math.max(...products.map(p => p.reviews));
    const reviewScore = maxReviews > 0 ? (product.reviews / maxReviews) * 20 : 0;
    const shippingScore = product.shipping.includes('무료') ? 20 : 10;
    const totalScore = priceScore + ratingScore + reviewScore + shippingScore;
    
    return {
      ...product,
      score: Math.round(totalScore)
    };
  }).sort((a, b) => b.score - a.score);
}

// 가격 포맷팅
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 숫자 포맷팅
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 에러 표시
function showError(message) {
  results.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; color: #f44336;">
      ${message}
    </div>
  `;
}

// 감지된 상품 표시
function showDetectedProduct(product) {
  detectedProduct = product;
  detectedProductDiv.style.display = 'block';
  detectedProductDiv.innerHTML = `
    <div class="detected-product">
      <h3>현재 보고 있는 상품</h3>
      <div class="product-info">
        ${product.image ? `<img src="${product.image}" alt="${product.title}">` : ''}
        <div class="info">
          <div class="title">${product.title}</div>
          <div class="price">${formatPrice(product.price)}원</div>
          <button id="compareBtn" style="
            margin-top: 10px;
            padding: 8px 16px;
            background: #5a6268;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          ">다른 쇼핑몰과 비교하기</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('compareBtn').addEventListener('click', () => {
    searchInput.value = product.title;
    searchProducts(product.title);
  });
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'productDetected') {
    showDetectedProduct(request.product);
  }
});

// 페이지 로드 시 저장된 상품 확인
chrome.storage.local.get(['detectedProduct'], (result) => {
  if (result.detectedProduct && result.detectedProduct.title) {
    showDetectedProduct(result.detectedProduct);
  }
});
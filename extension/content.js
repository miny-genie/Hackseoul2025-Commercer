// 현재 페이지에서 상품 정보 추출
function detectProductInfo() {
  const product = {
    title: '',
    price: 0,
    image: '',
    platform: ''
  };
  
  // 네이버 쇼핑
  if (window.location.hostname.includes('naver.com')) {
    product.platform = '네이버 쇼핑';
    const titleEl = document.querySelector('.top_summary_title__ViyrM h2, .product_title');
    const priceEl = document.querySelector('.price_num__S2p_v, .price strong');
    const imageEl = document.querySelector('.image_thumb__JIGGX img, .product_image img');
    
    if (titleEl) product.title = titleEl.textContent.trim();
    if (priceEl) product.price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    if (imageEl) product.image = imageEl.src;
  }
  
  // 쿠팡
  else if (window.location.hostname.includes('coupang.com')) {
    product.platform = '쿠팡';
    const titleEl = document.querySelector('.prod-buy-header__title, h1.title');
    const priceEl = document.querySelector('.total-price strong, .price-value');
    const imageEl = document.querySelector('.prod-image__detail img');
    
    if (titleEl) product.title = titleEl.textContent.trim();
    if (priceEl) product.price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    if (imageEl) product.image = imageEl.src;
  }
  
  // G마켓
  else if (window.location.hostname.includes('gmarket.co.kr')) {
    product.platform = 'G마켓';
    const titleEl = document.querySelector('.itemtit, .item_tit');
    const priceEl = document.querySelector('.price_real, .price strong');
    const imageEl = document.querySelector('.item_photo img');
    
    if (titleEl) product.title = titleEl.textContent.trim();
    if (priceEl) product.price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    if (imageEl) product.image = imageEl.src;
  }
  
  // 11번가
  else if (window.location.hostname.includes('11st.co.kr')) {
    product.platform = '11번가';
    const titleEl = document.querySelector('.title, h1');
    const priceEl = document.querySelector('.price, .sale_price');
    const imageEl = document.querySelector('.img_product img');
    
    if (titleEl) product.title = titleEl.textContent.trim();
    if (priceEl) product.price = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    if (imageEl) product.image = imageEl.src;
  }
  
  return product;
}

// 페이지 로드 시 상품 감지
window.addEventListener('load', () => {
  const product = detectProductInfo();
  
  if (product.title) {
    // Background script에 상품 정보 전송
    chrome.runtime.sendMessage({
      action: 'detectProduct',
      product: product,
      url: window.location.href
    });
    
    // 비교하기 버튼 추가
    addCompareButton();
  }
});

// 비교하기 버튼 추가
function addCompareButton() {
  const button = document.createElement('button');
  button.id = 'smart-shopping-compare-btn';
  button.innerHTML = '🛒 다른 쇼핑몰과 비교하기';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  });
  
  button.addEventListener('click', () => {
    // Side panel 열기 요청
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  });
  
  document.body.appendChild(button);
}
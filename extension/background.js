// Side panel 활성화
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 확장 프로그램 아이콘 클릭 시 side panel 열기
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// 우클릭 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "compareLink",
    title: "Commercer로 비교하기",
    contexts: ["link"]
  });
  
  chrome.contextMenus.create({
    id: "compareImage",
    title: "이 상품 비교하기",
    contexts: ["image"]
  });
  
  chrome.contextMenus.create({
    id: "compareText",
    title: "선택한 상품명으로 검색",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "comparePage",
    title: "이 페이지 상품 비교하기",
    contexts: ["page"]
  });
});

// 우클릭 메뉴 클릭 처리
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "compareLink") {
    chrome.storage.local.set({ 
      pendingUrl: info.linkUrl,
      action: 'compareUrl'
    });
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
  
  if (info.menuItemId === "compareImage") {
    chrome.storage.local.set({ 
      pendingUrl: info.pageUrl,
      action: 'compareUrl'
    });
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
  
  if (info.menuItemId === "compareText") {
    chrome.storage.local.set({ 
      pendingSearch: info.selectionText,
      action: 'compareText'
    });
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
  
  if (info.menuItemId === "comparePage") {
    chrome.storage.local.set({ 
      pendingUrl: info.pageUrl,
      action: 'compareUrl'
    });
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Content script로부터 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectProduct') {
    chrome.storage.local.set({ 
      detectedProduct: request.product,
      currentUrl: request.url 
    });
    
    chrome.runtime.sendMessage({
      action: 'productDetected',
      product: request.product
    }).catch(() => {});
  }
  
  if (request.action === 'searchProducts') {
    searchMultiplePlatforms(request.keyword)
      .then(results => sendResponse({ success: true, data: results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// 여러 쇼핑 플랫폼에서 상품 검색 (각 플랫폼당 10~15개씩)
async function searchMultiplePlatforms(keyword) {
  const platforms = [
    { name: '네이버 쇼핑', url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(keyword)}`, count: 12 },
    { name: '쿠팡', url: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`, count: 15 },
    { name: 'G마켓', url: `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(keyword)}`, count: 10 },
    { name: '11번가', url: `https://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(keyword)}`, count: 13 },
    { name: '위메프', url: `https://search.wemakeprice.com/search?search_cate=top&search_keyword=${encodeURIComponent(keyword)}`, count: 10 },
    { name: '카카오 쇼핑', url: `https://shopping.kakao.com/search/keyword?keyword=${encodeURIComponent(keyword)}`, count: 12 },
    { name: '타오바오', url: `https://world.taobao.com/search/search.htm?q=${encodeURIComponent(keyword)}`, count: 14 },
    { name: '아마존', url: `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`, count: 12 },
    { name: '알리익스프레스', url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword)}`, count: 12 }
  ];
  
  return platforms.map(platform => ({
    platform: platform.name,
    url: platform.url,
    products: generateDemoProducts(platform.name, keyword, platform.count)
  }));
}

// 데모 상품 생성 (플랫폼당 지정된 개수만큼)
function generateDemoProducts(platform, keyword, count) {
  // 더 안정적인 이미지 URL 배열
  const imageUrls = [
    'https://dummyimage.com/150x150/cccccc/000000&text=Product+1',
    'https://dummyimage.com/150x150/dddddd/000000&text=Product+2',
    'https://dummyimage.com/150x150/eeeeee/000000&text=Product+3',
    'https://dummyimage.com/150x150/cccccc/000000&text=Product+4',
    'https://dummyimage.com/150x150/dddddd/000000&text=Product+5',
    'https://dummyimage.com/150x150/eeeeee/000000&text=Product+6',
    'https://dummyimage.com/150x150/cccccc/000000&text=Product+7',
    'https://dummyimage.com/150x150/dddddd/000000&text=Product+8',
    'https://dummyimage.com/150x150/eeeeee/000000&text=Product+9',
    'https://dummyimage.com/150x150/cccccc/000000&text=Product+10',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${platform}-${i}`,
    title: `${keyword} - ${platform} 상품 ${i + 1}`,
    price: Math.floor(Math.random() * 100000) + 10000,
    image: imageUrls[i % imageUrls.length], // 순환해서 사용
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 1000),
    url: `https://example.com/product/${platform}-${i}`,
    shipping: Math.random() > 0.5 ? '무료배송' : '배송비 3,000원',
    score: 0
  }));
}
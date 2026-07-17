# Apps Script 게시글별 다중 상품 위젯

`PostProductWidget.gs`는 하나의 게시글 키에 여러 상품 URL을 저장하고, 웹앱 URL 하나로 상품 리스트 위젯을 출력합니다.

## 설치

1. Google 스프레드시트를 새로 만듭니다.
2. **확장 프로그램 → Apps Script**를 열고 `PostProductWidget.gs` 내용을 붙여넣습니다.
3. `setupPostProductWidget()`을 한 번 실행합니다.
4. **배포 → 새 배포 → 웹 앱**으로 배포합니다.
   - 실행 사용자: 나
   - 액세스 권한: 모든 사용자

## 상품 묶음 등록

웹앱 주소로 JSON POST 요청을 보냅니다.

```json
{
  "post_key": "summer-gadgets",
  "title": "여름용 가성비 IT 상품",
  "description": "한 게시글에서 여러 상품을 비교합니다.",
  "products": [
    {
      "name": "휴대용 선풍기",
      "url": "https://example.com/product-1",
      "image": "https://example.com/product-1.jpg",
      "original_price": 29.99,
      "sale_price": 19.99,
      "currency": "USD",
      "coupon_code": "SUMMER5",
      "badge": "추천",
      "note": "쿠폰 적용 후 가격"
    },
    {
      "name": "미니 보조배터리",
      "url": "https://example.com/product-2",
      "image": "https://example.com/product-2.jpg",
      "original_price": 24.99,
      "sale_price": 16.99,
      "currency": "USD",
      "badge": "인기"
    }
  ]
}
```

같은 `post_key`로 다시 POST하면 해당 게시글의 상품 목록 전체가 교체됩니다.

## 게시글 삽입

```html
<iframe
  id="priceTrackerPostWidget"
  src="YOUR_APPS_SCRIPT_WEB_APP_URL?mode=widget&post=summer-gadgets"
  style="width:100%;border:0;overflow:hidden"
  scrolling="no"
  loading="lazy">
</iframe>

<script>
window.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'priceTrackerResize') {
    document.getElementById('priceTrackerPostWidget').style.height = event.data.height + 'px';
  }
});
</script>
```

## API

- 위젯: `?mode=widget&post=summer-gadgets`
- JSON 확인: `?mode=json&post=summer-gadgets`
- 상태 확인: `?mode=health`

## 데이터 구조

스크립트가 다음 시트를 자동 생성합니다.

- `Posts`: 게시글 제목과 설명
- `PostProducts`: 게시글별 상품 URL, 가격, 쿠폰, 이미지, 정렬 순서

한 게시글에는 최대 50개 상품을 등록할 수 있습니다.

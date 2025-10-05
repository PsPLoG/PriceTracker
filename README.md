```
<div style="max-width: 800px; margin: 20px auto;">
    <iframe 
        id="priceWidget1"
        src="https://psplog.github.io/PriceTracker/widget.html?id=1"
        style="width: 100%; border: none; overflow: hidden;"
        scrolling="no"
        frameborder="0">
    </iframe>
</div>

<script>
window.addEventListener('message', function(e) {
    if (e.data.type === 'resize') {
        document.getElementById('priceWidget1').style.height = e.data.height + 'px';
    }
});
</script>
```

```
{
  "promotion": {
    "name": "가을 특가 프로모션",
    "start_date": "2025-10-01",
    "end_date": "2025-10-31"
  },
  "discount_codes": [
    {
      "code": "AEPPOM0802",
      "min_price": 19,
      "discount": 2,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0804",
      "min_price": 35,
      "discount": 4,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0807",
      "min_price": 55,
      "discount": 7,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0811",
      "min_price": 89,
      "discount": 11,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0817",
      "min_price": 139,
      "discount": 17,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0823",
      "min_price": 210,
      "discount": 23,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0838",
      "min_price": 349,
      "discount": 38,
      "note": "일부상품 적용 불가"
    },
    {
      "code": "AEPPOM0862",
      "min_price": 559,
      "discount": 62,
      "note": "일부상품 적용 불가"
    }
  ],
  "card_discounts": [
    {
      "card_name": "알리익스프레스 신한카드",
      "min_price": 50,
      "discount": 25,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "Kakao Bank Mastercard",
      "min_price": 50,
      "discount": 8,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "신한 Mastercard",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "삼성 Mastercard",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "롯데 Mastercard",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "하나 Mastercard",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "BC Baro Mastercard",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "NH Card",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "KB VISA Card",
      "min_price": 100,
      "discount": 15,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "네이버페이 Moneycard",
      "min_price": 100,
      "discount": 10,
      "note": "직구 상품에만 적용 가능"
    },
    {
      "card_name": "하나 트래블로그 신용카드",
      "min_price": 300,
      "discount": 50,
      "note": "직구 상품에만 적용 가능"
    }
  ]
}

```

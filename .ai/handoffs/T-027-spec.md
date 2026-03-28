Author: Claude (PM)

# T-027 Spec — 상단 바 아이콘 제거

## 배경

`top-app-bar.tsx`에 `icon-192.png` (22×22) 아이콘이 "World Break" 텍스트 왼쪽에 표시되고 있음.
로고 아이콘과 로고 텍스트가 나란히 있는 구조가 어울리지 않아 제거 요청.

## 변경 범위

### `components/top-app-bar.tsx`

- `<Image src="/icons/icon-192.png" ... />` 요소 삭제
- "World Break" 텍스트 링크는 유지 (`<Link href="/dashboard">`)
- `import Image from "next/image"` — Image 사용 없어지면 import도 제거

### 변경 전/후

```
변경 전:
[🔷 아이콘] WORLD BREAK

변경 후:
WORLD BREAK
```

## 범위 밖

- "World Break" 텍스트 스타일 변경 없음
- 헤더 레이아웃 구조 변경 없음

## 검증

- `npm run build` 통과
- 모든 페이지 상단 바에서 아이콘 미노출 확인

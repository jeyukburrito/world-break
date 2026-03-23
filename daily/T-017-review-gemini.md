Author: Gemini (Code Reviewer)

# T-017 Review — Match Share Card (Stateless OG Image)

**리뷰어**: Gemini  
**날짜**: 2026-03-23  
**판정**: `APPROVE`

---

## Review Summary
- T-017 spec에 정의된 스테이트리스(stateless) 매치 공유 기능을 성공적으로 구현함.
- `next/og`를 사용하여 1200x630 OG 이미지를 동적으로 생성하며, 필수 파라미터 누락 시 폴백 카드를 제공함.
- 폰트 로딩 최적화를 위해 Noto Sans KR subset fetch와 500ms 임계치(threshold) 로직을 도입하여 성능과 가독성을 동시에 고려함.
- `/share/match` 공개 페이지를 통해 외부 서비스(Discord, Twitter 등)에서의 소셜 프리뷰가 정상적으로 작동하도록 메타데이터를 구성함.

## Pass
- [x] **스테이트리스 공유**: 별도의 DB 저장 없이 URL 쿼리 스트링만으로 매치 정보를 전달 및 렌더링함.
- [x] **OG 이미지 생성**: `/api/og/match` 엔드포인트에서 `ImageResponse`를 통해 PNG 이미지를 반환함.
- [x] **공유 페이지**: `/share/match` 페이지에서 이미지 및 상세 정보 표시, CTA 버튼 제공.
- [x] **공유 버튼**: 매치 카드(Single, Tournament)에 Web Share API 및 클립보드 복사 폴백이 적용된 공유 버튼 추가.
- [x] **인증 예외**: `middleware.ts`의 `PUBLIC_PATHS`에 `/share` 및 `/api/og`를 추가하여 비로그인 접근 허용.
- [x] **폰트 스파이크**: Noto Sans KR 로딩 시간을 측정하여 임계치 초과 시 Inter로 폴백하는 로직 구현.

## Issues
- 특이사항 없음. 로컬 네트워크 환경에서는 Noto Sans KR 로딩이 500ms를 초과할 수 있으나, 배포 환경(Edge Runtime)에서의 실제 지연 시간 확인이 필요함.

## Decision
- `APPROVE`

## Notes
- `components/toast.tsx`를 확장하여 런타임 이벤트 기반 토스트를 지원하도록 개선한 점이 효율적임.
- `lib/share/match-share.ts`에 로직을 중앙 집중화하여 유지보수성을 높임.

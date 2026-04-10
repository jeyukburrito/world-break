Author: Claude (PM)

# T-034 Spec — 데스크톱 타이틀/프로필 노출 개선

## 배경

T-033(Adaptive Shell)에서 `TopAppBar`가 `md:hidden`으로 숨겨지면서 데스크톱 화면에서
현재 페이지 제목과 프로필(아바타) 링크가 표시되지 않게 됨.

추가로 `TopAppBar` 컴포넌트가 `title` prop을 받도록 타입에 정의되어 있지만
실제로 렌더링하지 않는 버그도 함께 수정.

---

## 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `components/app-shell.tsx` | `<main>` 상단에 데스크톱 전용 헤더 행 추가 |
| `components/top-app-bar.tsx` | `title` prop 미사용 잔재 제거 (타입에서 삭제) |

**수정하지 않을 파일:** `components/side-nav.tsx`, `components/bottom-nav.tsx`, 개별 페이지 파일

---

## 상세 구현 명세

### 1. `components/app-shell.tsx`

`<main>` 안 `{children}` 바로 위에 데스크톱 전용 헤더 행 추가.

```tsx
// 기존:
<main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-28 md:max-w-3xl md:px-8 md:py-6 md:pb-6">
  {children}
</main>

// 교체 후:
<main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-28 md:max-w-3xl md:px-8 md:py-6 md:pb-6">
  <div className="mb-6 hidden items-center justify-between md:flex">
    <h1 className="text-xl font-semibold text-ink">{title}</h1>
    {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
  </div>
  {children}
</main>
```

`mb-6`은 기존 페이지 콘텐츠와의 간격. `hidden md:flex`로 모바일에서는 완전히 숨김.

### 2. `components/top-app-bar.tsx`

`title` prop이 타입에 정의되어 있으나 렌더링에 사용되지 않음. 잔재 제거.

```tsx
// 기존:
type TopAppBarProps = {
  title?: string;
  right?: ReactNode;
};
export function TopAppBar({ right }: TopAppBarProps) {

// 교체 후:
type TopAppBarProps = {
  right?: ReactNode;
};
export function TopAppBar({ right }: TopAppBarProps) {
```

`AppShell`에서 TopAppBar를 호출할 때 `title={title}` prop도 제거:

```tsx
// 기존:
<TopAppBar title={title} right={headerRight} />

// 교체 후:
<TopAppBar right={headerRight} />
```

---

## 검증

```bash
npm run build
```

빌드 통과 후 육안 확인:
- 데스크톱(≥768px): `<main>` 상단에 현재 페이지 제목 + 프로필 아이콘 표시
- 모바일(<768px): 추가된 헤더 행이 보이지 않음, 기존 TopAppBar 정상 표시
- 모든 페이지(dashboard, matches, matches/new, matches/[id]/edit, settings)에서 제목 확인

---

## 주의사항

- `AppShell`을 사용하는 개별 페이지 파일은 수정하지 말 것 (title prop은 이미 모두 넘기고 있음)
- `headerRight`가 없는 페이지에서도 레이아웃이 깨지지 않아야 함 (`{headerRight ? ... : null}` 조건부)
- 데스크톱 헤더 행의 `mb-6` 간격은 기존 `md:py-6` padding과 시각적으로 자연스러운지 확인

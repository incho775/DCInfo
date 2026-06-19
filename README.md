# DCInfo

디시인사이드(gall.dcinside.com) 작성자 정보 표시 및 편의 기능 **Firefox 확장 프로그램**입니다.
본 앱은 **MacOS 환경의 Firefox**에서만 테스트되었습니다.

## ✨ 주요 기능

- **IP 정보 표시** — 작성자 IP의 통신사를 판별해 닉네임 옆에 표시 (색상 구분: SK 🔴 / KT 🟢 / LG 🔵 / 그 외 국내 🟡 / 외국 🟣), 외국 IP는 토르·프록시 여부까지 식별
- **비고정닉 ID 표시** — 유동닉/신규 고정닉의 식별자를 닉네임 옆에 표시
- **작성일 표시** — 오늘 글은 작성 시각으로 표시
- **차단** — 닉네임 좌클릭 시 뜨는 네이티브 메뉴를 글래스 UI로 통합, 팝업에서 **차단 목록 조회·해제**
- **작성자 메모** — 닉네임 옆 배지 + 호버 툴팁으로 메모 표시·편집 (`chrome.storage` 로컬 저장)
- **자동 갱신** — 게시글 목록을 설정 주기로 자동 새로고침
- **향상된 페이지네이션** — 페이지 이동 시 새로고침 없이 목록 갱신
- **통신사 IP 차단** — 모바일 통신사 IP 일괄 차단

## 📦 설치 (Firefox)

[GitHub 릴리스](https://github.com/incho775/DCInfo/releases/latest)에서 .xpi 파일을 직접 내려받아 설치합니다.

1. Firefox에서 [최신 릴리스](https://github.com/incho775/DCInfo/releases/latest)의 `DCInfo-x.y.z.xpi` 파일을 엽니다 — 클릭하면 설치 창이 바로 뜹니다.
   - 또는 파일을 내려받은 뒤 `about:addons` → 우측 상단 ⚙️ → **파일에서 부가 기능 설치(Install Add-on From File)** 로 선택
2. 권한 확인 후 **추가(Add)** 클릭
3. `gall.dcinside.com` 갤러리에서 동작 확인

> Firefox 데스크톱 **140 이상**, Android는 **142 이상** 필요.

## 🛠 개발자용 설치 (임시 로드)

소스에서 직접 로드해 개발·테스트할 때 사용합니다. 서명이 필요 없는 대신 Firefox를 재시작하면 사라집니다.

1. Firefox 주소창에 `about:debugging` 입력
2. **이 Firefox(This Firefox)** → **임시 부가 기능 로드(Load Temporary Add-on)**
3. 이 저장소의 `manifest.json` 선택
4. `gall.dcinside.com` 갤러리에서 동작 확인

> 임시 부가 기능은 Firefox 재시작 시 사라집니다.

## 🗂 프로젝트 구조

콘텐츠 스크립트는 기능별 모듈로 분리되어 있습니다 (`manifest.json`의 로드 순서대로):

| 파일 | 역할 |
|---|---|
| `data.js` | 통신사/프록시/토르 IP 데이터 |
| `core.js` | 설정·전역·공통 유틸 |
| `ip.js` | IP 정보(통신사·외국 판별·표시) |
| `block.js` | 차단(통신사 IP·사용자 차단·해제) |
| `writer.js` | 작성자 표시(닉 ID·날짜·새 탭·메모 배지) |
| `memo.js` | 메모 편집기·툴팁·배지 핸들러 |
| `native-popup.js` | 네이티브 닉네임 팝업 통합 |
| `refresh.js` | 자동 갱신·페이지네이션·로더 |
| `main.js` | 초기화·메시지·진입점 |
| `hidpi.js` | HiDPI 스프라이트/폰트 CSS 주입 |
| `popup.html` / `popup.js` | 설정 팝업 |
| `background.js` | 설치/업데이트 기본값 |

## 📄 라이선스

이 프로젝트는 [GNU General Public License v3.0](LICENSE)을 따릅니다.

```
Copyright (C) 2026 incho775

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```
